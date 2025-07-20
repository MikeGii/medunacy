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

export function useAuthActions() {
  const [loading, setLoading] = useState(false);

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone
          }
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
    } catch (error: any) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, message: 'Signed in successfully!' };
    } catch (error: any) {
      return { success: false, message: error.message };
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