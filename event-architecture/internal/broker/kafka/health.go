package kafka

import (
	"fmt"
	"net"
	"time"

	"github.com/aptiverse/event-architecture/internal/metrics"
)

// HealthCheck verifies connectivity to the Kafka broker.
func (p *Producer) HealthCheck() error {
	broker := p.cfg.KafkaBrokers[0]
	conn, err := net.DialTimeout("tcp", broker, 5*time.Second)
	if err != nil {
		metrics.BrokerHealthStatus.WithLabelValues("kafka").Set(0)
		return fmt.Errorf("kafka health check failed: %w", err)
	}
	conn.Close()
	metrics.BrokerHealthStatus.WithLabelValues("kafka").Set(1)
	return nil
}
