// src/hooks/useUserManagement.ts
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/auth.types";
import { useCleanup } from "@/hooks/useCleanup";

interface UseUserManagementReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filteredUsers: User[];
  
  // Actions
  fetchUsers: () => Promise<void>;
  updateUserRole: (userId: string, newRole: string) => Promise<boolean>;
  updateUserSubscription: (userId: string, status: 'free' | 'premium') => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  
  // State tracking
  updatingUserId: string | null;
  isMounted: () => boolean;
}

export function useUserManagement(): UseUserManagementReturn {
  const { user: currentUser } = useAuth();
  const { addCleanup, isMounted } = useCleanup();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  
  // Cache and request management
  const usersCache = useRef<Map<string, User>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Setup real-time subscriptions
  useEffect(() => {
    if (!isMounted()) return;
    
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          if (!isMounted()) return;
          
          if (payload.eventType === 'UPDATE') {
            const updatedUser = payload.new as User;
            setUsers(prev => prev.map(user => 
              user.user_id === updatedUser.user_id ? updatedUser : user
            ));
            usersCache.current.set(updatedUser.user_id, updatedUser);
          }
        }
      )
      .subscribe();
    
    addCleanup(() => {
      channel.unsubscribe();
    });
    
    return () => {
      channel.unsubscribe();
    };
  }, [addCleanup, isMounted]);
  
  // Fetch users with caching
  const fetchUsers = useCallback(async () => {
    if (!isMounted()) return;
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('role', { ascending: true })
        .order('first_name', { ascending: true });
      
      if (!isMounted()) return;
      
      if (fetchError) throw fetchError;
      
      const userData = (data || []) as User[];
      setUsers(userData);
      
      // Update cache
      usersCache.current.clear();
      userData.forEach(user => {
        usersCache.current.set(user.user_id, user);
      });
    } catch (err: any) {
      if (err.name !== 'AbortError' && isMounted()) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [isMounted]);
  
  // Search with debounce
  useEffect(() => {
    if (!isMounted()) return;
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (!isMounted()) return;
      
      if (searchQuery.trim() === '') {
        setFilteredUsers(users);
      } else {
        const query = searchQuery.toLowerCase();
        const filtered = users.filter(user => {
          const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
          const email = user.email.toLowerCase();
          return fullName.includes(query) || email.includes(query);
        });
        setFilteredUsers(filtered);
      }
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, users, isMounted]);
  
  // Update user role
  const updateUserRole = useCallback(async (
    userId: string,
    newRole: string
  ): Promise<boolean> => {
    if (!isMounted()) return false;
    
    if (userId === currentUser?.id) {
      setError('You cannot change your own role');
      return false;
    }
    
    setUpdatingUserId(userId);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('user_id', userId);
      
      if (!isMounted()) return false;
      
      if (updateError) throw updateError;
      
      // Optimistic update
      setUsers(prev => prev.map(user =>
        user.user_id === userId ? { ...user, role: newRole as any } : user
      ));
      
      return true;
    } catch (err) {
      if (isMounted()) {
        setError(err instanceof Error ? err.message : 'Failed to update role');
      }
      return false;
    } finally {
      if (isMounted()) {
        setUpdatingUserId(null);
      }
    }
  }, [currentUser?.id, isMounted]);
  
  // Update user subscription status
  const updateUserSubscription = useCallback(async (
    userId: string,
    status: 'free' | 'premium'
  ): Promise<boolean> => {
    if (!isMounted()) return false;
    
    setUpdatingUserId(userId);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ subscription_status: status })
        .eq('user_id', userId);
      
      if (!isMounted()) return false;
      
      if (updateError) throw updateError;
      
      // Optimistic update
      setUsers(prev => prev.map(user =>
        user.user_id === userId ? { ...user, subscription_status: status } : user
      ));
      
      return true;
    } catch (err) {
      if (isMounted()) {
        setError(err instanceof Error ? err.message : 'Failed to update subscription');
      }
      return false;
    } finally {
      if (isMounted()) {
        setUpdatingUserId(null);
      }
    }
  }, [isMounted]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    users,
    loading,
    error,
    searchQuery,
    filteredUsers: searchQuery ? filteredUsers : users,
    fetchUsers,
    updateUserRole,
    updateUserSubscription,
    setSearchQuery,
    clearError,
    updatingUserId,
    isMounted,
  };
}