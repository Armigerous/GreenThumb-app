/**
 * Subscription system types for GreenThumb app
 * 
 * These types define the structure for subscription plans, user subscriptions,
 * add-ons, and payment history in the Stripe integration.
 */

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
export interface SubscriptionPlan {
  /** Unique identifier for the plan */
  id: string;
  /** Display name of the plan */
  name: string;
  /** Detailed description of the plan */
  description: string | null;
  /** Price in cents (e.g., 7999 = $79.99) */
  price_cents: number;
  /** Billing interval type */
  interval_type: IntervalType;
  /** Number of intervals (e.g., 6 months = interval_count: 6, interval_type: 'month') */
  interval_count: number;
  /** Stripe price ID for payment processing */
  stripe_price_id: string | null;
  /** Array of features included in this plan */
  features: string[];
  /** Whether this plan is currently available */
  is_active: boolean;
  /** When this plan was created */
  created_at: string;
  /** When this plan was last updated */
  updated_at: string;
}

/**
 * User's active subscription
 */
export interface UserSubscription {
  /** Unique identifier for the subscription */
  id: string;
  /** User ID from Clerk */
  user_id: string;
  /** Reference to the subscription plan */
  subscription_plan_id: string;
  /** Stripe customer ID */
  stripe_customer_id: string | null;
  /** Stripe subscription ID */
  stripe_subscription_id: string | null;
  /** Current subscription status */
  status: SubscriptionStatus;
  /** Start of current billing period */
  current_period_start: string | null;
  /** End of current billing period */
  current_period_end: string | null;
  /** Whether subscription will cancel at period end */
  cancel_at_period_end: boolean;
  /** When subscription was canceled (if applicable) */
  canceled_at: string | null;
  /** Trial start date (if applicable) */
  trial_start: string | null;
  /** Trial end date (if applicable) */
  trial_end: string | null;
  /** When subscription was created */
  created_at: string;
  /** When subscription was last updated */
  updated_at: string;
  
  // Joined data
  /** The subscription plan details */
  subscription_plan?: SubscriptionPlan;
  /** Associated add-ons */
  addons?: UserSubscriptionAddon[];
}

/**
 * Available subscription add-ons (upsells)
 */
export interface SubscriptionAddon {
  /** Unique identifier for the add-on */
  id: string;
  /** Display name of the add-on */
  name: string;
  /** Detailed description of the add-on */
  description: string | null;
  /** Price in cents */
  price_cents: number;
  /** Stripe price ID for payment processing */
  stripe_price_id: string | null;
  /** Whether this add-on is currently available */
  is_active: boolean;
  /** When this add-on was created */
  created_at: string;
  /** When this add-on was last updated */
  updated_at: string;
}

/**
 * User's purchased add-ons
 */
export interface UserSubscriptionAddon {
  /** Unique identifier for the user's add-on */
  id: string;
  /** Reference to the user's subscription */
  user_subscription_id: string;
  /** Reference to the add-on */
  addon_id: string;
  /** Stripe subscription item ID */
  stripe_subscription_item_id: string | null;
  /** Quantity purchased */
  quantity: number;
  /** When this add-on was purchased */
  created_at: string;
  /** When this add-on was last updated */
  updated_at: string;
  
  // Joined data
  /** The add-on details */
  addon?: SubscriptionAddon;
}

/**
 * Payment history record
 */
export interface PaymentHistory {
  /** Unique identifier for the payment */
  id: string;
  /** User ID from Clerk */
  user_id: string;
  /** Reference to the subscription (if applicable) */
  user_subscription_id: string | null;
  /** Stripe payment intent ID */
  stripe_payment_intent_id: string | null;
  /** Stripe invoice ID */
  stripe_invoice_id: string | null;
  /** Amount paid in cents */
  amount_cents: number;
  /** Currency code */
  currency: string;
  /** Payment status */
  status: PaymentStatus;
  /** Description of the payment */
  description: string | null;
  /** When payment was processed */
  created_at: string;
}

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