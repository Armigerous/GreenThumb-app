/**
 * Strategic subscription trigger system
 * 
 * Tracks user behavior and shows subscription prompts at optimal moments
 * without being intrusive or disrupting the flow.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscriptionSummary } from './subscriptionQueries';
import { useUsageSummary } from './usageLimits';

// Storage keys for tracking user behavior
const STORAGE_KEYS = {
  FIRST_SIGNUP_DATE: 'greenthumb_first_signup_date',
  PROMPT_HISTORY: 'greenthumb_prompt_history',
  USER_ENGAGEMENT: 'greenthumb_user_engagement',
  LAST_PROMPT_DATE: 'greenthumb_last_prompt_date',
} as const;

// Timing rules for subscription prompts
const PROMPT_RULES = {
  // Don't show more than once per day
  MIN_HOURS_BETWEEN_PROMPTS: 24,
  
  // Show first prompt after user has been engaged for a while
  FIRST_PROMPT_AFTER_ACTIONS: 5,
  
  // Show limit prompts when user hits 70% of their limit
  USAGE_PROMPT_THRESHOLD: 0.7,
  
  // Show feature discovery after successful actions
  FEATURE_DISCOVERY_AFTER_SUCCESS: 3,
} as const;

export type TriggerMoment = 
  | 'garden_limit_approaching'
  | 'task_limit_approaching' 
  | 'photo_limit_approaching'
  | 'ai_limit_approaching'
  | 'feature_discovery'
  | 'engagement_milestone'
  | 'value_demonstration'
  | 'first_week_reminder';

export interface SubscriptionTrigger {
  moment: TriggerMoment;
  priority: 'low' | 'medium' | 'high';
  title: string;
  subtitle: string;
  feature: string;
  benefits: string[];
  urgency?: 'low' | 'medium' | 'high';
}

/**
 * Hook to manage subscription trigger timing and display logic
 */
export function useSubscriptionTriggers(userId?: string) {
  const { data: subscriptionSummary } = useSubscriptionSummary(userId);
  const usageSummary = useUsageSummary(userId);

  // Don't show triggers to premium users
  const isPremium = subscriptionSummary?.is_premium ?? false;

  /**
   * Track user engagement actions
   */
  const trackEngagement = async (action: string) => {
    if (isPremium || !userId) return;

    try {
      const engagementData = await AsyncStorage.getItem(STORAGE_KEYS.USER_ENGAGEMENT);
      const engagement = engagementData ? JSON.parse(engagementData) : {
        actions: [],
        totalActions: 0,
        streakDays: 0,
        lastActionDate: null,
      };

      engagement.actions.push({
        action,
        timestamp: new Date().toISOString(),
      });
      engagement.totalActions += 1;
      engagement.lastActionDate = new Date().toISOString();

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_ENGAGEMENT, 
        JSON.stringify(engagement)
      );
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  };

  /**
   * Check if we should show a specific trigger
   */
  const shouldShowTrigger = async (trigger: TriggerMoment): Promise<boolean> => {
    if (isPremium) return false;

    try {
      // Check last prompt date
      const lastPromptDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PROMPT_DATE);
      if (lastPromptDate) {
        const hoursSinceLastPrompt = 
          (Date.now() - new Date(lastPromptDate).getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastPrompt < PROMPT_RULES.MIN_HOURS_BETWEEN_PROMPTS) {
          return false;
        }
      }

      // Check prompt history to avoid spamming
      const promptHistory = await AsyncStorage.getItem(STORAGE_KEYS.PROMPT_HISTORY);
      const history = promptHistory ? JSON.parse(promptHistory) : {};
      const triggerCount = history[trigger] || 0;

      // Don't show the same trigger more than 3 times
      if (triggerCount >= 3) return false;

      return true;
    } catch (error) {
      console.error('Error checking trigger eligibility:', error);
      return false;
    }
  };

  /**
   * Mark a trigger as shown
   */
  const markTriggerShown = async (trigger: TriggerMoment) => {
    try {
      // Update last prompt date
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_PROMPT_DATE, 
        new Date().toISOString()
      );

      // Update prompt history
      const promptHistory = await AsyncStorage.getItem(STORAGE_KEYS.PROMPT_HISTORY);
      const history = promptHistory ? JSON.parse(promptHistory) : {};
      history[trigger] = (history[trigger] || 0) + 1;
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.PROMPT_HISTORY, 
        JSON.stringify(history)
      );
    } catch (error) {
      console.error('Error marking trigger shown:', error);
    }
  };

  /**
   * Get the appropriate trigger for current user state
   */
  const getCurrentTrigger = async (): Promise<SubscriptionTrigger | null> => {
    if (isPremium) return null;

    // Check usage-based triggers
    if (usageSummary.gardens.percentage >= 70) {
      const canShow = await shouldShowTrigger('garden_limit_approaching');
      if (canShow) {
        return {
          moment: 'garden_limit_approaching',
          priority: 'high',
          title: 'Garden Limit Approaching',
          subtitle: `You've used ${usageSummary.gardens.current} of ${usageSummary.gardens.limit} gardens`,
          feature: 'gardens',
          benefits: [
            'Create unlimited gardens',
            'Organize plants by location',
            'Family garden sharing'
          ],
          urgency: 'high'
        };
      }
    }

    if (usageSummary.tasks.percentage >= 80) {
      const canShow = await shouldShowTrigger('task_limit_approaching');
      if (canShow) {
        return {
          moment: 'task_limit_approaching',
          priority: 'high',
          title: 'Task Limit Almost Reached',
          subtitle: `You've completed ${usageSummary.tasks.current} of ${usageSummary.tasks.limit} tasks this month`,
          feature: 'tasks_per_month',
          benefits: [
            'Unlimited task completions',
            'Advanced scheduling',
            'Performance analytics'
          ],
          urgency: 'high'
        };
      }
    }

    // Check engagement-based triggers
    try {
      const engagementData = await AsyncStorage.getItem(STORAGE_KEYS.USER_ENGAGEMENT);
      if (engagementData) {
        const engagement = JSON.parse(engagementData);
        
        // Show feature discovery after some engagement
        if (engagement.totalActions >= PROMPT_RULES.FEATURE_DISCOVERY_AFTER_SUCCESS) {
          const canShow = await shouldShowTrigger('feature_discovery');
          if (canShow) {
            return {
              moment: 'feature_discovery',
              priority: 'medium',
              title: 'Unlock Advanced Features',
              subtitle: 'You\'re doing great! See what else GreenThumb can do',
              feature: 'advanced_analytics',
              benefits: [
                'AI-powered plant recommendations',
                'Weather-aware notifications',
                'Expert consultation access'
              ],
              urgency: 'medium'
            };
          }
        }
      }
    } catch (error) {
      console.error('Error checking engagement triggers:', error);
    }

    return null;
  };

  /**
   * Check if user is in their first week (good time for gentle prompts)
   */
  const isFirstWeek = async (): Promise<boolean> => {
    try {
      const signupDate = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_SIGNUP_DATE);
      if (!signupDate) {
        // Set signup date if not set
        await AsyncStorage.setItem(
          STORAGE_KEYS.FIRST_SIGNUP_DATE, 
          new Date().toISOString()
        );
        return true;
      }

      const daysSinceSignup = 
        (Date.now() - new Date(signupDate).getTime()) / (1000 * 60 * 60 * 24);
      
      return daysSinceSignup <= 7;
    } catch (error) {
      console.error('Error checking first week status:', error);
      return false;
    }
  };

  return {
    trackEngagement,
    shouldShowTrigger,
    markTriggerShown,
    getCurrentTrigger,
    isFirstWeek,
    isPremium,
    usageSummary
  };
}

/**
 * Pre-defined trigger templates for common scenarios
 */
export const TRIGGER_TEMPLATES: Record<TriggerMoment, Omit<SubscriptionTrigger, 'subtitle'>> = {
  garden_limit_approaching: {
    moment: 'garden_limit_approaching',
    priority: 'high',
    title: 'Unlock Unlimited Gardens',
    feature: 'gardens',
    benefits: [
      'Create unlimited gardens',
      'Organize plants by location',
      'Track multiple growing spaces',
      'Family garden sharing'
    ],
    urgency: 'high'
  },
  
  task_limit_approaching: {
    moment: 'task_limit_approaching',
    priority: 'high',
    title: 'Unlimited Plant Care Tasks',
    feature: 'tasks_per_month',
    benefits: [
      'Complete unlimited tasks',
      'Advanced task scheduling',
      'Seasonal recommendations',
      'Performance tracking'
    ],
    urgency: 'high'
  },

  photo_limit_approaching: {
    moment: 'photo_limit_approaching',
    priority: 'medium',
    title: 'Unlimited Photo Uploads',
    feature: 'photo_uploads',
    benefits: [
      'Unlimited photo storage',
      'AI-powered plant identification',
      'Growth progress tracking',
      'Photo organization tools'
    ],
    urgency: 'medium'
  },

  ai_limit_approaching: {
    moment: 'ai_limit_approaching',
    priority: 'medium',
    title: 'Unlimited AI Suggestions',
    feature: 'ai_suggestions',
    benefits: [
      'Unlimited AI recommendations',
      'Personalized care advice',
      'Problem diagnosis',
      'Seasonal tips'
    ],
    urgency: 'medium'
  },

  feature_discovery: {
    moment: 'feature_discovery',
    priority: 'medium',
    title: 'Discover Premium Features',
    feature: 'advanced_analytics',
    benefits: [
      'Advanced plant analytics',
      'Weather integration',
      'Expert consultations',
      'Priority support'
    ],
    urgency: 'low'
  },

  engagement_milestone: {
    moment: 'engagement_milestone',
    priority: 'low',
    title: 'You\'re Becoming a Plant Expert!',
    feature: 'expert_consultations',
    benefits: [
      'One-on-one expert sessions',
      'Certified plant specialists',
      'Custom care plans',
      'Plant health diagnosis'
    ],
    urgency: 'low'
  },

  value_demonstration: {
    moment: 'value_demonstration',
    priority: 'medium',
    title: 'Save Money on Plant Care',
    feature: 'advanced_analytics',
    benefits: [
      '85% plant survival guarantee',
      'Save $200+ on plant replacements',
      'Prevent common plant problems',
      'Expert guidance included'
    ],
    urgency: 'medium'
  },

  first_week_reminder: {
    moment: 'first_week_reminder',
    priority: 'low',
    title: 'Getting the Most from GreenThumb',
    feature: 'gardens',
    benefits: [
      'Unlimited gardens and plants',
      'AI-powered recommendations',
      'Expert support when needed',
      'Advanced tracking tools'
    ],
    urgency: 'low'
  }
}; 