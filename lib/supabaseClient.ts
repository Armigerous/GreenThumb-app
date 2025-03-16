import { createClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/supabase.schema";

// Supabase credentials from your website project
const supabaseUrl = "https://yeoeirzikcwwoaquqnfb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllb2Vpcnppa2N3d29hcXVxbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NTU0OTksImV4cCI6MjA0ODEzMTQ5OX0.4K4mdH47FuH83Y7dL9pCzsNqw6zPfyjK7gmA0zI8mX4";

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
