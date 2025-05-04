package rabbitmq

import amqp "github.com/rabbitmq/amqp091-go"

const (
	ExchangeCommands = "aptiverse.commands"
	ExchangeDLX      = "aptiverse.dlx"
	QueueDeadLetter  = "q.dead-letter"
)

// QueueBinding maps a routing key to a queue name.
type QueueBinding struct {
	RoutingKey string
	QueueName  string
}

// DefaultBindings returns the standard RabbitMQ queue bindings.
func DefaultBindings() []QueueBinding {
	return []QueueBinding{
		{RoutingKey: "notification.email", QueueName: "q.notification.email"},
		{RoutingKey: "notification.push", QueueName: "q.notification.push"},
		{RoutingKey: "notification.sms", QueueName: "q.notification.sms"},
		{RoutingKey: "payment.process", QueueName: "q.payment.process"},
		{RoutingKey: "tutor.match", QueueName: "q.tutor.match"},
		{RoutingKey: "reward.verify", QueueName: "q.reward.verify"},
		{RoutingKey: "reward.grant", QueueName: "q.reward.grant"},
		{RoutingKey: "calendar.sync", QueueName: "q.calendar.sync"},
		{RoutingKey: "wellbeing.alert", QueueName: "q.wellbeing.alert"},
		{RoutingKey: "wellbeing.referral", QueueName: "q.wellbeing.referral"},
	}
}

// DeclareTopology sets up exchanges, queues, and bindings on the RabbitMQ broker.
func DeclareTopology(ch *amqp.Channel) error {
	// Declare the dead-letter exchange.
	if err := ch.ExchangeDeclare(
		ExchangeDLX, "fanout", true, false, false, false, nil,
	); err != nil {
		return err
	}

	// Declare the dead-letter queue.
	if _, err := ch.QueueDeclare(
		QueueDeadLetter, true, false, false, false, nil,
	); err != nil {
		return err
	}

	// Bind dead-letter queue to DLX.
	if err := ch.QueueBind(QueueDeadLetter, "", ExchangeDLX, false, nil); err != nil {
		return err
	}

	// Declare the commands exchange.
	if err := ch.ExchangeDeclare(
		ExchangeCommands, "topic", true, false, false, false, nil,
	); err != nil {
		return err
	}

	// Declare queues and bind them.
	for _, b := range DefaultBindings() {
		args := amqp.Table{
			"x-dead-letter-exchange": ExchangeDLX,
		}

		if _, err := ch.QueueDeclare(
			b.QueueName, true, false, false, false, args,
		); err != nil {
			return err
		}

		if err := ch.QueueBind(
			b.QueueName, b.RoutingKey, ExchangeCommands, false, nil,
		); err != nil {
			return err
		}
	}

	return nil
}
