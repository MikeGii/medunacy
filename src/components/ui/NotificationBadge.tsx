// src/components/ui/NotificationBadge.tsx
"use client";

interface NotificationBadgeProps {
  children: React.ReactNode;
  showBadge: boolean;
  badgeContent?: string | number;
  className?: string;
}

export default function NotificationBadge({ 
  children, 
  showBadge, 
  badgeContent = "!", 
  className = "" 
}: NotificationBadgeProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {showBadge && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
            {badgeContent}
          </div>
        </div>
      )}
    </div>
  );
}