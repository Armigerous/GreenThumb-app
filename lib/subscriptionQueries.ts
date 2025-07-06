/**
 * React Query hooks for subscription management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { 
  SubscriptionPlan, 
  UserSubscription, 
  SubscriptionAddon, 
  UserSubscriptionAddon,
  PaymentHistory,
  SubscriptionSummary,
  PricingDisplay,
  UserSubscriptionWithAddons,
  IntervalType
} from '@/types/subscription';
import { 
  formatPrice, 
  calculateMonthlyEquivalent, 
  calculateSavings, 
  getPlanBadge, 
  isPlanRecommended, 
  getPlanDisplayOrder,
  isPremiumStatus,
  calculateDaysRemaining
} from './stripe';

/**
 * Fetch all available subscription plans
 */
export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[], Error>({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('id');

      if (error) {
        console.error('Error fetching subscription plans:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}

/**
 * Fetch pricing display data with calculations
 */
export function usePricingDisplay() {
  const { data: plans, ...rest } = useSubscriptionPlans();

  const pricingDisplay: PricingDisplay[] | undefined = plans?.map(plan => {
    // Find monthly plan for comparison
    const monthlyPlan = plans.find(p => p.interval_type === 'month' && p.interval_count === 1);
    const monthlyPrice = monthlyPlan?.price_cents || 999; // Default to $9.99 if not found

    return {
      plan,
      formatted_price: formatPrice(plan.price_cents),
      monthly_equivalent: calculateMonthlyEquivalent(plan.price_cents, plan.interval_type as IntervalType, plan.interval_count),
      savings_percent: calculateSavings(plan.price_cents, plan.interval_type as IntervalType, plan.interval_count, monthlyPrice),
      is_recommended: isPlanRecommended(plan.id),
      badge: getPlanBadge(plan.id),
    };
  }).sort((a, b) => getPlanDisplayOrder(a.plan.id) - getPlanDisplayOrder(b.plan.id));

  return {
    data: pricingDisplay,
    ...rest
  };
}

/**
 * Fetch user's current subscription (with add-ons joined)
 *
 * Reason: We need a composite object for UI that includes add-ons, not just the base UserSubscription.
 */
export function useUserSubscription(userId?: string) {
  return useQuery<UserSubscriptionWithAddons | null, Error>({
    queryKey: ['userSubscription', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plan:subscription_plans(*),
          addons:user_subscription_addons(
            *,
            addon:subscription_addons(*)
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No subscription found
          return null;
        }
        console.error('Error fetching user subscription:', error);
        throw new Error(error.message);
      }

      // Map the joined data to the composite type
      const mapped: UserSubscriptionWithAddons = {
        ...data,
        addons: (data.addons || []).map((userAddon: any) => ({
          userAddon: {
            id: userAddon.id,
            addon_id: userAddon.addon_id,
            created_at: userAddon.created_at,
            quantity: userAddon.quantity,
            stripe_subscription_item_id: userAddon.stripe_subscription_item_id,
            updated_at: userAddon.updated_at,
            user_subscription_id: userAddon.user_subscription_id,
          },
          addon: userAddon.addon,
        })),
      };
      return mapped;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Fetch subscription summary for dashboard
 *
 * Reason: Use the composite UserSubscriptionWithAddons type for the subscription property.
 */
export function useSubscriptionSummary(userId?: string) {
  const { data: subscription, ...subscriptionQuery } = useUserSubscription(userId);

  const summary: SubscriptionSummary | undefined = subscription ? {
    is_premium: isPremiumStatus(subscription.status),
    subscription,
    days_remaining: calculateDaysRemaining(subscription.current_period_end),
    will_renew: !subscription.cancel_at_period_end,
    next_billing_date: subscription.current_period_end,
    addons_value_cents: subscription.addons?.reduce((total, addon) => 
      total + (addon.addon?.price_cents || 0) * (addon.userAddon.quantity || 1), 0
    ) || 0,
  } : {
    is_premium: false,
    subscription: null,
    days_remaining: null,
    will_renew: false,
    next_billing_date: null,
    addons_value_cents: 0,
  };

  return {
    data: summary,
    ...subscriptionQuery
  };
}

/**
 * Fetch available subscription add-ons
 */
export function useSubscriptionAddons() {
  return useQuery<SubscriptionAddon[], Error>({
    queryKey: ['subscriptionAddons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_addons')
        .select('*')
        .eq('is_active', true)
        .order('price_cents');

      if (error) {
        console.error('Error fetching subscription add-ons:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}

/**
 * Fetch user's payment history
 */
export function usePaymentHistory(userId?: string) {
  return useQuery<PaymentHistory[], Error>({
    queryKey: ['paymentHistory', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching payment history:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Create a new subscription
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionData: Partial<UserSubscription>) => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([subscriptionData])
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch subscription queries
      queryClient.invalidateQueries({ queryKey: ['userSubscription', data.user_id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionSummary', data.user_id] });
    },
  });
}

/**
 * Update subscription status
 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      subscriptionId, 
      updates 
    }: { 
      subscriptionId: string; 
      updates: Partial<UserSubscription> 
    }) => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch subscription queries
      queryClient.invalidateQueries({ queryKey: ['userSubscription', data.user_id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionSummary', data.user_id] });
    },
  });
}

/**
 * Cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      subscriptionId, 
      cancelAtPeriodEnd = true 
    }: { 
      subscriptionId: string; 
      cancelAtPeriodEnd?: boolean 
    }) => {
      const updates = {
        cancel_at_period_end: cancelAtPeriodEnd,
        ...(cancelAtPeriodEnd ? {} : { 
          status: 'canceled' as const, 
          canceled_at: new Date().toISOString() 
        })
      };

      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) {
        console.error('Error canceling subscription:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch subscription queries
      queryClient.invalidateQueries({ queryKey: ['userSubscription', data.user_id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionSummary', data.user_id] });
    },
  });
}

/**
 * Add payment history record
 */
export function useAddPaymentHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: Partial<PaymentHistory>) => {
      const { data, error } = await supabase
        .from('payment_history')
        .insert([paymentData])
        .select()
        .single();

      if (error) {
        console.error('Error adding payment history:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate payment history query
      queryClient.invalidateQueries({ queryKey: ['paymentHistory', data.user_id] });
    },
  });
} 