Stripe.api_key = ENV["STRIPE_SECRET_KEY"]
Stripe.api_version = "2024-06-20"

Rails.application.config.x.stripe.publishable_key = ENV["STRIPE_PUBLISHABLE_KEY"]
