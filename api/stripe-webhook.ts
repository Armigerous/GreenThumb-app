/**
 * Stripe webhook handler for subscription events
 * 
 * Deploy this as a serverless function (Vercel, Netlify, etc.)
 * Make sure to set the webhook endpoint in your Stripe dashboard
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

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;

  // Get customer details
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const userId = customer.metadata?.userId;

  if (!userId) {
    console.error('No userId in customer metadata');
    return;
  }

  // Get the price ID to determine the plan
  const priceId = subscription.items.data[0]?.price.id;
  
  // Find the plan by Stripe price ID
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('stripe_price_id', priceId)
    .single();

  if (!plan) {
    console.error('Plan not found for price ID:', priceId);
    return;
  }

  // Create subscription record
  const { error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      subscription_plan_id: plan.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    });

  if (error) {
    console.error('Error creating subscription:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  // Update subscription record
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  // Mark subscription as canceled
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('Error canceling subscription:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;

  // Get customer details
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const userId = customer.metadata?.userId;

  if (!userId) {
    console.error('No userId in customer metadata');
    return;
  }

  // Get subscription record
  const { data: userSubscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!userSubscription) {
    console.error('User subscription not found');
    return;
  }

  // Add payment history record
  const { error } = await supabase
    .from('payment_history')
    .insert({
      user_id: userId,
      user_subscription_id: userSubscription.id,
      stripe_payment_intent_id: invoice.payment_intent as string,
      amount_cents: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      description: invoice.description || 'Subscription payment',
    });

  if (error) {
    console.error('Error adding payment history:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;

  // Get customer details
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const userId = customer.metadata?.userId;

  if (!userId) {
    console.error('No userId in customer metadata');
    return;
  }

  // Get subscription record
  const { data: userSubscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!userSubscription) {
    console.error('User subscription not found');
    return;
  }

  // Add payment history record
  const { error } = await supabase
    .from('payment_history')
    .insert({
      user_id: userId,
      user_subscription_id: userSubscription.id,
      stripe_payment_intent_id: invoice.payment_intent as string,
      amount_cents: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      description: invoice.description || 'Subscription payment failed',
    });

  if (error) {
    console.error('Error adding payment history:', error);
  }
} 