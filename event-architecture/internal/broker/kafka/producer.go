package kafka

import (
	"context"
	"fmt"
	"time"

	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"

	"github.com/aptiverse/event-architecture/internal/config"
	"github.com/aptiverse/event-architecture/internal/metrics"
)

// TopicConfig defines partition and retention settings for a Kafka topic.
type TopicConfig struct {
	Name              string
	Partitions        int
	ReplicationFactor int
	RetentionDays     int
}

// DefaultTopics returns the standard Aptiverse Kafka topic configurations.
func DefaultTopics(replicationFactor int) []TopicConfig {
	return []TopicConfig{
		{Name: "aptiverse.student.activity", Partitions: 6, ReplicationFactor: replicationFactor, RetentionDays: 7},
		{Name: "aptiverse.assessment.lifecycle", Partitions: 6, ReplicationFactor: replicationFactor, RetentionDays: 7},
		{Name: "aptiverse.assessment.practice", Partitions: 6, ReplicationFactor: replicationFactor, RetentionDays: 7},
		{Name: "aptiverse.student.strength", Partitions: 6, ReplicationFactor: replicationFactor, RetentionDays: 7},
		{Name: "aptiverse.student.journey", Partitions: 6, ReplicationFactor: replicationFactor, RetentionDays: 7},
		{Name: "aptiverse.analytics.ai", Partitions: 3, ReplicationFactor: replicationFactor, RetentionDays: 7},
		{Name: "aptiverse.analytics.audit", Partitions: 6, ReplicationFactor: replicationFactor, RetentionDays: 90},
		{Name: "aptiverse.errors.dlq", Partitions: 3, ReplicationFactor: replicationFactor, RetentionDays: 30},
	}
}

// Producer wraps a Kafka writer with retry and DLQ support.
type Producer struct {
	writers   map[string]*kafka.Writer
	dlqWriter *kafka.Writer
	cfg       *config.Config
	logger    *zap.Logger
}

// NewProducer creates Kafka writers for each configured topic.
func NewProducer(cfg *config.Config, logger *zap.Logger) (*Producer, error) {
	replicationFactor := 1
	if cfg.IsProduction() {
		replicationFactor = 3
	}

	topics := DefaultTopics(replicationFactor)

	// Ensure topics exist.
	if err := ensureTopics(cfg.KafkaBrokers[0], topics); err != nil {
		logger.Warn("failed to create Kafka topics (may already exist)", zap.Error(err))
	}

	acks := kafka.RequireAll
	if cfg.KafkaAcks == "leader" || cfg.KafkaAcks == "1" {
		acks = kafka.RequireOne
	}

	writers := make(map[string]*kafka.Writer, len(topics))
	for _, t := range topics {
		writers[t.Name] = &kafka.Writer{
			Addr:                   kafka.TCP(cfg.KafkaBrokers...),
			Topic:                  t.Name,
			Balancer:               &kafka.Hash{},
			RequiredAcks:           acks,
			AllowAutoTopicCreation: false,
			WriteTimeout:           10 * time.Second,
			ReadTimeout:            10 * time.Second,
		}
	}

	dlqWriter := writers["aptiverse.errors.dlq"]

	return &Producer{
		writers:   writers,
		dlqWriter: dlqWriter,
		cfg:       cfg,
		logger:    logger,
	}, nil
}

func ensureTopics(broker string, topics []TopicConfig) error {
	conn, err := kafka.Dial("tcp", broker)
	if err != nil {
		return fmt.Errorf("dial kafka: %w", err)
	}
	defer conn.Close()

	topicConfigs := make([]kafka.TopicConfig, len(topics))
	for i, t := range topics {
		topicConfigs[i] = kafka.TopicConfig{
			Topic:             t.Name,
			NumPartitions:     t.Partitions,
			ReplicationFactor: t.ReplicationFactor,
		}
	}

	return conn.CreateTopics(topicConfigs...)
}

// Publish sends a message to the specified Kafka topic with retries.
// On permanent failure, the message is written to the DLQ topic.
func (p *Producer) Publish(ctx context.Context, topic, key string, value []byte) error {
	writer, ok := p.writers[topic]
	if !ok {
		return fmt.Errorf("unknown kafka topic: %s", topic)
	}

	msg := kafka.Message{
		Key:   []byte(key),
		Value: value,
	}

	var lastErr error
	backoffs := []time.Duration{100 * time.Millisecond, 500 * time.Millisecond, 2 * time.Second}

	for attempt := 0; attempt <= p.cfg.KafkaRetries; attempt++ {
		start := time.Now()
		err := writer.WriteMessages(ctx, msg)
		duration := time.Since(start).Seconds()
		metrics.EventPublishDuration.WithLabelValues("kafka").Observe(duration)

		if err == nil {
			ackType := "all"
			if p.cfg.KafkaAcks == "leader" || p.cfg.KafkaAcks == "1" {
				ackType = "leader"
			}
			metrics.KafkaProducerAcksTotal.WithLabelValues(topic, ackType).Inc()
			return nil
		}

		lastErr = err
		p.logger.Warn("kafka publish attempt failed",
			zap.String("topic", topic),
			zap.Int("attempt", attempt+1),
			zap.Error(err),
		)

		if attempt < len(backoffs) {
			time.Sleep(backoffs[attempt])
		}
	}

	// Permanent failure — write to DLQ.
	p.logger.Error("kafka publish failed permanently, writing to DLQ",
		zap.String("topic", topic),
		zap.Error(lastErr),
	)

	dlqMsg := kafka.Message{
		Key:   []byte(key),
		Value: value,
		Headers: []kafka.Header{
			{Key: "original_topic", Value: []byte(topic)},
			{Key: "error", Value: []byte(lastErr.Error())},
		},
	}

	if err := p.dlqWriter.WriteMessages(ctx, dlqMsg); err != nil {
		p.logger.Error("failed to write to Kafka DLQ", zap.Error(err))
	}
	metrics.EventsDeadLetteredTotal.WithLabelValues(topic, "kafka").Inc()

	return fmt.Errorf("kafka publish to %s failed after %d retries: %w", topic, p.cfg.KafkaRetries, lastErr)
}

// Close shuts down all Kafka writers.
func (p *Producer) Close() error {
	var firstErr error
	for _, w := range p.writers {
		if err := w.Close(); err != nil && firstErr == nil {
			firstErr = err
		}
	}
	return firstErr
}
