// src/hooks/useAuthorization.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = "user" | "doctor" | "admin";

interface AuthorizationConfig {
  allowedRoles?: UserRole[];
  redirectOnUnauthorized?: boolean;
  requireAuth?: boolean;
}

interface AuthorizationResult {
  isAuthorized: boolean | null;
  isLoading: boolean;
  user: any;
}

export function useAuthorization(config: AuthorizationConfig = {}): AuthorizationResult {
  const {
    allowedRoles = ["user", "doctor", "admin"],
    redirectOnUnauthorized = true,
    requireAuth = true,
  } = config;

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Don't process while auth is still loading
    if (authLoading) return;

    const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";

    // Handle unauthenticated users
    if (!user) {
      if (requireAuth) {
        setIsAuthorized(false);
        if (redirectOnUnauthorized) {
          router.push(`/${currentLocale}`);
        }
      } else {
        setIsAuthorized(true);
      }
      return;
    }

    // Handle authenticated users
    const userRole = user.role || "user";
    const hasPermission = allowedRoles.includes(userRole as UserRole);

    setIsAuthorized(hasPermission);

    if (!hasPermission && redirectOnUnauthorized) {
      // Redirect based on user role
      if (userRole === "user") {
        router.push(`/${currentLocale}`);
      } else {
        router.push(`/${currentLocale}/dashboard`);
      }
    }
  }, [user, authLoading, allowedRoles, requireAuth, redirectOnUnauthorized, pathname, router]);

  return {
    isAuthorized,
    isLoading: authLoading || isAuthorized === null,
    user,
  };
}