// src/types/auth.types.ts
export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'user' | 'doctor' | 'admin';
  is_verified: boolean;
  account_created: string;
  preferred_language: 'et' | 'ukr';
  last_login?: string;
  subscription_status: 'free' | 'premium' | 'trial';
}