package router

import (
	"context"
	"fmt"
	"strings"

	"encoding/json"

	"go.uber.org/zap"

	commonpb "github.com/aptiverse/event-architecture/gen/proto/aptiverse/common/v1"
	"github.com/aptiverse/event-architecture/internal/broker/kafka"
	"github.com/aptiverse/event-architecture/internal/broker/rabbitmq"
	"github.com/aptiverse/event-architecture/internal/metrics"
)

// BrokerType identifies which broker an event should be routed to.
type BrokerType string

const (
	BrokerKafka    BrokerType = "kafka"
	BrokerRabbitMQ BrokerType = "rabbitmq"
)

// Route defines where an event_type prefix is sent.
type Route struct {
	Broker     BrokerType
	Topic      string // Kafka topic or RabbitMQ routing key
	KeySource  string // Field used to derive partition_key: actor_id, correlation_id, tenant_id
}

// DefaultRoutes returns the declarative event_type → broker mapping.
func DefaultRoutes() map[string]Route {
	return map[string]Route{
		// Kafka routes (streaming/analytics)
		"student.activity_logged":           {Broker: BrokerKafka, Topic: "aptiverse.student.activity", KeySource: "actor_id"},
		"student.strength_analysis":         {Broker: BrokerKafka, Topic: "aptiverse.student.strength", KeySource: "actor_id"},
		"student.journey_updated":           {Broker: BrokerKafka, Topic: "aptiverse.student.journey", KeySource: "actor_id"},
		"student.goal_created":              {Broker: BrokerKafka, Topic: "aptiverse.student.journey", KeySource: "actor_id"},
		"student.goal_progress":             {Broker: BrokerKafka, Topic: "aptiverse.student.journey", KeySource: "actor_id"},
		"assessment.sba_created":            {Broker: BrokerKafka, Topic: "aptiverse.assessment.lifecycle", KeySource: "actor_id"},
		"assessment.sba_goal_set":           {Broker: BrokerKafka, Topic: "aptiverse.assessment.lifecycle", KeySource: "actor_id"},
		"assessment.graded":                 {Broker: BrokerKafka, Topic: "aptiverse.assessment.lifecycle", KeySource: "actor_id"},
		"assessment.practice_generated":     {Broker: BrokerKafka, Topic: "aptiverse.assessment.practice", KeySource: "actor_id"},
		"assessment.practice_submitted":     {Broker: BrokerKafka, Topic: "aptiverse.assessment.practice", KeySource: "actor_id"},
		"analytics.ai_inference":            {Broker: BrokerKafka, Topic: "aptiverse.analytics.ai", KeySource: "correlation_id"},
		"analytics.audit":                   {Broker: BrokerKafka, Topic: "aptiverse.analytics.audit", KeySource: "tenant_id"},

		// RabbitMQ routes (commands/tasks)
		"notification.email":                {Broker: BrokerRabbitMQ, Topic: "notification.email", KeySource: "actor_id"},
		"notification.push":                 {Broker: BrokerRabbitMQ, Topic: "notification.push", KeySource: "actor_id"},
		"notification.sms":                  {Broker: BrokerRabbitMQ, Topic: "notification.sms", KeySource: "actor_id"},
		"payment.initiated":                 {Broker: BrokerRabbitMQ, Topic: "payment.process", KeySource: "actor_id"},
		"payment.completed":                 {Broker: BrokerRabbitMQ, Topic: "payment.process", KeySource: "actor_id"},
		"payment.failed":                    {Broker: BrokerRabbitMQ, Topic: "payment.process", KeySource: "actor_id"},
		"payment.subscription_changed":      {Broker: BrokerRabbitMQ, Topic: "payment.process", KeySource: "actor_id"},
		"tutor.match_requested":             {Broker: BrokerRabbitMQ, Topic: "tutor.match", KeySource: "actor_id"},
		"tutor.session_booked":              {Broker: BrokerRabbitMQ, Topic: "tutor.match", KeySource: "actor_id"},
		"tutor.session_completed":           {Broker: BrokerRabbitMQ, Topic: "tutor.match", KeySource: "actor_id"},
		"tutor.course_published":            {Broker: BrokerRabbitMQ, Topic: "tutor.match", KeySource: "actor_id"},
		"reward.verification_requested":     {Broker: BrokerRabbitMQ, Topic: "reward.verify", KeySource: "actor_id"},
		"reward.verified":                   {Broker: BrokerRabbitMQ, Topic: "reward.verify", KeySource: "actor_id"},
		"reward.granted":                    {Broker: BrokerRabbitMQ, Topic: "reward.grant", KeySource: "actor_id"},
		"calendar.sync_requested":           {Broker: BrokerRabbitMQ, Topic: "calendar.sync", KeySource: "actor_id"},
		"calendar.reminder_scheduled":       {Broker: BrokerRabbitMQ, Topic: "calendar.sync", KeySource: "actor_id"},
		"wellbeing.mood_checkin":            {Broker: BrokerRabbitMQ, Topic: "wellbeing.alert", KeySource: "actor_id"},
		"wellbeing.diary_entry":             {Broker: BrokerRabbitMQ, Topic: "wellbeing.alert", KeySource: "actor_id"},
		"wellbeing.stress_alert":            {Broker: BrokerRabbitMQ, Topic: "wellbeing.alert", KeySource: "actor_id"},
		"wellbeing.psychologist_referral":   {Broker: BrokerRabbitMQ, Topic: "wellbeing.referral", KeySource: "actor_id"},
	}
}

// Router dispatches events to Kafka or RabbitMQ based on event_type.
type Router struct {
	routes   map[string]Route
	kafka    *kafka.Producer
	rabbitmq *rabbitmq.Publisher
	logger   *zap.Logger
}

// New creates a Router with the default route table.
func New(kafkaProducer *kafka.Producer, rabbitPublisher *rabbitmq.Publisher, logger *zap.Logger) *Router {
	return &Router{
		routes:   DefaultRoutes(),
		kafka:    kafkaProducer,
		rabbitmq: rabbitPublisher,
		logger:   logger,
	}
}

// Dispatch routes an event envelope to the appropriate broker.
func (r *Router) Dispatch(ctx context.Context, env *commonpb.EventEnvelope) error {
	route, ok := r.resolveRoute(env.EventType)
	if !ok {
		return fmt.Errorf("no route for event_type: %s", env.EventType)
	}

	// Derive partition key if not explicitly set.
	if env.PartitionKey == "" {
		env.PartitionKey = r.derivePartitionKey(env, route.KeySource)
	}

	data, err := json.Marshal(env)
	if err != nil {
		return fmt.Errorf("marshal envelope: %w", err)
	}

	brokerLabel := string(route.Broker)

	switch route.Broker {
	case BrokerKafka:
		if err := r.kafka.Publish(ctx, route.Topic, env.PartitionKey, data); err != nil {
			metrics.EventsPublishErrorsTotal.WithLabelValues(env.EventType, brokerLabel).Inc()
			return err
		}
	case BrokerRabbitMQ:
		if err := r.rabbitmq.Publish(ctx, route.Topic, data); err != nil {
			metrics.EventsPublishErrorsTotal.WithLabelValues(env.EventType, brokerLabel).Inc()
			return err
		}
	}

	metrics.EventsPublishedTotal.WithLabelValues(env.EventType, brokerLabel).Inc()
	return nil
}

// resolveRoute finds the route for the given event_type.
// It tries exact match first, then prefix-based matching.
func (r *Router) resolveRoute(eventType string) (Route, bool) {
	if route, ok := r.routes[eventType]; ok {
		return route, true
	}

	// Prefix-based fallback: try progressively shorter prefixes.
	parts := strings.Split(eventType, ".")
	for i := len(parts) - 1; i > 0; i-- {
		prefix := strings.Join(parts[:i], ".")
		if route, ok := r.routes[prefix]; ok {
			return route, true
		}
	}

	return Route{}, false
}

// derivePartitionKey extracts the partition key from the envelope based on the route's key source.
func (r *Router) derivePartitionKey(env *commonpb.EventEnvelope, keySource string) string {
	switch keySource {
	case "actor_id":
		if env.ActorId != "" {
			return env.ActorId
		}
	case "correlation_id":
		if env.CorrelationId != "" {
			return env.CorrelationId
		}
	case "tenant_id":
		if env.TenantId != "" {
			return env.TenantId
		}
	}
	// Fallback to event_id for random distribution.
	return env.EventId
}
