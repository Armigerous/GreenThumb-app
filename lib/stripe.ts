// All Stripe API and webhook logic is handled by Edge Functions. This file is for UI helpers only.
/**
 * Stripe configuration and helper functions for GreenThumb app
 */

import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';

// Get Stripe publishable key from environment
export const STRIPE_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.stripePublishableKey || 
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Stripe publishable key is required. Please set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.');
}

/**
 * Format price in cents to display string
 */
export function formatPrice(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Calculate monthly equivalent price for comparison
 */
export function calculateMonthlyEquivalent(
  priceCents: number, 
  intervalType: 'month' | 'year' | 'one_time', 
  intervalCount: number = 1
): number {
  if (intervalType === 'month') {
    return priceCents / intervalCount;
  } else if (intervalType === 'year') {
    return priceCents / (intervalCount * 12);
  } else {
    // one_time purchases don't have monthly equivalent
    return priceCents;
  }
}

/**
 * Calculate savings percentage compared to monthly plan
 */
export function calculateSavings(
  planPriceCents: number,
  planIntervalType: 'month' | 'year' | 'one_time',
  planIntervalCount: number,
  monthlyPriceCents: number
): number | null {
  if (planIntervalType === 'month' && planIntervalCount === 1) {
    return null; // This is the monthly plan
  }

  const monthlyEquivalent = calculateMonthlyEquivalent(planPriceCents, planIntervalType, planIntervalCount);
  const savings = ((monthlyPriceCents - monthlyEquivalent) / monthlyPriceCents) * 100;
  
  return Math.round(savings);
}

/**
 * Get plan badge text based on business strategy
 */
export function getPlanBadge(planId: string): string | null {
  switch (planId) {
    case 'annual_premium':
      return 'Most Popular';
    case 'six_month_premium':
      return 'Best Value';
    case 'family_annual':
      return 'Family Plan';
    default:
      return null;
  }
}

/**
 * Check if plan is recommended based on business strategy
 */
export function isPlanRecommended(planId: string): boolean {
  // Annual Premium is the primary focus according to business model
  return planId === 'annual_premium';
}

/**
 * Get plan display order based on business priority
 */
export function getPlanDisplayOrder(planId: string): number {
  const order = {
    'annual_premium': 1,      // Primary focus
    'six_month_premium': 2,   // Secondary option
    'family_annual': 3,       // Family option
    'monthly_premium': 4,     // Lowest priority
  };
  
  return order[planId as keyof typeof order] || 999;
}

/**
 * Stripe webhook event types we handle
 */
export const STRIPE_WEBHOOK_EVENTS = {
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
} as const;

/**
 * Map Stripe subscription status to our internal status
 */
export function mapStripeStatus(stripeStatus: string): 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'trialing' {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'canceled':
      return 'canceled';
    case 'past_due':
      return 'past_due';
    case 'unpaid':
      return 'unpaid';
    case 'incomplete':
      return 'incomplete';
    case 'incomplete_expired':
      return 'incomplete_expired';
    case 'trialing':
      return 'trialing';
    default:
      console.warn(`Unknown Stripe status: ${stripeStatus}`);
      return 'incomplete';
  }
}

/**
 * Get user-friendly status text
 */
export function getStatusDisplayText(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'trialing':
      return 'Trial';
    case 'past_due':
      return 'Payment Due';
    case 'canceled':
      return 'Canceled';
    case 'unpaid':
      return 'Payment Failed';
    case 'incomplete':
      return 'Setup Required';
    case 'incomplete_expired':
      return 'Setup Expired';
    default:
      return 'Unknown';
  }
}

/**
 * Check if subscription status allows premium features
 */
export function isPremiumStatus(status: string): boolean {
  return ['active', 'trialing'].includes(status);
}

/**
 * Calculate days remaining in subscription period
 */
export function calculateDaysRemaining(periodEnd: string | null): number | null {
  if (!periodEnd) return null;
  
  const endDate = new Date(periodEnd);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format subscription period for display
 */
export function formatSubscriptionPeriod(
  periodStart: string | null, 
  periodEnd: string | null
): string {
  if (!periodStart || !periodEnd) return 'Unknown period';
  
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  
  const formatOptions: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  
  return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
} 