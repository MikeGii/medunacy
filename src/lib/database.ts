import { supabase } from './supabase';

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateUserVerification(userId: string, isVerified: boolean) {
  const { error } = await supabase
    .from('users')
    .update({ is_verified: isVerified })
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateUserProfile(userId: string, updates: {
  first_name?: string;
  last_name?: string;
  phone?: string;
}) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}