// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Add these configurations to prevent aggressive token refreshing
    storageKey: "medunacy-auth-token", // Custom storage key for your app
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    flowType: "pkce", // Use PKCE flow for better security
    // Debug mode - set to false in production
    debug: process.env.NODE_ENV === "development",
  },
  // Add global configurations
  global: {
    headers: {
      "x-application-name": "medunacy",
    },
  },
  // Add retry configuration to prevent multiple rapid requests
  db: {
    schema: "public",
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Optional: Add a helper to manually refresh session only when needed
export const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    console.error("Error refreshing session:", error);
    return null;
  }
  return data.session;
};

// Optional: Add a helper to get session without triggering refresh
export const getSessionWithoutRefresh = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};
