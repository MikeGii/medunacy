// src/components/ui/NotificationBell.tsx
"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell = React.memo(function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Memoize toggle handler
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Memoize close handler
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Memoize badge display logic
  const badgeDisplay = useMemo(() => {
    if (unreadCount === 0) return null;
    return unreadCount > 9 ? "9+" : unreadCount.toString();
  }, [unreadCount]);

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 md:p-2 text-[#118B50] hover:text-[#5DB996] transition-colors duration-200 
                   bg-white/50 md:bg-transparent rounded-full md:rounded-none hover:bg-white/70 md:hover:bg-transparent
                   border border-[#118B50]/20 md:border-none"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 01-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Count Badge */}
        {badgeDisplay && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse shadow-lg">
            {badgeDisplay}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && <NotificationDropdown onClose={handleClose} />}
    </div>
  );
});

export default NotificationBell;