/**
 * React Query mutations for subscription management
 * 
 * Handles subscription cancellation, updates, and addon management
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

/**
 * Cancel a subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subscriptionId, cancelAtPeriodEnd }: { 
      subscriptionId: string; 
      cancelAtPeriodEnd: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscriptionId,
          cancelAtPeriodEnd,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate subscription queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['userSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionSummary'] });
    },
  });
}

/**
 * Update a subscription
 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subscriptionId, updates }: { 
      subscriptionId: string; 
      updates: Record<string, any>;
    }) => {
      const { data, error } = await supabase.functions.invoke('update-subscription', {
        body: {
          subscriptionId,
          updates,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to update subscription');
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate subscription queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['userSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionSummary'] });
    },
  });
}

/**
 * Add an addon to a subscription
 */
export function useAddSubscriptionAddon() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subscriptionId, addonId, quantity = 1 }: { 
      subscriptionId: string; 
      addonId: string;
      quantity?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('add-subscription-addon', {
        body: {
          subscriptionId,
          addonId,
          quantity,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to add subscription addon');
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate subscription queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['userSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionSummary'] });
    },
  });
}

/**
 * Remove an addon from a subscription
 */
export function useRemoveSubscriptionAddon() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subscriptionId, addonId }: { 
      subscriptionId: string; 
      addonId: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('remove-subscription-addon', {
        body: {
          subscriptionId,
          addonId,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to remove subscription addon');
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate subscription queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['userSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionSummary'] });
    },
  });
}

/**
 * Create a customer portal session for subscription management
 */
export function useCreateCustomerPortalSession() {
  return useMutation({
    mutationFn: async ({ returnUrl }: { returnUrl: string }) => {
      const { data, error } = await supabase.functions.invoke('create-customer-portal-session', {
        body: {
          returnUrl,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create customer portal session');
      }

      return data;
    },
  });
}
