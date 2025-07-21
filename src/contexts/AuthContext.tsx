"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

interface UserWithRole extends User {
  role?: "user" | "doctor" | "admin";
}

interface AuthContextType {
  user: UserWithRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // src/contexts/AuthContext.tsx - Replace the entire useEffect section
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          // Fetch user role from the users table
          const { data: userData, error } = await supabase
            .from("users")
            .select("role, preferred_language")
            .eq("user_id", session.user.id)
            .single();

          if (!mounted) return;

          if (error) {
            console.error("Error fetching user role:", error.message);
          }

          // Combine session user with role
          const userWithRole: UserWithRole = {
            ...session.user,
            role: userData?.role || "user",
          };

          setUser(userWithRole);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error in getSession:", error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        if (session?.user) {
          // Fetch user role from the users table
          const { data: userData, error } = await supabase
            .from("users")
            .select("role, preferred_language")
            .eq("user_id", session.user.id)
            .single();

          if (!mounted) return;

          if (error) {
            console.error("Error fetching user role:", error.message);
          }

          // Combine session user with role
          const userWithRole: UserWithRole = {
            ...session.user,
            role: userData?.role || "user",
          };

          setUser(userWithRole);

          // Handle language switching after successful login
          if (event === "SIGNED_IN" && userData?.preferred_language) {
            const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";
            const preferredLocale = userData.preferred_language as string;

            // If user's preferred language doesn't match current locale, redirect
            if (preferredLocale !== currentLocale) {
              const pathWithoutLocale =
                pathname.replace(/^\/(et|ukr)/, "") || "/";
              const newPath = `/${preferredLocale}${pathWithoutLocale}`;

              // Use setTimeout to avoid conflicts with other redirects
              setTimeout(() => {
                if (mounted) {
                  router.push(newPath);
                }
              }, 100);
            }
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove pathname dependency to prevent infinite loops

  const signOut = async () => {
    try {
      // Clear user state immediately
      setUser(null);

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Wait a moment for auth state to propagate
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get current locale and redirect
      const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";
      router.push(`/${currentLocale}`);

      // Force a page refresh to ensure clean state
      setTimeout(() => {
        window.location.href = `/${currentLocale}`;
      }, 200);
    } catch (error) {
      console.error("Error signing out:", error);
      // Still redirect even if there's an error
      const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";
      window.location.href = `/${currentLocale}`;
    }
  };

  // ADD THIS RETURN STATEMENT - this was missing!
  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
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
