package api

import (
	"encoding/json"
	"net/http"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/timestamppb"

	commonpb "github.com/aptiverse/event-architecture/gen/proto/aptiverse/common/v1"
	"github.com/aptiverse/event-architecture/internal/broker/kafka"
	"github.com/aptiverse/event-architecture/internal/broker/rabbitmq"
	"github.com/aptiverse/event-architecture/internal/config"
	"github.com/aptiverse/event-architecture/internal/dedup"
	"github.com/aptiverse/event-architecture/internal/metrics"
	"github.com/aptiverse/event-architecture/internal/router"
	"github.com/aptiverse/event-architecture/internal/schema"
)

// EventRequest represents the JSON body for POST /api/v1/events.
type EventRequest struct {
	EventID       string            `json:"event_id"`
	EventType     string            `json:"event_type"`
	Source        string            `json:"source"`
	OccurredAt    *time.Time        `json:"occurred_at,omitempty"`
	CorrelationID string            `json:"correlation_id,omitempty"`
	ActorID       string            `json:"actor_id"`
	ActorRole     string            `json:"actor_role"`
	TenantID      string            `json:"tenant_id"`
	PartitionKey  string            `json:"partition_key,omitempty"`
	Payload       json.RawMessage   `json:"payload,omitempty"`
	Metadata      map[string]string `json:"metadata,omitempty"`
}

// BatchEventRequest wraps multiple events for POST /api/v1/events/batch.
type BatchEventRequest struct {
	Events []EventRequest `json:"events"`
}

// Handlers holds dependencies for HTTP handlers.
type Handlers struct {
	router     *router.Router
	dedup      *dedup.Deduplicator
	kafka      *kafka.Producer
	rabbitmq   *rabbitmq.Publisher
	cfg        *config.Config
	logger     *zap.Logger
}

// NewHandlers creates a new Handlers instance.
func NewHandlers(
	r *router.Router,
	d *dedup.Deduplicator,
	k *kafka.Producer,
	rmq *rabbitmq.Publisher,
	cfg *config.Config,
	logger *zap.Logger,
) *Handlers {
	return &Handlers{
		router:   r,
		dedup:    d,
		kafka:    k,
		rabbitmq: rmq,
		cfg:      cfg,
		logger:   logger,
	}
}

// PublishEvent handles POST /api/v1/events.
func (h *Handlers) PublishEvent(w http.ResponseWriter, r *http.Request) {
	// Check broker health before accepting events.
	if err := h.kafka.HealthCheck(); err != nil {
		if err2 := h.rabbitmq.HealthCheck(); err2 != nil {
			http.Error(w, "service unavailable: brokers unhealthy", http.StatusServiceUnavailable)
			return
		}
	}

	var req EventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := validateEventRequest(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	metrics.EventsReceivedTotal.WithLabelValues(req.EventType, req.Source).Inc()

	// Dedup check.
	if h.dedup.IsDuplicate(req.EventID) {
		metrics.EventsDeduplicatedTotal.WithLabelValues(req.Source).Inc()
		w.WriteHeader(http.StatusAccepted)
		json.NewEncoder(w).Encode(map[string]string{"status": "accepted"})
		return
	}

	env := toEnvelope(&req)

	if err := h.router.Dispatch(r.Context(), env); err != nil {
		h.logger.Error("failed to dispatch event",
			zap.String("event_id", req.EventID),
			zap.String("event_type", req.EventType),
			zap.Error(err),
		)
		// Still return 202 — event was queued for publish attempt.
		// Errors are handled via DLQ internally.
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{"status": "accepted", "event_id": req.EventID})
}

// PublishBatch handles POST /api/v1/events/batch.
func (h *Handlers) PublishBatch(w http.ResponseWriter, r *http.Request) {
	// Check broker health.
	if err := h.kafka.HealthCheck(); err != nil {
		if err2 := h.rabbitmq.HealthCheck(); err2 != nil {
			http.Error(w, "service unavailable: brokers unhealthy", http.StatusServiceUnavailable)
			return
		}
	}

	var req BatchEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if len(req.Events) == 0 {
		http.Error(w, "batch must contain at least one event", http.StatusBadRequest)
		return
	}

	if len(req.Events) > h.cfg.MaxBatchSize {
		http.Error(w, "batch size exceeds maximum", http.StatusBadRequest)
		return
	}

	source := "batch"
	if len(req.Events) > 0 {
		source = req.Events[0].Source
	}
	metrics.EventsBatchSize.WithLabelValues(source).Observe(float64(len(req.Events)))

	accepted := 0
	errors := 0

	for _, event := range req.Events {
		if err := validateEventRequest(&event); err != nil {
			errors++
			continue
		}

		metrics.EventsReceivedTotal.WithLabelValues(event.EventType, event.Source).Inc()

		if h.dedup.IsDuplicate(event.EventID) {
			metrics.EventsDeduplicatedTotal.WithLabelValues(event.Source).Inc()
			accepted++
			continue
		}

		env := toEnvelope(&event)

		if err := h.router.Dispatch(r.Context(), env); err != nil {
			h.logger.Error("failed to dispatch batch event",
				zap.String("event_id", event.EventID),
				zap.Error(err),
			)
		}
		accepted++
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   "accepted",
		"accepted": accepted,
		"errors":   errors,
	})
}

func validateEventRequest(req *EventRequest) error {
	if req.EventID == "" {
		return &validationError{"event_id is required"}
	}
	if req.EventType == "" {
		return &validationError{"event_type is required"}
	}
	if req.Source == "" {
		return &validationError{"source is required"}
	}
	if req.ActorID == "" {
		return &validationError{"actor_id is required"}
	}
	if req.ActorRole == "" {
		return &validationError{"actor_role is required"}
	}

	if err := schema.ValidateEventType(req.EventType); err != nil {
		return &validationError{err.Error()}
	}

	return nil
}

type validationError struct {
	msg string
}

func (e *validationError) Error() string {
	return e.msg
}

func toEnvelope(req *EventRequest) *commonpb.EventEnvelope {
	env := &commonpb.EventEnvelope{
		EventId:       req.EventID,
		EventType:     req.EventType,
		Source:        req.Source,
		CorrelationId: req.CorrelationID,
		ActorId:       req.ActorID,
		ActorRole:     req.ActorRole,
		TenantId:      req.TenantID,
		PartitionKey:  req.PartitionKey,
		Metadata:      req.Metadata,
	}

	if req.OccurredAt != nil {
		env.OccurredAt = timestamppb.New(*req.OccurredAt)
	} else {
		env.OccurredAt = timestamppb.Now()
	}

	if req.Payload != nil {
		env.Payload = []byte(req.Payload)
	}

	return env
}
