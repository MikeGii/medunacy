// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Initialize Supabase with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const planType = session.metadata?.plan_type;

  if (!userId || !planType || !session.subscription) {
    console.error("Missing required data in checkout session");
    return;
  }

  // Retrieve the subscription to get full details
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // Create subscription record
  await supabaseAdmin.from("subscriptions").insert({
    user_id: userId,
    status: subscription.status,
    plan_type: planType,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    stripe_price_id: subscription.items.data[0].price.id,
    current_period_start: new Date(
      subscription.current_period_start * 1000
    ).toISOString(),
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error("No user_id in subscription metadata");
    return;
  }

  // Update subscription record
  await supabaseAdmin
    .from("subscriptions")
    .update({
      status: subscription.status,
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  // Update subscription status to cancelled
  await supabaseAdmin
    .from("subscriptions")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Check if this is related to a subscription
  if (!invoice.subscription || !invoice.customer) return;

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );

  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  // Get subscription ID from database
  const { data: subscriptionData } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", invoice.subscription as string)
    .single();

  if (!subscriptionData) return;

  // Record payment
  await supabaseAdmin.from("payment_history").insert({
    user_id: userId,
    subscription_id: subscriptionData.id,
    amount: invoice.amount_paid / 100, // Convert from cents
    currency: invoice.currency.toUpperCase(),
    status: "succeeded",
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: invoice.payment_intent as string | null,
    description: `Payment for ${subscription.metadata?.plan_type} subscription`,
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription || !invoice.customer) return;

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );

  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  // Update subscription status to past_due
  await supabaseAdmin
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", invoice.subscription as string);

  // Record failed payment
  const { data: subscriptionData } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", invoice.subscription as string)
    .single();

  if (subscriptionData) {
    await supabaseAdmin.from("payment_history").insert({
      user_id: userId,
      subscription_id: subscriptionData.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      status: "failed",
      stripe_invoice_id: invoice.id,
      description: `Failed payment for subscription`,
    });
  }
}
