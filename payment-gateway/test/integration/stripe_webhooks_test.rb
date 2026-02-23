require "test_helper"
require "ostruct"

class StripeWebhooksTest < ActionDispatch::IntegrationTest
  SIGNATURE_HEADER = "t=1677777777,v1=fakesignature".freeze

  setup do
    @existing_webhook_secret = ENV["STRIPE_WEBHOOK_SECRET"]
    ENV["STRIPE_WEBHOOK_SECRET"] = "whsec_test_123"
  end

  teardown do
    ENV["STRIPE_WEBHOOK_SECRET"] = @existing_webhook_secret
  end

  test "marks payment as paid for checkout.session.completed event" do
    payment = create_payment
    event = OpenStruct.new(
      id: "evt_completed",
      type: "checkout.session.completed",
      data: OpenStruct.new(object: OpenStruct.new(id: payment.stripe_checkout_session_id, payment_intent: "pi_new_123"))
    )

    verifier = lambda do |payload, signature, webhook_secret|
      assert_equal sample_payload, payload
      assert_equal SIGNATURE_HEADER, signature
      assert_equal "whsec_test_123", webhook_secret
      event
    end

    Stripe::Webhook.stub(:construct_event, verifier) do
      post_webhook(sample_payload, signature: SIGNATURE_HEADER)
    end

    assert_response :ok
    assert_equal "paid", payment.reload.status
    assert_equal "pi_new_123", payment.stripe_payment_intent_id
  end

  test "marks payment as failed for payment_intent.payment_failed event" do
    payment = create_payment(stripe_payment_intent_id: "pi_failed_123")
    event = OpenStruct.new(
      id: "evt_failed",
      type: "payment_intent.payment_failed",
      data: OpenStruct.new(object: OpenStruct.new(id: "pi_failed_123", metadata: {}))
    )

    Stripe::Webhook.stub(:construct_event, event) do
      post_webhook(sample_payload, signature: SIGNATURE_HEADER)
    end

    assert_response :ok
    assert_equal "failed", payment.reload.status
  end

  test "marks payment as refunded for charge.refunded event" do
    payment = create_payment(stripe_payment_intent_id: "pi_refund_123")
    event = OpenStruct.new(
      id: "evt_refunded",
      type: "charge.refunded",
      data: OpenStruct.new(object: OpenStruct.new(payment_intent: "pi_refund_123"))
    )

    Stripe::Webhook.stub(:construct_event, event) do
      post_webhook(sample_payload, signature: SIGNATURE_HEADER)
    end

    assert_response :ok
    assert_equal "refunded", payment.reload.status
  end

  test "returns bad request when stripe signature verification fails" do
    verification_error = Stripe::SignatureVerificationError.new("Invalid signature", "sig_header")
    verifier = ->(*_args) { raise verification_error }

    Stripe::Webhook.stub(:construct_event, verifier) do
      post_webhook(sample_payload, signature: SIGNATURE_HEADER)
    end

    assert_response :bad_request
    assert_equal "Invalid Stripe signature", JSON.parse(response.body)["error"]
  end

  private

  def create_payment(stripe_payment_intent_id: nil)
    Payment.create!(
      student_id: "11111111-1111-4111-8111-111111111111",
      amount_cents: 1500,
      currency: "usd",
      status: :created,
      stripe_checkout_session_id: "cs_#{SecureRandom.hex(8)}",
      stripe_payment_intent_id: stripe_payment_intent_id
    )
  end

  def post_webhook(payload, signature:)
    post "/webhooks/stripe",
         params: payload,
         headers: {
           "CONTENT_TYPE" => "application/json",
           "Stripe-Signature" => signature,
           "HTTP_STRIPE_SIGNATURE" => signature
         }
  end

  def sample_payload
    {
      id: "evt_sample",
      object: "event",
      type: "checkout.session.completed"
    }.to_json
  end
end
