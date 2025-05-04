package rabbitmq

import (
	"fmt"

	"github.com/aptiverse/event-architecture/internal/metrics"
)

// HealthCheck verifies the RabbitMQ connection is alive.
func (p *Publisher) HealthCheck() error {
	if p.conn.IsClosed() {
		metrics.BrokerHealthStatus.WithLabelValues("rabbitmq").Set(0)
		return fmt.Errorf("rabbitmq connection is closed")
	}
	metrics.BrokerHealthStatus.WithLabelValues("rabbitmq").Set(1)
	return nil
}
