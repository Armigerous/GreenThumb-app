// --- GreenThumb Edge Function: update-subscription ---
// Handles subscription updates (reactivation, plan changes, etc.)
// Follows Deno/Edge Function conventions

// @ts-expect-error Supabase Edge import
import { createClient } from "npm:@supabase/supabase-js@2";
// @ts-expect-error Supabase Edge import
import { z } from "npm:zod";
// @ts-expect-error Stripe Deno import
import Stripe from "npm:stripe@12.18.0";

// --- CORS headers ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

// --- Supabase client (Edge runtime) ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing env vars");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// --- Stripe client ---
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
if (!STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY env var");
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

// --- Request schema ---
const UpdateSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  updates: z.record(z.any()),
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { subscriptionId, updates } = UpdateSubscriptionSchema.parse(body);

    // Update the subscription in Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, updates);

    // Update the subscription in our database
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        status: subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (updateError) {
      console.error("[update-subscription] Error updating database:", updateError);
      return Response.json(
        { error: "Failed to update subscription in database" },
        { status: 500, headers: corsHeaders }
      );
    }

    return Response.json(
      { 
        success: true, 
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
        }
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("[update-subscription] Handler error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 400, headers: corsHeaders }
    );
  }
});
