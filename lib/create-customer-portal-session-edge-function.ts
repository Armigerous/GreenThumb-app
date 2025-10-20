// --- GreenThumb Edge Function: create-customer-portal-session ---
// Creates a Stripe customer portal session for subscription management
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
const CreatePortalSessionSchema = z.object({
  returnUrl: z.string().url(),
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { returnUrl } = CreatePortalSessionSchema.parse(body);

    // Get the user ID from the request headers (set by Supabase auth)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return Response.json(
        { error: "Missing authorization header" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Extract user ID from JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return Response.json(
        { error: "Invalid authentication" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Get user's subscription to find Stripe customer ID
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription?.stripe_customer_id) {
      return Response.json(
        { error: "No active subscription found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl,
    });

    return Response.json(
      { 
        success: true, 
        url: portalSession.url 
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("[create-customer-portal-session] Handler error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 400, headers: corsHeaders }
    );
  }
});
