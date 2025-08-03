import { useEffect } from "react";
import { Platform } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import {
  checkSupabaseStorage,
  checkRequestingUserIdFunction,
} from "@/utils/initSupabase";
import * as Sentry from "@sentry/react-native";

// Track if Sentry is initialized
let sentryInitialized = false;

/**
 * Component that performs Supabase health checks after the app is fully loaded
 * This prevents these checks from blocking the startup process
 */
export function SupabaseHealthCheck() {
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    // Only run checks if user is signed in and not on web
    if (isSignedIn && Platform.OS !== "web") {
      console.log("🔍 Starting Supabase health checks...");

      // Add a small delay to ensure the app is fully loaded
      const timer = setTimeout(() => {
        try {
          // Check the requesting_user_id function first
          checkRequestingUserIdFunction()
            .then((userId) => {
              console.log("✅ RLS function check complete, user ID:", userId);
            })
            .catch((error) => {
              console.error("❌ Failed to check RLS function:", error);
              if (sentryInitialized) {
                Sentry.captureException(error, {
                  tags: { component: "RLS_function_check" },
                  extra: { userId: userId },
                });
              }
            });

          // Then check storage buckets
          checkSupabaseStorage()
            .then((isReady) => {
              console.log("✅ Storage check complete, bucket ready:", isReady);
            })
            .catch((error) => {
              console.error("❌ Failed to check Supabase storage:", error);
              if (sentryInitialized) {
                Sentry.captureException(error, {
                  tags: { component: "supabase_storage_check" },
                  extra: { userId: userId },
                });
              }
            });
        } catch (error) {
          console.error("❌ Error setting up storage services:", error);
          if (sentryInitialized) {
            Sentry.captureException(error as Error, {
              tags: { component: "storage_services_setup" },
              extra: { userId: userId },
            });
          }
        }
      }, 3000); // 3 second delay to ensure app is fully loaded

      return () => clearTimeout(timer);
    }
  }, [isSignedIn, userId]);

  // This component doesn't render anything
  return null;
}
