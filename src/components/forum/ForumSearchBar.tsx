"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface ForumSearchBarProps {
  onSearch: (query: string) => void;
}

export default function ForumSearchBar({ onSearch }: ForumSearchBarProps) {
  const t = useTranslations("forum.search");
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full px-4 py-3 pl-12 pr-24 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl
                     focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all"
        />
        <svg 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 
                     bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white text-sm font-medium 
                     rounded-lg hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300"
        >
          {t("button")}
        </button>
      </div>
    </form>
  );
}