/**
 * Usage limits and tracking for GreenThumb subscription system
 * 
 * Defines what free users can do vs premium users, tracks usage,
 * and provides hooks to check limits before actions.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useSubscriptionSummary } from '@/lib/subscriptionQueries';

// Define usage limits
export const USAGE_LIMITS = {
  FREE: {
    gardens: 2,           // Max gardens
    plants_per_garden: 5, // Max plants per garden
    tasks_per_month: 25,  // Max tasks completed per month
    photo_uploads: 10,    // Max photo uploads per month
    ai_suggestions: 5,    // Max AI-generated suggestions per month
    expert_consultations: 0, // No expert access
    advanced_analytics: false, // No analytics
    weather_alerts: false, // No weather integration
    plant_database_access: 'basic', // Limited plant database
  },
  PREMIUM: {
    gardens: -1,          // Unlimited
    plants_per_garden: -1, // Unlimited
    tasks_per_month: -1,  // Unlimited
    photo_uploads: -1,    // Unlimited
    ai_suggestions: -1,   // Unlimited
    expert_consultations: -1, // Unlimited
    advanced_analytics: true,
    weather_alerts: true,
    plant_database_access: 'full',
  }
} as const;

export type UsageLimitKey = keyof typeof USAGE_LIMITS.FREE;

// Usage tracking interface
export interface UserUsage {
  user_id: string;
  gardens_count: number;
  plants_count: number;
  tasks_completed_this_month: number;
  photos_uploaded_this_month: number;
  ai_suggestions_this_month: number;
  expert_consultations_this_month: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to get user's current usage statistics
 */
export function useUserUsage(userId?: string) {
  return useQuery<UserUsage | null, Error>({
    queryKey: ['userUsage', userId],
    queryFn: async () => {
      if (!userId) return null;

      // Check if usage record exists
      let { data: usage, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No usage record found, create one
        const { data: newUsage, error: insertError } = await supabase
          .from('user_usage')
          .insert({
            user_id: userId,
            gardens_count: 0,
            plants_count: 0,
            tasks_completed_this_month: 0,
            photos_uploaded_this_month: 0,
            ai_suggestions_this_month: 0,
            expert_consultations_this_month: 0,
            last_reset_date: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating usage record:', insertError);
          throw new Error(insertError.message);
        }

        usage = newUsage;
      } else if (error) {
        console.error('Error fetching user usage:', error);
        throw new Error(error.message);
      }

      return usage;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Hook to check if user can perform a specific action
 */
export function useCanPerformAction(userId?: string) {
  const { data: subscriptionSummary } = useSubscriptionSummary(userId);
  const { data: usage } = useUserUsage(userId);

  const canPerformAction = (action: UsageLimitKey): { canPerform: boolean; reason?: string; currentUsage?: number; limit?: number } => {
    if (!usage) {
      return { canPerform: false, reason: 'Loading usage data...' };
    }

    const isPremium = subscriptionSummary?.is_premium ?? false;
    const limits = isPremium ? USAGE_LIMITS.PREMIUM : USAGE_LIMITS.FREE;
    const limit = limits[action];

    // For unlimited actions (premium users)
    if (limit === -1) {
      return { canPerform: true };
    }

    // For boolean features
    if (typeof limit === 'boolean') {
      return { 
        canPerform: limit,
        reason: limit ? undefined : 'Premium feature required'
      };
    }

    // For string features
    if (typeof limit === 'string') {
      return { canPerform: true }; // String limits are handled elsewhere
    }

    // For numeric limits
    let currentUsage = 0;
    switch (action) {
      case 'gardens':
        currentUsage = usage.gardens_count;
        break;
      case 'plants_per_garden':
        // This is checked per-garden, not globally
        return { canPerform: true };
      case 'tasks_per_month':
        currentUsage = usage.tasks_completed_this_month;
        break;
      case 'photo_uploads':
        currentUsage = usage.photos_uploaded_this_month;
        break;
      case 'ai_suggestions':
        currentUsage = usage.ai_suggestions_this_month;
        break;
      case 'expert_consultations':
        currentUsage = usage.expert_consultations_this_month;
        break;
      default:
        return { canPerform: true };
    }

    const canPerform = currentUsage < (limit as number);
    
    return {
      canPerform,
      reason: canPerform ? undefined : `You've reached your ${action.replace('_', ' ')} limit`,
      currentUsage,
      limit: limit as number
    };
  };

  return { canPerformAction };
}

/**
 * Hook to increment usage counters
 */
export function useIncrementUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      action, 
      increment = 1 
    }: { 
      userId: string; 
      action: UsageLimitKey; 
      increment?: number 
    }) => {
      let updateField = '';
      
      switch (action) {
        case 'gardens':
          updateField = 'gardens_count';
          break;
        case 'tasks_per_month':
          updateField = 'tasks_completed_this_month';
          break;
        case 'photo_uploads':
          updateField = 'photos_uploaded_this_month';
          break;
        case 'ai_suggestions':
          updateField = 'ai_suggestions_this_month';
          break;
        case 'expert_consultations':
          updateField = 'expert_consultations_this_month';
          break;
        default:
          throw new Error(`Cannot increment ${action}`);
      }

      const { error } = await supabase.rpc('increment_usage', {
        p_user_id: userId,
        p_field: updateField,
        p_increment: increment
      });

      if (error) {
        console.error('Error incrementing usage:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate usage query to refetch data
      queryClient.invalidateQueries({ queryKey: ['userUsage', variables.userId] });
    },
  });
}

/**
 * Hook to get usage summary for display
 */
export function useUsageSummary(userId?: string) {
  const { data: subscriptionSummary } = useSubscriptionSummary(userId);
  const { data: usage } = useUserUsage(userId);
  const { canPerformAction } = useCanPerformAction(userId);

  const isPremium = subscriptionSummary?.is_premium ?? false;
  const limits = isPremium ? USAGE_LIMITS.PREMIUM : USAGE_LIMITS.FREE;

  const summary = {
    isPremium,
    usage,
    limits,
    // Garden usage
    gardens: {
      current: usage?.gardens_count ?? 0,
      limit: limits.gardens,
      canAdd: canPerformAction('gardens').canPerform,
      percentage: limits.gardens === -1 ? 0 : Math.min(100, ((usage?.gardens_count ?? 0) / limits.gardens) * 100)
    },
    // Task usage
    tasks: {
      current: usage?.tasks_completed_this_month ?? 0,
      limit: limits.tasks_per_month,
      canAdd: canPerformAction('tasks_per_month').canPerform,
      percentage: limits.tasks_per_month === -1 ? 0 : Math.min(100, ((usage?.tasks_completed_this_month ?? 0) / limits.tasks_per_month) * 100)
    },
    // Photo usage
    photos: {
      current: usage?.photos_uploaded_this_month ?? 0,
      limit: limits.photo_uploads,
      canAdd: canPerformAction('photo_uploads').canPerform,
      percentage: limits.photo_uploads === -1 ? 0 : Math.min(100, ((usage?.photos_uploaded_this_month ?? 0) / limits.photo_uploads) * 100)
    },
    // AI suggestions usage
    aiSuggestions: {
      current: usage?.ai_suggestions_this_month ?? 0,
      limit: limits.ai_suggestions,
      canAdd: canPerformAction('ai_suggestions').canPerform,
      percentage: limits.ai_suggestions === -1 ? 0 : Math.min(100, ((usage?.ai_suggestions_this_month ?? 0) / limits.ai_suggestions) * 100)
    }
  };

  return summary;
} 