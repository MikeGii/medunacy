// src/hooks/useNotifications.ts - Optimized version
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useCleanup } from "@/hooks/useCleanup";

interface Notification {
  id: string;
  type: "post_comment" | "post_like" | "comment_like" | "new_post";
  title: string;
  message: string;
  related_post_id: string | null;
  related_comment_id: string | null;
  triggered_by_user_id: string | null;
  is_read: boolean;
  created_at: string;
}

// Cache for notifications to prevent unnecessary fetches
const notificationsCache = new Map<
  string,
  { data: Notification[]; timestamp: number }
>();
const CACHE_DURATION = 30000; // 30 seconds

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { addCleanup, isMounted } = useCleanup();
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize unread count calculation
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  // Fetch notifications with caching
  const fetchNotifications = useCallback(
    async (forceRefresh = false) => {
      if (!user || !isMounted()) {
        setLoading(false);
        return;
      }

      const cacheKey = user.id;
      const cached = notificationsCache.get(cacheKey);

      if (
        !forceRefresh &&
        cached &&
        Date.now() - cached.timestamp < CACHE_DURATION
      ) {
        setNotifications(cached.data);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;

        if (isMounted()) {
          const notificationData = data || [];
          setNotifications(notificationData);

          notificationsCache.set(cacheKey, {
            data: notificationData,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        if (isMounted()) {
          setLoading(false);
        }
      }
    },
    [user, isMounted]
  );

  // Optimized mark as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user) return;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );

      try {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId)
          .eq("user_id", user.id);

        if (error) {
          // Revert on error
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, is_read: false } : n
            )
          );
          throw error;
        }

        // Invalidate cache
        notificationsCache.delete(user.id);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [user]
  );

  // Optimized delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!user) return;

      // Store notification for potential restore
      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );

      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      try {
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("id", notificationId)
          .eq("user_id", user.id);

        if (error) {
          // Restore on error
          if (deletedNotification) {
            setNotifications((prev) =>
              [...prev, deletedNotification].sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
            );
          }
          throw error;
        }

        // Invalidate cache
        notificationsCache.delete(user.id);
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    },
    [user, notifications]
  );

  // Optimized mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    const unreadNotifications = notifications.filter((n) => !n.is_read);
    if (unreadNotifications.length === 0) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) {
        // Revert on error
        setNotifications((prev) =>
          prev.map((n) => {
            const wasUnread = unreadNotifications.some((un) => un.id === n.id);
            return wasUnread ? { ...n, is_read: false } : n;
          })
        );
        throw error;
      }

      // Invalidate cache
      notificationsCache.delete(user.id);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [user, notifications]);

  // Set up real-time subscription with debouncing
  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    if (!user) return;

    // Subscribe to new notifications
    const subscription = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (isMounted()) {
            const newNotification = payload.new as Notification;
            setNotifications((prev) => [newNotification, ...prev]);

            // Invalidate cache on new notification
            notificationsCache.delete(user.id);
          }
        }
      )
      .subscribe();

    addCleanup(() => {
      subscription.unsubscribe();
    });
  }, [user, fetchNotifications, isMounted, addCleanup]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: useCallback(
      () => fetchNotifications(true),
      [fetchNotifications]
    ),
  };
}
