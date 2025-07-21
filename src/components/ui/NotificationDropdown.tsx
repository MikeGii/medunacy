// src/components/ui/NotificationDropdown.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { et, uk } from "date-fns/locale";

// Define the notification interface locally to avoid conflicts with browser Notification API
interface AppNotification {
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

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({
  onClose,
}: NotificationDropdownProps) {
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";
  const dateLocale = currentLocale === "ukr" ? uk : et;

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Handle notification click
  const handleNotificationClick = async (notification: AppNotification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate to related post if available
    if (notification.related_post_id) {
      router.push(`/${currentLocale}/forum/${notification.related_post_id}`);
    }

    onClose();
  };

  const handleNotificationDelete = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation(); // Prevent notification click when deleting
    await deleteNotification(notificationId);
  };

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "post_comment":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        );
      case "post_like":
      case "comment_like":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 01-6 0v-1m6 0H9"
            />
          </svg>
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown */}
      <div
        className="absolute top-12 z-50 
                right-0 w-80 md:w-96
                max-[480px]:right-[-100px] max-[480px]:w-72
                max-[380px]:right-[-130px] max-[380px]:w-64"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-96">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#118B50] to-[#5DB996] px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">
                {currentLocale === "ukr" ? "Сповіщення" : "Teatised"}
              </h3>
              {notifications.some((n) => !n.is_read) && (
                <button
                  onClick={markAllAsRead}
                  className="text-white/80 hover:text-white text-sm underline"
                >
                  {currentLocale === "ukr"
                    ? "Позначити все як прочитане"
                    : "Märgi kõik loetuks"}
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-[#118B50] border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">
                  {currentLocale === "ukr" ? "Завантаження..." : "Laadin..."}
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 01-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-gray-500">
                  {currentLocale === "ukr" ? "Немає сповіщень" : "Teatisi pole"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification: AppNotification) => (
                  <div
                    key={notification.id}
                    className={`relative group transition-colors duration-200 hover:bg-gray-50 ${
                      !notification.is_read
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    {/* Main notification content - clickable */}
                    <div
                      onClick={() => handleNotificationClick(notification)}
                      className="p-4 cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            notification.type === "post_like" ||
                            notification.type === "comment_like"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-8">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(
                              new Date(notification.created_at),
                              {
                                addSuffix: true,
                                locale: dateLocale,
                              }
                            )}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.is_read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    {/* Delete button - appears on hover */}
                    <button
                      onClick={(e) =>
                        handleNotificationDelete(e, notification.id)
                      }
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                   w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 
                   text-gray-500 hover:text-red-600"
                      title={
                        currentLocale === "ukr"
                          ? "Видалити сповіщення"
                          : "Kustuta teade"
                      }
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
