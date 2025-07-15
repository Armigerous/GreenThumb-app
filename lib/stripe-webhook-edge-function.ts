// --- GreenThumb Edge Function: stripe-webhook ---
// Handles Stripe webhook events and updates Supabase tables accordingly
// Follows Deno/Edge Function conventions as in generate-plant-tasks-edge-function.ts

// @ts-expect-error Supabase Edge import
import { createClient } from "npm:@supabase/supabase-js@2";
// @ts-expect-error Stripe Deno import
import Stripe from "npm:stripe@12.18.0";

// --- CORS headers (define locally) ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// --- Supabase client (Edge runtime) ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing env vars");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// --- Stripe client ---
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) throw new Error("Missing Stripe env vars");
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let event;
  try {
    const sig = req.headers.get("stripe-signature");
    const body = await req.text();
    if (!sig) throw new Error("Missing Stripe signature");
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return new Response("Webhook Error: Invalid signature", { status: 400, headers: corsHeaders });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        // Get user_id and plan_id from metadata
        const user_id = subscription.metadata?.userId;
        const plan_id = subscription.metadata?.planId;
        if (!user_id || !plan_id) {
          console.error("[webhook] Missing userId or planId in subscription metadata");
          break;
        }
        // Upsert user_subscriptions
        const upsertData = {
          user_id,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          subscription_plan_id: plan_id,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        };
        const { error: upsertError } = await supabase.from("user_subscriptions").upsert(upsertData, { onConflict: "user_id" });
        if (upsertError) {
          console.error("[webhook] Error upserting user_subscriptions:", upsertError);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const user_id = subscription.metadata?.userId;
        if (!user_id) {
          console.error("[webhook] Missing userId in subscription metadata");
          break;
        }
        // Mark subscription as canceled
        const { error: cancelError } = await supabase.from("user_subscriptions").update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("user_id", user_id);
        if (cancelError) {
          console.error("[webhook] Error updating canceled subscription:", cancelError);
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        // Find user_id from subscription metadata
        let user_id = null;
        if (invoice.subscription) {
          // Fetch subscription from Stripe to get metadata
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          user_id = subscription.metadata?.userId;
        }
        if (!user_id) {
          console.error("[webhook] Missing userId for payment_succeeded");
          break;
        }
        // Insert payment_history
        const paymentData = {
          user_id,
          stripe_payment_intent_id: invoice.payment_intent,
          stripe_invoice_id: invoice.id,
          amount_cents: invoice.amount_paid,
          status: "succeeded",
          created_at: new Date(invoice.created * 1000).toISOString(),
        };
        const { error: paymentError } = await supabase.from("payment_history").insert(paymentData);
        if (paymentError) {
          console.error("[webhook] Error inserting payment_history:", paymentError);
        }
        // Update user_subscriptions status to active
        const { error: updateError } = await supabase.from("user_subscriptions").update({
          status: "active",
          updated_at: new Date().toISOString(),
        }).eq("user_id", user_id);
        if (updateError) {
          console.error("[webhook] Error updating subscription status after payment:", updateError);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        let user_id = null;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          user_id = subscription.metadata?.userId;
        }
        if (!user_id) {
          console.error("[webhook] Missing userId for payment_failed");
          break;
        }
        // Insert failed payment
        const paymentData = {
          user_id,
          stripe_payment_intent_id: invoice.payment_intent,
          stripe_invoice_id: invoice.id,
          amount_cents: invoice.amount_due,
          status: "failed",
          created_at: new Date(invoice.created * 1000).toISOString(),
        };
        const { error: paymentError } = await supabase.from("payment_history").insert(paymentData);
        if (paymentError) {
          console.error("[webhook] Error inserting failed payment_history:", paymentError);
        }
        // Update user_subscriptions status to past_due
        const { error: updateError } = await supabase.from("user_subscriptions").update({
          status: "past_due",
          updated_at: new Date().toISOString(),
        }).eq("user_id", user_id);
        if (updateError) {
          console.error("[webhook] Error updating subscription status after failed payment:", updateError);
        }
        break;
      }
      default:
        // Ignore other events
        break;
    }
    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("[stripe-webhook] Handler error:", err);
    return new Response("Webhook Error: Handler exception", { status: 400, headers: corsHeaders });
  }
}); 