"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface DebouncedSearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
  showSearchIcon?: boolean;
  showClearButton?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
}

export default function DebouncedSearchInput({
  value = "",
  onChange,
  placeholder,
  delay = 300,
  className = "",
  showSearchIcon = true,
  showClearButton = true,
  autoFocus = false,
  "aria-label": ariaLabel,
}: DebouncedSearchInputProps) {
  const t = useTranslations("common.search");
  const [localValue, setLocalValue] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Show searching indicator
      if (newValue.trim() !== value) {
        setIsSearching(true);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        onChange(newValue.trim());
        setIsSearching(false);
      }, delay);
    },
    [onChange, delay, value]
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
    setIsSearching(false);
    inputRef.current?.focus();
  }, [onChange]);

  // Handle immediate search on Enter
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        onChange(localValue.trim());
        setIsSearching(false);
      } else if (e.key === "Escape" && localValue) {
        handleClear();
      }
    },
    [onChange, localValue, handleClear]
  );

  return (
    <div className="relative">
      {showSearchIcon && (
        <svg
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${
            isSearching ? "text-red-500 animate-pulse" : "text-gray-400"
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
      )}

      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t("placeholder")}
        className={`w-full ${showSearchIcon ? "pl-10" : "pl-4"} ${
          showClearButton && localValue ? "pr-10" : "pr-4"
        } py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${className}`}
        aria-label={ariaLabel || placeholder || t("placeholder")}
        autoFocus={autoFocus}
      />

      {showClearButton && localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 
                     text-gray-400 hover:text-gray-600 transition-colors rounded-full
                     hover:bg-gray-100"
          aria-label={t("clear")}
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
      )}
    </div>
  );
}