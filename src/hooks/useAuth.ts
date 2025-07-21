// src/hooks/useAuth.ts - Optimized version with multilingual support
"use client";

import { useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  language: string;
}

interface AuthResult {
  success: boolean;
  message: string;
  userId?: string;
  errorCode?: string; // Add error code for translation
}

// Cache for ongoing requests to prevent duplicate calls
const authRequestCache = new Map<string, Promise<AuthResult>>();

export function useAuthActions() {
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const t = useTranslations("auth.common");

  // Cleanup function for component unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<AuthResult> => {
    // Create cache key from email
    const cacheKey = `register:${data.email.toLowerCase()}`;
    
    // Check if there's already an ongoing request for this email
    const cachedRequest = authRequestCache.get(cacheKey);
    if (cachedRequest) {
      return cachedRequest;
    }

    // Create new request
    const request = (async (): Promise<AuthResult> => {
      setLoading(true);
      
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();
      
      try {
        // Validate email format one more time
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          return { 
            success: false, 
            message: t("invalid_email_format"),
            errorCode: "invalid_email_format"
          };
        }

        // Check if email already exists (prevents Supabase error)
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("email")
          .eq("email", data.email.toLowerCase())
          .maybeSingle();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking existing user:", checkError);
        }

        if (existingUser) {
          return { 
            success: false, 
            message: t("email_already_registered"),
            errorCode: "email_already_registered"
          };
        }

        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email.toLowerCase(),
          password: data.password,
          options: {
            data: {
              first_name: data.firstName.trim(),
              last_name: data.lastName.trim(),
              phone: data.phone.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (authError) {
          console.error("Auth error:", authError);
          
          // Handle specific Supabase errors
          if (authError.message.includes("Password should be")) {
            return { 
              success: false, 
              message: t("password_too_short"),
              errorCode: "password_too_short"
            };
          }
          if (authError.message.includes("Invalid email")) {
            return { 
              success: false, 
              message: t("invalid_email_format"),
              errorCode: "invalid_email_format"
            };
          }
          
          throw authError;
        }

        if (!authData.user) {
          return { 
            success: false, 
            message: t("registration_failed"),
            errorCode: "registration_failed"
          };
        }

        // Insert into custom users table with retry logic
        let retries = 3;
        let dbError = null;
        
        while (retries > 0) {
          const { error } = await supabase.from("users").insert({
            user_id: authData.user.id,
            first_name: data.firstName.trim(),
            last_name: data.lastName.trim(),
            email: data.email.toLowerCase(),
            phone: data.phone.trim(),
            preferred_language: data.language,
            is_verified: false,
            role: 'user', // Default role
            account_created: new Date().toISOString(),
          });

          if (!error) {
            dbError = null;
            break;
          }
          
          dbError = error;
          retries--;
          
          // Wait a bit before retry
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (dbError) {
          console.error("Database error after retries:", dbError);
          // Don't fail the registration, user is created in Auth
          // They can still verify email and the users table can be updated later
        }

        return {
          success: true,
          message: "Registration successful! Please check your email to verify your account.",
          userId: authData.user.id,
        };
      } catch (error: unknown) {
        console.error("Registration error:", error);
        
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        
        // Clean up the user if database insert failed
        if (error instanceof Error && error.message.includes("users_email_key")) {
          // Email already exists in database
          return { 
            success: false, 
            message: t("email_already_registered"),
            errorCode: "email_already_registered"
          };
        }
        
        return { 
          success: false, 
          message: errorMessage,
          errorCode: "unexpected_error"
        };
      } finally {
        setLoading(false);
        // Remove from cache after completion
        authRequestCache.delete(cacheKey);
        abortControllerRef.current = null;
      }
    })();

    // Store in cache
    authRequestCache.set(cacheKey, request);
    
    return request;
  }, [t]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    // Create cache key
    const cacheKey = `signin:${email.toLowerCase()}`;
    
    // Check if there's already an ongoing request
    const cachedRequest = authRequestCache.get(cacheKey);
    if (cachedRequest) {
      return cachedRequest;
    }

    // Create new request
    const request = (async (): Promise<AuthResult> => {
      setLoading(true);
      
      // Create abort controller
      abortControllerRef.current = new AbortController();
      
      try {
        // Basic validation
        if (!email || !password) {
          return { 
            success: false, 
            message: t("email_password_required"),
            errorCode: "email_password_required"
          };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password: password,
        });

        if (error) {
          console.error("Sign in error:", error);
          
          // Handle specific error cases
          if (error.message.includes("Invalid login credentials")) {
            return { 
              success: false, 
              message: "Invalid email or password", // This will be handled by the modal
              errorCode: "invalid_credentials"
            };
          }
          if (error.message.includes("Email not confirmed")) {
            return { 
              success: false, 
              message: "Please verify your email before signing in", // This will be handled by the modal
              errorCode: "email_not_confirmed"
            };
          }
          if (error.message.includes("Too many requests")) {
            return { 
              success: false, 
              message: t("too_many_requests"),
              errorCode: "too_many_requests"
            };
          }
          
          throw error;
        }

        if (!data.user) {
          return { 
            success: false, 
            message: "Sign in failed", // This will be handled by the modal
            errorCode: "sign_in_failed"
          };
        }

        // Update last login time (non-blocking)
        supabase
          .from("users")
          .update({ last_login: new Date().toISOString() })
          .eq("user_id", data.user.id)
          .then(({ error: updateError }) => {
            if (updateError) {
              console.error("Error updating last login:", updateError);
            }
          });

        return { 
          success: true, 
          message: "Signed in successfully!",
          userId: data.user.id,
        };
      } catch (error: unknown) {
        console.error("Sign in error:", error);
        
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        return { 
          success: false, 
          message: errorMessage,
          errorCode: "unexpected_error"
        };
      } finally {
        setLoading(false);
        // Remove from cache
        authRequestCache.delete(cacheKey);
        abortControllerRef.current = null;
      }
    })();

    // Store in cache
    authRequestCache.set(cacheKey, request);
    
    return request;
  }, [t]);

  // Forgot password function (bonus optimization)
  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    setLoading(true);
    
    try {
      // Basic validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { 
          success: false, 
          message: t("invalid_email_format"),
          errorCode: "invalid_email_format"
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) {
        console.error("Reset password error:", error);
        
        if (error.message.includes("User not found")) {
          return { 
            success: false, 
            message: t("no_account_found"),
            errorCode: "no_account_found"
          };
        }
        
        throw error;
      }

      return {
        success: true,
        message: "Password reset link sent! Please check your email.",
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      return { 
        success: false, 
        message: errorMessage,
        errorCode: "unexpected_error"
      };
    } finally {
      setLoading(false);
    }
  }, [t]);

  return {
    register,
    signIn,
    resetPassword,
    loading,
    cleanup,
  };
}