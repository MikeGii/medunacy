'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  message: string;
}

export function useAuthActions() {
  const [loading, setLoading] = useState(false);

  const register = async (data: RegisterData): Promise<AuthResult> => {
    setLoading(true);
    try {
      // Sign up with Supabase Auth with custom redirect
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Insert into custom users table
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            user_id: authData.user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone,
            is_verified: false
          });

        if (dbError) throw dbError;
      }

      return { success: true, message: 'Registration successful! Please check your email to verify your account.' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, message: 'Signed in successfully!' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    signIn,
    loading
  };
}