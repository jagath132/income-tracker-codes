import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Use environment variables first, with hardcoded fallbacks for local development.
// This is a common pattern that supports both easy local setup and secure production deployment.
const supabaseUrl = process.env.SUPABASE_URL || "https://apkrbvoqsharjrfgevqp.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwa3Jidm9xc2hhcmpyZmdldnFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2OTA2MTEsImV4cCI6MjA3NDI2NjYxMX0.ZmAh285vVBPCcmR8Cs40cJ7aeKpbC4vJXQQwkDYTVEs";

const createSupabaseClient = (): SupabaseClient | null => {
    // Check if credentials are available either from env vars or hardcoded values.
    if (!supabaseUrl || !supabaseAnonKey) {
        // This will trigger the configuration error screen in App.tsx if credentials are still missing.
        console.warn("Supabase URL or Anon Key is not configured.");
        return null;
    }

    try {
        // Initialize the client.
        return createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error("Failed to initialize Supabase client:", error);
        return null;
    }
};

export const supabase = createSupabaseClient();