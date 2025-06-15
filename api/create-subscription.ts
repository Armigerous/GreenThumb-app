/**
 * API endpoint for creating Stripe subscriptions
 * 
 * This creates a recurring subscription, not a one-time payment.
 * Deploy this as a serverless function.
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, userId, userEmail } = req.body;

    if (!planId || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get plan details from database
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    if (!plan.stripe_price_id) {
      return res.status(400).json({ error: 'Plan not configured for Stripe' });
    }

    // Get or create customer
    let customer: Stripe.Customer;
    try {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userId: userId,
          },
        });
      }
    } catch (error) {
      console.error('Error creating/retrieving customer:', error);
      return res.status(500).json({ error: 'Failed to create customer' });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: plan.stripe_price_id,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: userId,
        planId: planId,
      },
    });

    // The subscription will be created in the database via webhook
    // when the payment is successful

    res.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as Stripe.Invoice)?.payment_intent
        ? ((subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent)?.client_secret
        : null,
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
} 