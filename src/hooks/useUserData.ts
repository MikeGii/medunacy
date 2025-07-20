// src/hooks/useUserData.ts
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData, updateUserData, upsertUserData } from '@/lib/userdata';
import type { UserData, UserDataUpdate } from '@/types/userdata';

export function useUserData() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const data = await getUserData(user.id);
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  // Update user data
  const updateData = async (updates: UserDataUpdate): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      setLoading(true);
      const updatedData = await updateUserData(user.id, updates);
      setUserData(updatedData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user data');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create or update user data
  const saveData = async (data: Omit<UserData, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      setLoading(true);
      const savedData = await upsertUserData({ ...data, user_id: user.id });
      setUserData(savedData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user data');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    userData,
    loading,
    error,
    updateData,
    saveData,
    refetch: () => {
      if (user?.id) {
        setLoading(true);
        getUserData(user.id)
          .then(setUserData)
          .catch(err => setError(err.message))
          .finally(() => setLoading(false));
      }
    }
  };
}