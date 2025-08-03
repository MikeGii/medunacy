// src/types/subscription.types.ts
export interface Subscription {
  id: string;
  user_id: string;
  status:
    | "active"
    | "inactive"
    | "cancelled"
    | "past_due"
    | "incomplete"
    | "trialing";
  plan_type: "monthly" | "annual";
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: "succeeded" | "failed" | "pending" | "refunded";
  stripe_payment_intent_id?: string;
  stripe_invoice_id?: string;
  description?: string;
  created_at: string;
}

export interface CreateCheckoutSessionRequest {
  priceId: string;
  mode: "subscription";
  successUrl: string;
  cancelUrl: string;
}
