package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"

	"github.com/aptiverse/event-architecture/internal/broker/kafka"
	"github.com/aptiverse/event-architecture/internal/broker/rabbitmq"
	"github.com/aptiverse/event-architecture/internal/config"
	"github.com/aptiverse/event-architecture/internal/dedup"
	"github.com/aptiverse/event-architecture/internal/router"
)

// NewServer creates and configures the HTTP server with all routes and middleware.
func NewServer(
	cfg *config.Config,
	kafkaProducer *kafka.Producer,
	rabbitPublisher *rabbitmq.Publisher,
	eventRouter *router.Router,
	deduplicator *dedup.Deduplicator,
	logger *zap.Logger,
) http.Handler {
	r := chi.NewRouter()

	// Global middleware.
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(RecoveryMiddleware(logger))
	r.Use(LoggingMiddleware(logger))
	r.Use(MetricsMiddleware)

	handlers := NewHandlers(eventRouter, deduplicator, kafkaProducer, rabbitPublisher, cfg, logger)

	// Health probes.
	r.Get("/healthz", HealthHandler())
	r.Get("/readyz", ReadyHandler(kafkaProducer, rabbitPublisher))

	// Prometheus metrics.
	r.Handle("/metrics", promhttp.Handler())

	// API routes.
	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/events", handlers.PublishEvent)
		r.Post("/events/batch", handlers.PublishBatch)
	})

	return r
}
