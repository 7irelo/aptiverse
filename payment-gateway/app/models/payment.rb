class Payment < ApplicationRecord
  UUID_PATTERN = /\A[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\z/i

  enum :status, {
    created: "created",
    paid: "paid",
    failed: "failed",
    refunded: "refunded"
  }

  validates :student_id, presence: true
  validates :student_id, format: { with: UUID_PATTERN, message: "must be a valid UUID" }
  validates :amount_cents, numericality: { only_integer: true, greater_than: 0 }
  validates :currency, presence: true, length: { is: 3 }
  validates :status, inclusion: { in: statuses.keys }
  validates :stripe_checkout_session_id, presence: true, uniqueness: true

  scope :for_student, ->(student_id) { where(student_id: student_id) }

  before_validation :normalize_currency

  private

  def normalize_currency
    self.currency = currency.to_s.downcase
  end
end
