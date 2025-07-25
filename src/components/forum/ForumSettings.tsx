// src/components/forum/ForumSettings.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface ForumSettingsProps {
  onSettingsChange: (settings: { useInfiniteScroll: boolean }) => void;
}

export default function ForumSettings({ onSettingsChange }: ForumSettingsProps) {
  const t = useTranslations("forum.settings");
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false);

  // Load preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("forumInfiniteScroll");
    if (saved === "true") {
      setUseInfiniteScroll(true);
      onSettingsChange({ useInfiniteScroll: true });
    }
  }, [onSettingsChange]);

  const handleToggle = (checked: boolean) => {
    setUseInfiniteScroll(checked);
    localStorage.setItem("forumInfiniteScroll", String(checked));
    onSettingsChange({ useInfiniteScroll: checked });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between">
        <label htmlFor="infinite-scroll" className="text-sm font-medium text-gray-700">
          {t("use_infinite_scroll")}
        </label>
        <button
          id="infinite-scroll"
          role="switch"
          aria-checked={useInfiniteScroll}
          onClick={() => handleToggle(!useInfiniteScroll)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            useInfiniteScroll ? "bg-red-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              useInfiniteScroll ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}