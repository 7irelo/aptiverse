module Webhooks
  class StripeController < ApiController
    def create
      event = Stripe::Webhook.construct_event(request.raw_post, stripe_signature_header, webhook_secret)
      Rails.logger.info("[StripeWebhook] Received event id=#{event.id} type=#{event.type}")

      process_event(event)

      render json: { received: true }, status: :ok
    rescue Stripe::SignatureVerificationError => e
      Rails.logger.warn("[StripeWebhook] Signature verification failed: #{e.message}")
      render json: { error: "Invalid Stripe signature" }, status: :bad_request
    rescue JSON::ParserError => e
      Rails.logger.warn("[StripeWebhook] Invalid payload: #{e.message}")
      render json: { error: "Invalid Stripe payload" }, status: :bad_request
    rescue KeyError
      Rails.logger.error("[StripeWebhook] STRIPE_WEBHOOK_SECRET is not configured")
      render json: { error: "Webhook secret not configured" }, status: :internal_server_error
    end

    private

    def process_event(event)
      case event.type
      when "checkout.session.completed"
        mark_paid(event.data.object)
      when "payment_intent.payment_failed"
        mark_failed(event.data.object)
      when "charge.refunded"
        mark_refunded(event.data.object)
      else
        Rails.logger.info("[StripeWebhook] Ignored event type=#{event.type}")
      end
    end

    def mark_paid(session)
      payment = Payment.find_by(stripe_checkout_session_id: session.id)
      unless payment
        Rails.logger.warn("[StripeWebhook] No payment found for checkout_session_id=#{session.id}")
        return
      end

      payment.update!(
        status: :paid,
        stripe_payment_intent_id: extract_payment_intent_id(session.payment_intent) || payment.stripe_payment_intent_id
      )
      Rails.logger.info("[StripeWebhook] Payment marked paid payment_id=#{payment.id}")
    end

    def mark_failed(payment_intent)
      payment = Payment.find_by(stripe_payment_intent_id: payment_intent.id)
      payment ||= Payment.find_by(id: payment_intent.metadata&.[]("payment_id"))

      unless payment
        Rails.logger.warn("[StripeWebhook] No payment found for payment_intent_id=#{payment_intent.id}")
        return
      end

      payment.update!(status: :failed)
      Rails.logger.info("[StripeWebhook] Payment marked failed payment_id=#{payment.id}")
    end

    def mark_refunded(charge)
      payment = Payment.find_by(stripe_payment_intent_id: charge.payment_intent)
      unless payment
        Rails.logger.warn("[StripeWebhook] No payment found for refunded charge payment_intent=#{charge.payment_intent}")
        return
      end

      payment.update!(status: :refunded)
      Rails.logger.info("[StripeWebhook] Payment marked refunded payment_id=#{payment.id}")
    end

    def stripe_signature_header
      request.headers["Stripe-Signature"] || request.headers["HTTP_STRIPE_SIGNATURE"]
    end

    def webhook_secret
      ENV.fetch("STRIPE_WEBHOOK_SECRET")
    end

    def extract_payment_intent_id(payment_intent)
      return payment_intent.id if payment_intent.respond_to?(:id)

      payment_intent
    end
  end
end
