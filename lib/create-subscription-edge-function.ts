// --- GreenThumb Edge Function: create-subscription ---
// Accepts { planId, userId, userEmail }, fetches plan, creates Stripe subscription, returns { clientSecret, subscriptionId }
// Follows Deno/Edge Function conventions as in generate-plant-tasks-edge-function.ts

// @ts-expect-error Supabase Edge import
import { createClient } from "npm:@supabase/supabase-js@2";
// @ts-expect-error Supabase Edge import
import { z } from "npm:zod";
// @ts-expect-error Stripe Deno import
import Stripe from "npm:stripe@12.18.0";

// --- CORS headers (define locally) ---
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
const CreateSubscriptionSchema = z.object({
  planId: z.string(),
  userId: z.string(),
  userEmail: z.string().email(),
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Debug: Log request method and headers
    console.log("[Edge] Request method:", req.method);
    console.log("[Edge] Request headers:", JSON.stringify([...req.headers]));

    const body = await req.json();
    // Debug: Log request body
    console.log("[Edge] Request body:", body);

    const { planId, userId, userEmail } = CreateSubscriptionSchema.parse(body);

    // --- Fetch plan from Supabase ---
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();
    if (planError || !plan) {
      return Response.json(
        { error: "Plan not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    if (!plan.stripe_price_id) {
      return Response.json(
        { error: "Plan is missing Stripe price ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    // --- Find or create Stripe customer by email ---
    let customer;
    // Try to find existing customer by email
    const existingCustomers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
    }

    // --- Create subscription with payment_behavior: 'default_incomplete' ---
    let subscription;
    try {
      subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: plan.stripe_price_id }],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
        metadata: { userId, planId },
      });
    } catch (stripeErr) {
      console.error("[Edge] Stripe subscription error:", stripeErr);
      return Response.json(
        { error: stripeErr instanceof Error ? stripeErr.message : "Unknown Stripe error" },
        { status: 500, headers: corsHeaders }
      );
    }

    // --- Get PaymentIntent client_secret ---
    const paymentIntent = subscription.latest_invoice?.payment_intent;
    if (!paymentIntent || typeof paymentIntent !== "object" || !("client_secret" in paymentIntent)) {
      return Response.json(
        { error: "Failed to create payment intent" },
        { status: 500, headers: corsHeaders }
      );
    }
    const clientSecret = paymentIntent.client_secret;
    const subscriptionId = subscription.id;

    // --- Return response ---
    return Response.json(
      { clientSecret, subscriptionId },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    // Debug: Log the error stack
    console.error("[Edge] Handler error:", err, err?.stack);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 400, headers: corsHeaders }
    );
  }
}); 