// src/contexts/AuthContext.tsx - Simplified version
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

interface UserWithRole extends User {
  role?: "user" | "doctor" | "admin";
  subscription_status?: "free" | "premium" | "trial";
  first_name?: string;
  last_name?: string;
  phone?: string;
  preferred_language?: "et" | "ukr";
  is_verified?: boolean;
}

interface AuthContextType {
  user: UserWithRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isInitialized: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Helper function to check for language transitions
  const checkLanguageTransition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const transitionData = sessionStorage.getItem("medunacy_lang_transition");
    if (!transitionData) return null;

    try {
      const data = JSON.parse(transitionData);
      // Check if transition is recent (within 5 seconds)
      if (Date.now() - data.timestamp < 5000) {
        return data;
      }
    } catch {
      // Invalid data
    }

    sessionStorage.removeItem("medunacy_lang_transition");
    return null;
  }, []);

  // Fetch user data and cache it in memory
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("role, preferred_language, subscription_status")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error.message);
        return {
          role: "user" as const,
          preferred_language: null,
          subscription_status: "free" as const,
        };
      }

      return {
        role: (userData?.role || "user") as UserWithRole["role"],
        preferred_language: userData?.preferred_language,
        subscription_status: userData?.subscription_status || "free",
      };
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      return {
        role: "user" as const,
        preferred_language: null,
        subscription_status: "free" as const,
      };
    }
  }, []);

  // Initialize auth state - runs once on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check if we're in a language transition
        const transition = checkLanguageTransition();

        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Error getting session:", error);
          setUser(null);
          return;
        }

        if (session?.user) {
          const userData = await fetchUserData(session.user.id);
          if (!mounted) return;

          const userWithRole: UserWithRole = {
            ...session.user,
            role: userData.role,
            subscription_status: userData.subscription_status,
            preferred_language: userData.preferred_language,
          };

          setUser(userWithRole);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error in initializeAuth:", error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    // Set up auth state listener for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth event:", event);

      if (event === "SIGNED_OUT") {
        // User signed out - clear everything
        setUser(null);
        setLoading(false);
        return;
      }

      if (event === "SIGNED_IN" && session?.user) {
        // User signed in - fetch and cache user data
        const userData = await fetchUserData(session.user.id);

        if (!mounted) return;

        const userWithRole: UserWithRole = {
          ...session.user,
          role: userData.role,
          subscription_status: userData.subscription_status,
          preferred_language: userData.preferred_language,
        };

        setUser(userWithRole);

        // Handle language redirect on sign in
        if (userData.preferred_language) {
          const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";

          if (userData.preferred_language !== currentLocale) {
            const pathWithoutLocale =
              pathname.replace(/^\/(et|ukr)/, "") || "/dashboard";
            const newPath = `/${userData.preferred_language}${pathWithoutLocale}`;

            setTimeout(() => {
              if (mounted) {
                router.push(newPath);
              }
            }, 500);
          }
        }

        setLoading(false);
      }

      if (event === "TOKEN_REFRESHED" && session?.user) {
        // Token was refreshed - keep cached user data with updated session info
        setUser((current) => {
          if (!current) return null;
          // Only update base User properties, keep our custom properties
          return {
            ...session.user,
            role: current.role,
            subscription_status: current.subscription_status,
            preferred_language: current.preferred_language,
            first_name: current.first_name,
            last_name: current.last_name,
            phone: current.phone,
            is_verified: current.is_verified,
          } as UserWithRole;
        });
      }

      if (event === "USER_UPDATED" && session?.user) {
        // User data was updated - refetch to get latest data
        const userData = await fetchUserData(session.user.id);

        if (!mounted) return;

        const userWithRole: UserWithRole = {
          ...session.user,
          role: userData.role,
          subscription_status: userData.subscription_status,
          preferred_language: userData.preferred_language,
        };

        setUser(userWithRole);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData, pathname, router, checkLanguageTransition]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);

      // Clear user state immediately
      setUser(null);

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
      }

      // Clear any session storage
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }

      // Redirect to home
      const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";
      router.push(`/${currentLocale}`);
    } catch (error) {
      console.error("Error in signOut:", error);
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
