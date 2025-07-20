// src/lib/userdata.ts
import { supabase } from './supabase';
import type { UserData, UserDataUpdate } from '@/types/userdata';

export async function getUserData(userId: string): Promise<UserData | null> {
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No data found, return null
      return null;
    }
    throw new Error(error.message);
  }

  return data;
}

export async function createUserData(userData: Omit<UserData, 'id' | 'created_at' | 'updated_at'>): Promise<UserData> {
  const { data, error } = await supabase
    .from('user_data')
    .insert(userData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateUserData(userId: string, updates: UserDataUpdate): Promise<UserData> {
  const { data, error } = await supabase
    .from('user_data')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function upsertUserData(userData: Omit<UserData, 'id' | 'created_at' | 'updated_at'>): Promise<UserData> {
  const { data, error } = await supabase
    .from('user_data')
    .upsert(userData, { 
      onConflict: 'user_id',
      ignoreDuplicates: false 
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}