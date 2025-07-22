// src/components/forum/ForumSearchBar.tsx
"use client";

import { useState, useCallback, useEffect, memo, useRef } from "react";
import { useTranslations } from "next-intl";
import { FORUM_CONSTANTS } from "@/utils/forum.constants";

interface ForumSearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

const ForumSearchBar = memo(function ForumSearchBar({
  onSearch,
  initialValue = "",
}: ForumSearchBarProps) {
  const t = useTranslations("forum.search");
  const [query, setQuery] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null); // Fixed: Added null as initial value
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect platform for keyboard shortcut display
  const isMac =
    typeof window !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced search handler
  const handleSearch = useCallback(
    (searchQuery: string) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Show searching indicator for better UX
      if (searchQuery.trim()) {
        setIsSearching(true);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        onSearch(searchQuery.trim());
        setIsSearching(false);
      }, FORUM_CONSTANTS.SEARCH_DEBOUNCE_MS);
    },
    [onSearch]
  );

  // Handle input change with debouncing
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);
      handleSearch(newQuery);
    },
    [handleSearch]
  );

  // Handle form submit for immediate search
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Clear any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Immediate search
      onSearch(query.trim());
      setIsSearching(false);
    },
    [query, onSearch]
  );

  // Clear search
  const handleClear = useCallback(() => {
    setQuery("");
    onSearch("");
    setIsSearching(false);
    inputRef.current?.focus();
  }, [onSearch]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Escape to clear search when focused
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClear]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={t("placeholder")}
          className="w-full px-4 py-3 pl-12 pr-32 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl
                     focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all
                     placeholder:text-gray-500"
          aria-label={t("placeholder")}
        />

        {/* Search Icon */}
        <svg
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
            isSearching ? "text-[#118B50] animate-pulse" : "text-gray-400"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Clear button - shows when there's text */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-20 top-1/2 transform -translate-y-1/2 p-1 
                       text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t("clear")}
          >
            <svg
              className="w-5 h-5"
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
        )}

        {/* Search button */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 
                     bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white text-sm font-medium 
                     rounded-lg hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300
                     focus:ring-2 focus:ring-offset-2 focus:ring-[#118B50]
                     disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSearching}
        >
          {isSearching ? (
            <span className="flex items-center space-x-1">
              <svg
                className="animate-spin h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{t("searching")}</span>
            </span>
          ) : (
            t("button")
          )}
        </button>

        {/* Keyboard shortcut hint */}
        <div className="absolute -bottom-6 left-0 text-xs text-gray-500 hidden md:block">
          <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded">
            {isMac ? "Cmd" : "Ctrl"}+K
          </kbd>
          <span className="ml-1">{t("shortcut_hint")}</span>
        </div>
      </div>
    </form>
  );
});

export default ForumSearchBar;
