package api

import (
	"encoding/json"
	"net/http"

	"github.com/aptiverse/event-architecture/internal/broker/kafka"
	"github.com/aptiverse/event-architecture/internal/broker/rabbitmq"
)

// HealthHandler handles the /healthz liveness probe.
func HealthHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	}
}

// ReadyHandler handles the /readyz readiness probe, checking broker connectivity.
func ReadyHandler(kafkaProducer *kafka.Producer, rabbitPublisher *rabbitmq.Publisher) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		checks := map[string]string{}
		healthy := true

		if err := kafkaProducer.HealthCheck(); err != nil {
			checks["kafka"] = err.Error()
			healthy = false
		} else {
			checks["kafka"] = "ok"
		}

		if err := rabbitPublisher.HealthCheck(); err != nil {
			checks["rabbitmq"] = err.Error()
			healthy = false
		} else {
			checks["rabbitmq"] = "ok"
		}

		w.Header().Set("Content-Type", "application/json")
		if !healthy {
			w.WriteHeader(http.StatusServiceUnavailable)
		} else {
			w.WriteHeader(http.StatusOK)
		}
		json.NewEncoder(w).Encode(checks)
	}
}
