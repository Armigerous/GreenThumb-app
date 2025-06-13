import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Initialize Sentry
export const initSentry = () => {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not found in environment variables');
    return;
  }

  Sentry.init({
    dsn,
    debug: __DEV__, // Enable debug mode in development
    environment: __DEV__ ? 'development' : 'production',
    
    // Set sample rates
    tracesSampleRate: __DEV__ ? 1.0 : 0.2, // Higher sampling in dev, lower in prod
    
    // Enable automatic session tracking
    autoSessionTracking: true,
    
    // Configure release information
    release: Constants.expoConfig?.version || '1.0.0',
    dist: typeof Constants.expoConfig?.runtimeVersion === 'string' 
      ? Constants.expoConfig.runtimeVersion 
      : '1.0.0',
    
    // Configure what gets sent to Sentry
    beforeSend(event, hint) {
      // Filter out development-only errors or sensitive information
      if (__DEV__) {
        console.log('Sentry event:', event);
      }
      
      // Don't send events for certain error types in development
      if (__DEV__ && event.exception) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Skip common development errors
          if (error.message.includes('Network request failed') ||
              error.message.includes('Unable to resolve host')) {
            return null;
          }
        }
      }
      
      return event;
    },
    
    // Configure user context
    initialScope: {
      tags: {
        platform: 'react-native',
        expo: true,
      },
    },
  });
};

// Helper function to capture exceptions with additional context
export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
};

// Helper function to capture messages
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key]);
      });
    }
    Sentry.captureMessage(message, level);
  });
};

// Helper function to set user context
export const setUser = (user: { id?: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

// Helper function to add breadcrumb
export const addBreadcrumb = (message: string, category?: string, level?: Sentry.SeverityLevel) => {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info',
    timestamp: Date.now() / 1000,
  });
};

// Export Sentry for direct use if needed
export { Sentry }; 