// src/contexts/AuthContext.tsx - Fixed version with language transition support
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
}

interface AuthContextType {
  user: UserWithRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isInitialized: boolean;
  isHydrating: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isInitialized: false,
  isHydrating: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Helper function to check for language transitions
  const checkLanguageTransition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const transitionData = sessionStorage.getItem("medunacy_lang_transition");
    if (!transitionData) return null;

    try {
      const data = JSON.parse(transitionData);
      // Check if transition is recent (within 2 seconds)
      if (Date.now() - data.timestamp < 2000) {
        return data;
      }
    } catch {
      // Invalid data
    }

    sessionStorage.removeItem("medunacy_lang_transition");
    return null;
  }, []);

  // Memoize the user fetch function to prevent recreating it
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("role, preferred_language")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error.message);
        return { role: "user" as const, preferred_language: null };
      }

      return {
        role: (userData?.role || "user") as UserWithRole["role"],
        preferred_language: userData?.preferred_language,
      };
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      return { role: "user" as const, preferred_language: null };
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check if we're in a language transition
        const transition = checkLanguageTransition();
        if (transition && transition.isAuthenticated) {
          // During language switch, maintain loading state briefly
          // but don't clear the user to prevent flash
          setLoading(true);
        }

        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Error getting session:", error);
          // Only clear user if not in transition
          if (!transition || !transition.isAuthenticated) {
            setUser(null);
          }
          return;
        }

        if (session?.user) {
          const userData = await fetchUserData(session.user.id);

          if (!mounted) return;

          const userWithRole: UserWithRole = {
            ...session.user,
            role: userData.role,
          };

          setUser(userWithRole);
        } else {
          // Only clear user if not in transition
          if (!transition || !transition.isAuthenticated) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error in initializeAuth:", error);
        if (mounted) {
          const transition = checkLanguageTransition();
          if (!transition || !transition.isAuthenticated) {
            setUser(null);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
          setIsHydrating(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Skip if we're still initializing to prevent loops
      if (!isInitialized && event !== "INITIAL_SESSION") return;

      // Check if we're in a language transition
      const transition = checkLanguageTransition();

      console.log("Auth event:", event);

      try {
        if (session?.user) {
          const userData = await fetchUserData(session.user.id);

          if (!mounted) return;

          const userWithRole: UserWithRole = {
            ...session.user,
            role: userData.role,
          };

          setUser(userWithRole);

          // Handle language redirect only on SIGNED_IN event and not during language switch
          if (
            event === "SIGNED_IN" &&
            userData.preferred_language &&
            !transition
          ) {
            const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";

            if (userData.preferred_language !== currentLocale) {
              const pathWithoutLocale =
                pathname.replace(/^\/(et|ukr)/, "") || "/dashboard";
              const newPath = `/${userData.preferred_language}${pathWithoutLocale}`;

              // Delay redirect to avoid race conditions
              setTimeout(() => {
                if (mounted) {
                  router.push(newPath);
                }
              }, 500);
            }
          }
        } else {
          if (mounted) {
            // Only clear user if not in transition
            if (!transition || !transition.isAuthenticated) {
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        if (mounted) {
          const transition = checkLanguageTransition();
          if (!transition || !transition.isAuthenticated) {
            setUser(null);
          }
        }
      }

      // Set loading to false after processing
      if (mounted && event !== "INITIAL_SESSION") {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isInitialized, fetchUserData, pathname, router, checkLanguageTransition]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);

      // Clear user state first
      setUser(null);

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
      }

      // Clear any cached data
      if (typeof window !== "undefined") {
        // Clear any localStorage items if you have any
        localStorage.removeItem("supabase.auth.token");
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
    <AuthContext.Provider
      value={{ user, loading, signOut, isInitialized, isHydrating }}
    >
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
