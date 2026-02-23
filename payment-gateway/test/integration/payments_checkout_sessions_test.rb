require "test_helper"
require "ostruct"

class PaymentsCheckoutSessionsTest < ActionDispatch::IntegrationTest
  test "creates a stripe checkout session and payment record" do
    fake_session = OpenStruct.new(
      id: "cs_test_123",
      url: "https://checkout.stripe.com/c/pay/cs_test_123",
      payment_intent: "pi_test_123"
    )

    request_payload = {
      student_id: "11111111-1111-4111-8111-111111111111",
      amount_cents: 2599,
      currency: "USD",
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
      metadata: { plan: "student" }
    }

    Stripe::Checkout::Session.stub(:create, fake_session) do
      assert_difference("Payment.count", 1) do
        post "/payments/checkout_sessions", params: request_payload, as: :json
      end
    end

    assert_response :created

    response_json = JSON.parse(response.body)
    assert_equal "cs_test_123", response_json["id"]
    assert_equal "https://checkout.stripe.com/c/pay/cs_test_123", response_json["url"]

    payment = Payment.find_by!(stripe_checkout_session_id: "cs_test_123")
    assert_equal "11111111-1111-4111-8111-111111111111", payment.student_id
    assert_equal 2599, payment.amount_cents
    assert_equal "usd", payment.currency
    assert_equal "created", payment.status
    assert_equal "pi_test_123", payment.stripe_payment_intent_id
    assert_equal({ "plan" => "student" }, payment.metadata)
  end
end
