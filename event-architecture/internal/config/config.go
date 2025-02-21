package config

import (
	"time"

	"github.com/kelseyhightower/envconfig"
)

// Config holds all application configuration, populated from environment variables.
type Config struct {
	// Server
	ServerPort         int           `envconfig:"SERVER_PORT" default:"8080"`
	ServerReadTimeout  time.Duration `envconfig:"SERVER_READ_TIMEOUT" default:"10s"`
	ServerWriteTimeout time.Duration `envconfig:"SERVER_WRITE_TIMEOUT" default:"10s"`

	// Kafka
	KafkaBrokers  []string `envconfig:"KAFKA_BROKERS" default:"localhost:9092"`
	KafkaAcks     string   `envconfig:"KAFKA_ACKS" default:"all"`
	KafkaRetries  int      `envconfig:"KAFKA_RETRIES" default:"3"`
	KafkaClientID string   `envconfig:"KAFKA_CLIENT_ID" default:"aptiverse-event-server"`

	// RabbitMQ
	RabbitMQURL     string `envconfig:"RABBITMQ_URL" default:"amqp://guest:guest@localhost:5672/"`
	RabbitMQRetries int    `envconfig:"RABBITMQ_RETRIES" default:"3"`

	// Deduplication
	DedupWindowSize int           `envconfig:"DEDUP_WINDOW_SIZE" default:"100000"`
	DedupTTL        time.Duration `envconfig:"DEDUP_TTL" default:"10m"`

	// Rate Limiting
	RateLimitPerSource int `envconfig:"RATE_LIMIT_PER_SOURCE" default:"1000"`

	// Batch
	MaxBatchSize int `envconfig:"MAX_BATCH_SIZE" default:"100"`

	// Environment
	Environment string `envconfig:"ENVIRONMENT" default:"development"`
}

// Load reads configuration from environment variables.
func Load() (*Config, error) {
	var cfg Config
	if err := envconfig.Process("", &cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}

// IsProduction returns true if the environment is set to production.
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}
