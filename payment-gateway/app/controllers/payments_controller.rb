class PaymentsController < ApiController
  def create_checkout_session
    data = checkout_params
    stripe_metadata = normalized_metadata(data[:metadata]).merge("student_id" => data[:student_id])

    checkout_session = Stripe::Checkout::Session.create(
      mode: "payment",
      success_url: data[:success_url],
      cancel_url: data[:cancel_url],
      payment_intent_data: {
        metadata: stripe_metadata
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: data[:currency],
            unit_amount: data[:amount_cents],
            product_data: {
              name: "Aptiverse payment"
            }
          }
        }
      ],
      metadata: stripe_metadata
    )

    Payment.create!(
      student_id: data[:student_id],
      amount_cents: data[:amount_cents],
      currency: data[:currency],
      status: :created,
      stripe_checkout_session_id: checkout_session.id,
      stripe_payment_intent_id: extract_payment_intent_id(checkout_session.payment_intent),
      metadata: data[:metadata].to_h.presence
    )

    render json: { id: checkout_session.id, url: checkout_session.url }, status: :created
  rescue Stripe::StripeError => e
    Rails.logger.error("[Stripe] Checkout session creation failed: #{e.message}")
    render json: { error: "Unable to create Stripe Checkout session" }, status: :bad_gateway
  end

  private

  def checkout_params
    params.require(:student_id)
    params.require(:amount_cents)
    params.require(:currency)
    params.require(:success_url)
    params.require(:cancel_url)

    permitted = params.permit(:student_id, :amount_cents, :currency, :success_url, :cancel_url, metadata: {})
    permitted[:amount_cents] = Integer(permitted[:amount_cents])
    permitted[:currency] = permitted[:currency].to_s.downcase
    permitted
  rescue ArgumentError, TypeError
    raise ActionController::BadRequest, "amount_cents must be an integer"
  end

  def normalized_metadata(metadata)
    metadata.to_h.transform_keys(&:to_s).transform_values(&:to_s)
  end

  def extract_payment_intent_id(payment_intent)
    return payment_intent.id if payment_intent.respond_to?(:id)

    payment_intent
  end
end
