// src/contexts/AuthContext.tsx - Fixed version
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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

  // Track if we've already fetched user data
  const userDataFetchedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  // Fetch user data
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

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Error getting session:", error);
          setUser(null);
          setLoading(false);
          setIsInitialized(true);
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
          userDataFetchedRef.current = true;
          lastUserIdRef.current = session.user.id;
        } else {
          setUser(null);
        }

        setLoading(false);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error in initializeAuth:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth event:", event);

      // Ignore INITIAL_SESSION - we handle this in initializeAuth
      if (event === "INITIAL_SESSION") {
        return;
      }

      // Handle token refresh
      if (event === "TOKEN_REFRESHED" && session) {
        // Just update the session without refetching user data
        setUser((current) => {
          if (!current) return null;
          return {
            ...session.user,
            role: current.role,
            subscription_status: current.subscription_status,
            preferred_language: current.preferred_language,
          } as UserWithRole;
        });
        return;
      }

      // Handle sign in
      if (event === "SIGNED_IN" && session) {
        // Check if this is the same user (token refresh scenario)
        if (
          lastUserIdRef.current === session.user.id &&
          userDataFetchedRef.current
        ) {
          // Same user, just update the session
          setUser((current) => {
            if (!current) return null;
            return {
              ...session.user,
              role: current.role,
              subscription_status: current.subscription_status,
              preferred_language: current.preferred_language,
            } as UserWithRole;
          });
          return;
        }

        // New sign in - fetch user data
        const userData = await fetchUserData(session.user.id);
        const userWithRole: UserWithRole = {
          ...session.user,
          role: userData.role,
          subscription_status: userData.subscription_status,
          preferred_language: userData.preferred_language,
        };

        setUser(userWithRole);
        userDataFetchedRef.current = true;
        lastUserIdRef.current = session.user.id;

        // Handle language redirect for new sign ins
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
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        userDataFetchedRef.current = false;
        lastUserIdRef.current = null;
      } else if (event === "USER_UPDATED" && session) {
        // User data was updated - refetch
        const userData = await fetchUserData(session.user.id);
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
  }, [fetchUserData, pathname, router]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      userDataFetchedRef.current = false;
      lastUserIdRef.current = null;
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
