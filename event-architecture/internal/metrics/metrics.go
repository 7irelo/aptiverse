package metrics

import "github.com/prometheus/client_golang/prometheus"

var (
	EventsReceivedTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "events_received_total",
			Help: "Total number of events received by the API.",
		},
		[]string{"event_type", "source"},
	)

	EventsDeduplicatedTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "events_deduplicated_total",
			Help: "Total number of events dropped as duplicates.",
		},
		[]string{"source"},
	)

	EventsPublishedTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "events_published_total",
			Help: "Total number of events successfully published to a broker.",
		},
		[]string{"event_type", "broker"},
	)

	EventsPublishErrorsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "events_publish_errors_total",
			Help: "Total number of events that failed to publish.",
		},
		[]string{"event_type", "broker"},
	)

	EventsDeadLetteredTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "events_dead_lettered_total",
			Help: "Total number of events sent to dead-letter queues/topics.",
		},
		[]string{"event_type", "broker"},
	)

	EventPublishDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "event_publish_duration_seconds",
			Help:    "Histogram of event publish latency.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"broker"},
	)

	EventsBatchSize = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "events_batch_size",
			Help:    "Histogram of batch sizes received.",
			Buckets: []float64{1, 5, 10, 25, 50, 100},
		},
		[]string{"source"},
	)

	KafkaProducerAcksTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "kafka_producer_acks_total",
			Help: "Total Kafka producer acknowledgements.",
		},
		[]string{"topic", "ack_type"},
	)

	RabbitMQConfirmsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "rabbitmq_confirms_total",
			Help: "Total RabbitMQ publisher confirms.",
		},
		[]string{"routing_key", "result"},
	)

	BrokerHealthStatus = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "broker_health_status",
			Help: "Health status of brokers (1=healthy, 0=unhealthy).",
		},
		[]string{"broker"},
	)

	HTTPRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests.",
		},
		[]string{"method", "path", "status"},
	)

	HTTPRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Histogram of HTTP request latency.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)
)

// Register registers all Prometheus metrics collectors.
func Register() {
	prometheus.MustRegister(
		EventsReceivedTotal,
		EventsDeduplicatedTotal,
		EventsPublishedTotal,
		EventsPublishErrorsTotal,
		EventsDeadLetteredTotal,
		EventPublishDuration,
		EventsBatchSize,
		KafkaProducerAcksTotal,
		RabbitMQConfirmsTotal,
		BrokerHealthStatus,
		HTTPRequestsTotal,
		HTTPRequestDuration,
	)
}
