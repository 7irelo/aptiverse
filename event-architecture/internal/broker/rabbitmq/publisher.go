package rabbitmq

import (
	"context"
	"fmt"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"

	"github.com/aptiverse/event-architecture/internal/config"
	"github.com/aptiverse/event-architecture/internal/metrics"
)

// Publisher wraps an AMQP connection with publisher confirms and retry logic.
type Publisher struct {
	conn    *amqp.Connection
	ch      *amqp.Channel
	returns chan amqp.Return
	cfg     *config.Config
	logger  *zap.Logger
}

// NewPublisher establishes a RabbitMQ connection, enables publisher confirms,
// declares the topology, and starts listening for returned messages.
func NewPublisher(cfg *config.Config, logger *zap.Logger) (*Publisher, error) {
	conn, err := amqp.Dial(cfg.RabbitMQURL)
	if err != nil {
		return nil, fmt.Errorf("rabbitmq dial: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("rabbitmq channel: %w", err)
	}

	if err := ch.Confirm(false); err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("rabbitmq confirm mode: %w", err)
	}

	if err := DeclareTopology(ch); err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("rabbitmq topology: %w", err)
	}

	returns := make(chan amqp.Return, 64)
	ch.NotifyReturn(returns)

	p := &Publisher{
		conn:    conn,
		ch:      ch,
		returns: returns,
		cfg:     cfg,
		logger:  logger,
	}

	go p.handleReturns()

	return p, nil
}

func (p *Publisher) handleReturns() {
	for ret := range p.returns {
		p.logger.Warn("rabbitmq message returned (unroutable)",
			zap.String("routing_key", ret.RoutingKey),
			zap.Int("reply_code", int(ret.ReplyCode)),
			zap.String("reply_text", ret.ReplyText),
		)
		metrics.EventsDeadLetteredTotal.WithLabelValues(ret.RoutingKey, "rabbitmq").Inc()
	}
}

// Publish sends a message to the commands exchange with the given routing key.
// Uses publisher confirms with retries and exponential backoff.
func (p *Publisher) Publish(ctx context.Context, routingKey string, body []byte) error {
	msg := amqp.Publishing{
		ContentType:  "application/protobuf",
		DeliveryMode: amqp.Persistent,
		Timestamp:    time.Now(),
		Body:         body,
	}

	backoffs := []time.Duration{100 * time.Millisecond, 500 * time.Millisecond, 2 * time.Second}
	var lastErr error

	for attempt := 0; attempt <= p.cfg.RabbitMQRetries; attempt++ {
		confirm, err := p.ch.PublishWithDeferredConfirmWithContext(
			ctx,
			ExchangeCommands,
			routingKey,
			true,  // mandatory
			false, // immediate
			msg,
		)
		if err != nil {
			lastErr = err
			p.logger.Warn("rabbitmq publish attempt failed",
				zap.String("routing_key", routingKey),
				zap.Int("attempt", attempt+1),
				zap.Error(err),
			)
			if attempt < len(backoffs) {
				time.Sleep(backoffs[attempt])
			}
			continue
		}

		start := time.Now()
		acked := confirm.Wait()
		duration := time.Since(start).Seconds()
		metrics.EventPublishDuration.WithLabelValues("rabbitmq").Observe(duration)

		if acked {
			metrics.RabbitMQConfirmsTotal.WithLabelValues(routingKey, "ack").Inc()
			return nil
		}

		metrics.RabbitMQConfirmsTotal.WithLabelValues(routingKey, "nack").Inc()
		lastErr = fmt.Errorf("rabbitmq nack for routing key %s", routingKey)
		p.logger.Warn("rabbitmq publish nacked",
			zap.String("routing_key", routingKey),
			zap.Int("attempt", attempt+1),
		)

		if attempt < len(backoffs) {
			time.Sleep(backoffs[attempt])
		}
	}

	// Permanent failure — publish to DLX.
	p.logger.Error("rabbitmq publish failed permanently",
		zap.String("routing_key", routingKey),
		zap.Error(lastErr),
	)
	metrics.EventsDeadLetteredTotal.WithLabelValues(routingKey, "rabbitmq").Inc()

	dlqMsg := amqp.Publishing{
		ContentType:  "application/protobuf",
		DeliveryMode: amqp.Persistent,
		Timestamp:    time.Now(),
		Body:         body,
		Headers: amqp.Table{
			"x-original-routing-key": routingKey,
			"x-error":                lastErr.Error(),
		},
	}

	if _, err := p.ch.PublishWithDeferredConfirmWithContext(
		ctx, ExchangeDLX, "", false, false, dlqMsg,
	); err != nil {
		p.logger.Error("failed to publish to RabbitMQ DLX", zap.Error(err))
	}

	return fmt.Errorf("rabbitmq publish to %s failed after %d retries: %w",
		routingKey, p.cfg.RabbitMQRetries, lastErr)
}

// Close shuts down the channel and connection.
func (p *Publisher) Close() error {
	if err := p.ch.Close(); err != nil {
		return err
	}
	return p.conn.Close()
}
