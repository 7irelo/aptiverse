class CreatePayments < ActiveRecord::Migration[8.0]
  def change
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")

    create_table :payments, id: :uuid do |t|
      t.uuid :student_id, null: false
      t.integer :amount_cents, null: false
      t.string :currency, null: false
      t.string :status, null: false, default: "created"
      t.string :stripe_checkout_session_id, null: false
      t.string :stripe_payment_intent_id
      t.jsonb :metadata

      t.timestamps
    end

    add_index :payments, :student_id
    add_index :payments, :status
    add_index :payments, :stripe_checkout_session_id, unique: true
    add_index :payments, :stripe_payment_intent_id
  end
end
