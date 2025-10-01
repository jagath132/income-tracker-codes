import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://apkrbvoqsharjrfgevqp.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwa3Jidm9xc2hhcmpyZmdldnFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2OTA2MTEsImV4cCI6MjA3NDI2NjYxMX0.ZmAh285vVBPCcmR8Cs40cJ7aeKpbC4vJXQQwkDYTVEs'; // Replace with your Supabase anon key

const createSupabaseClient = (): SupabaseClient | null => {
    const isInvalid = supabaseUrl === 'YOUR_PROJECT_URL' || supabaseAnonKey === 'YOUR_ANON_KEY' || !supabaseUrl || !supabaseAnonKey;

    if (isInvalid) {
        console.warn("Supabase credentials are not set in services/supabase.ts. The application will show a configuration screen.");
        return null;
    }

    try {
        return createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error("Failed to initialize Supabase client:", error);
        return null;
    }
};

export const supabase = createSupabaseClient();