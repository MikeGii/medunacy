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
        // Silent ignore - remove the console.log
        break;
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
  try {
    const userId = session.metadata?.user_id;
    const planType = session.metadata?.plan_type;

    if (!userId || !planType || !session.subscription) {
      return;
    }

    const subscription = (await stripe.subscriptions.retrieve(
      session.subscription as string
    )) as any;

    const periodStart =
      subscription.billing_cycle_anchor || subscription.created;
    const isAnnual = planType === "annual";
    const daysToAdd = isAnnual ? 365 : 30;
    const periodEnd = periodStart + daysToAdd * 24 * 60 * 60;

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id: userId,
        status: subscription.status,
        plan_type: planType,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        stripe_price_id: subscription.items.data[0].price.id,
        current_period_start: new Date(periodStart * 1000).toISOString(),
        current_period_end: new Date(periodEnd * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      })
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    const { error: userError } = await supabaseAdmin
      .from("users")
      .update({ subscription_status: "premium" })
      .eq("user_id", userId);

    if (userError) {
      console.error("Error updating user subscription_status:", userError);
    }
  } catch (error) {
    console.error("Error in handleCheckoutComplete:", error);
    throw error;
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.user_id;

    if (!userId) {
      return;
    }

    const sub = subscription as any;
    const planType = sub.metadata?.plan_type || "monthly";
    const isAnnual = planType === "annual";
    const periodStart = sub.billing_cycle_anchor || sub.created;
    const daysToAdd = isAnnual ? 365 : 30;
    const periodEnd = periodStart + daysToAdd * 24 * 60 * 60;

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_start: new Date(periodStart * 1000).toISOString(),
        current_period_end: new Date(periodEnd * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    const userStatus =
      subscription.status === "active" || subscription.status === "trialing"
        ? "premium"
        : "free";

    await supabaseAdmin
      .from("users")
      .update({ subscription_status: userStatus })
      .eq("user_id", userId);
  } catch (error) {
    console.error("Error in handleSubscriptionUpdate:", error);
    throw error;
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  try {
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }

    const userId = subscription.metadata?.user_id;
    if (userId) {
      await supabaseAdmin
        .from("users")
        .update({ subscription_status: "free" })
        .eq("user_id", userId);
    }
  } catch (error) {
    console.error("Error in handleSubscriptionCancelled:", error);
    throw error;
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const invoiceData = invoice as any;

    let subscriptionId = null;
    let planType = null;
    let userId = null;

    if (
      invoiceData.lines &&
      invoiceData.lines.data &&
      invoiceData.lines.data.length > 0
    ) {
      const firstLineItem = invoiceData.lines.data[0];

      if (firstLineItem.parent?.subscription_item_details?.subscription) {
        subscriptionId =
          firstLineItem.parent.subscription_item_details.subscription;
      }

      if (firstLineItem.metadata) {
        userId = firstLineItem.metadata.user_id;
        planType = firstLineItem.metadata.plan_type;
      }
    }

    if (!subscriptionId) {
      return;
    }

    if (!userId) {
      const subscription = (await stripe.subscriptions.retrieve(
        subscriptionId
      )) as any;
      userId = subscription.metadata?.user_id;
      planType = planType || subscription.metadata?.plan_type;
    }

    if (!userId) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { data: subscriptionData } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    const paymentRecord = {
      user_id: userId,
      subscription_id: subscriptionData?.id || null,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      status: "succeeded" as const,
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id: invoiceData.payment_intent || null,
      description: `Payment for ${planType || "subscription"} - ${
        invoiceData.period_start
          ? new Date(invoiceData.period_start * 1000).toLocaleDateString()
          : "Initial payment"
      }`,
      created_at: invoice.created
        ? new Date(invoice.created * 1000).toISOString()
        : new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("payment_history")
      .insert(paymentRecord);

    if (error) {
      console.error("Error recording payment:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in handlePaymentSucceeded:", error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const invoiceData = invoice as any;
    const subscriptionId = invoiceData.subscription;

    if (!subscriptionId || !invoice.customer) return;

    const subscription = (await stripe.subscriptions.retrieve(
      subscriptionId
    )) as any;
    const userId = subscription.metadata?.user_id;

    if (!userId) return;

    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "past_due",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);

    await supabaseAdmin
      .from("users")
      .update({ subscription_status: "free" })
      .eq("user_id", userId);

    const { data: subscriptionData } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", subscriptionId)
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
  } catch (error) {
    console.error("Error in handlePaymentFailed:", error);
  }
}
