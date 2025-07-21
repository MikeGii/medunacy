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

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch user role from the users table
          const { data: userData, error } = await supabase
            .from("users")
            .select("role")
            .eq("user_id", session.user.id)
            .single();

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
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            // Fetch user role from the users table
            const { data: userData, error } = await supabase
              .from("users")
              .select("role")
              .eq("user_id", session.user.id)
              .single();

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
          console.error("Error in auth state change:", error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();

    // Redirect to main page after sign out
    const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";
    router.push(`/${currentLocale}`);
  };

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