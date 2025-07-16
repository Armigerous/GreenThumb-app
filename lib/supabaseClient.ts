import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import * as SecureStore from "expo-secure-store";

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Function type for getting the token
type GetTokenFn = () => Promise<string | null>;

// Store the token provider function
let getTokenProvider: GetTokenFn | null = null;

// Function to set the token provider
export const setTokenProvider = (provider: GetTokenFn) => {
  getTokenProvider = provider;
};

// Device check for SecureStore usage (works in Expo/React Native, not in Node.js/EAS build)
const isDevice = typeof window !== "undefined" && typeof navigator !== "undefined" && !!navigator.product;

const secureStoreAdapter = isDevice
  ? {
      async getItem(key: string) {
        return SecureStore.getItemAsync(key);
      },
      async setItem(key: string, value: string) {
        await SecureStore.setItemAsync(key, value);
      },
      async removeItem(key: string) {
        await SecureStore.deleteItemAsync(key);
      },
    }
  : {
      async getItem() {
        return null;
      },
      async setItem() {},
      async removeItem() {},
    };

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: async (url, options = {}) => {
      // Get the token using the provider if available
      const token = getTokenProvider ? await getTokenProvider() : null;

      const headers = new Headers(options?.headers);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return fetch(url, {
        ...options,
        headers,
      });
    },
  },
});

// Function to set the auth token from Clerk
export const setSupabaseToken = async (
  session: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    user: { id: string; aud: string };
  } | null
) => {
  if (session) {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  } else {
    await supabase.auth.signOut();
  }
};

// Reason: This device-only guard prevents SecureStore from being called in Node.js/EAS build environments, avoiding build-time errors.
