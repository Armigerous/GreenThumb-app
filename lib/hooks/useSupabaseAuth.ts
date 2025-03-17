import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { setTokenProvider } from "../supabaseClient";

export function useSupabaseAuth() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set up the token provider
    setTokenProvider(async () => {
      try {
        console.log("Getting Supabase token from Clerk..."); // Debug log
        const token = await getToken({ template: "supabase" });
        console.log("Got token:", token ? "Token received" : "No token"); // Debug log
        return token;
      } catch (error) {
        console.error("Error getting Supabase token:", error);
        return null;
      }
    });
  }, [getToken]);
}
