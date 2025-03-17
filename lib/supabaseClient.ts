import { createClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/supabase.schema";
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

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: {
      async getItem(key: string) {
        return SecureStore.getItemAsync(key);
      },
      async setItem(key: string, value: string) {
        await SecureStore.setItemAsync(key, value);
      },
      async removeItem(key: string) {
        await SecureStore.deleteItemAsync(key);
      },
    },
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
