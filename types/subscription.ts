/**
 * Subscription system types for GreenThumb app
 * 
 * These types define the structure for subscription plans, user subscriptions,
 * add-ons, and payment history in the Stripe integration.
 */

// SubscriptionPlan type is always sourced from Supabase's generated types for accuracy.
// If the DB schema changes, regenerate types and this will stay up to date.
import type { Database } from "./supabase";

export type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"];
export type SubscriptionAddon = Database["public"]["Tables"]["subscription_addons"]["Row"];
export type UserSubscription = Database["public"]["Tables"]["user_subscriptions"]["Row"];
export type UserSubscriptionAddon = Database["public"]["Tables"]["user_subscription_addons"]["Row"];
export type PaymentHistory = Database["public"]["Tables"]["payment_history"]["Row"];

export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'unpaid' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'trialing';

export type PaymentStatus = 
  | 'succeeded' 
  | 'pending' 
  | 'failed' 
  | 'canceled' 
  | 'refunded';

export type IntervalType = 'month' | 'year' | 'one_time';

/**
 * Subscription plan definition
 */

/**
 * User's active subscription
 */

/**
 * Available subscription add-ons (upsells)
 */

/**
 * User's purchased add-ons
 */

/**
 * Payment history record
 */

/**
 * Subscription summary for dashboard display
 */
export interface SubscriptionSummary {
  /** Whether user has an active subscription */
  is_premium: boolean;
  /** Current subscription details (if any) */
  subscription: UserSubscription | null;
  /** Days remaining in current period */
  days_remaining: number | null;
  /** Whether subscription will auto-renew */
  will_renew: boolean;
  /** Next billing date */
  next_billing_date: string | null;
  /** Total monthly value of add-ons */
  addons_value_cents: number;
}

/**
 * Pricing display helper
 */
export interface PricingDisplay {
  /** Plan details */
  plan: SubscriptionPlan;
  /** Formatted price string (e.g., "$79.99") */
  formatted_price: string;
  /** Price per month for comparison */
  monthly_equivalent: number;
  /** Savings compared to monthly plan */
  savings_percent: number | null;
  /** Whether this is the recommended plan */
  is_recommended: boolean;
  /** Badge text (e.g., "Most Popular", "Best Value") */
  badge: string | null;
}

/**
 * Checkout session data
 */
export interface CheckoutSession {
  /** Selected plan ID */
  plan_id: string;
  /** Selected add-on IDs */
  addon_ids: string[];
  /** Stripe checkout session ID */
  stripe_session_id: string;
  /** Checkout URL */
  checkout_url: string;
}

/**
 * Subscription management actions
 */
export type SubscriptionAction = 
  | 'upgrade'
  | 'downgrade' 
  | 'cancel'
  | 'reactivate'
  | 'add_addon'
  | 'remove_addon';

/**
 * Subscription change request
 */
export interface SubscriptionChangeRequest {
  /** Type of change */
  action: SubscriptionAction;
  /** New plan ID (for upgrades/downgrades) */
  new_plan_id?: string;
  /** Add-on ID (for add-on changes) */
  addon_id?: string;
  /** Whether to prorate the change */
  prorate?: boolean;
  /** When the change should take effect */
  effective_date?: 'now' | 'next_period';
}

/**
 * Composite type for user subscription with add-ons (for UI/view models)
 *
 * Reason: Supabase canonical UserSubscription does not include add-ons directly. This type is used when you join user_subscription_addons and subscription_addons for display.
 */
export interface UserSubscriptionWithAddons extends UserSubscription {
  /**
   * List of add-ons for this subscription, each with both the join row and the add-on details
   */
  addons: Array<{
    userAddon: UserSubscriptionAddon;
    addon: SubscriptionAddon;
  }>;
} 