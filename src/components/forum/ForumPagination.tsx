// src/components/forum/ForumPagination.tsx
"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";

interface ForumPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const ForumPagination = memo(function ForumPagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: ForumPaginationProps) {
  const t = useTranslations("forum.pagination");

  // Don't show pagination if only 1 page
  if (totalPages <= 1) return null;

  // Calculate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, current and surrounding pages
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="mt-8 flex items-center justify-center space-x-2">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-all
          ${
            currentPage === 1 || isLoading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-50 text-gray-700 hover:text-[#118B50] shadow-sm border border-gray-200"
          }`}
        aria-label={t("previous")}
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="hidden sm:inline">{t("previous")}</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center space-x-1">
        {pages.map((page, index) => {
          if (page === -1) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-400"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className={`min-w-[40px] px-3 py-2 rounded-lg transition-all
                ${
                  page === currentPage
                    ? "bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white shadow-lg"
                    : "bg-white hover:bg-gray-50 text-gray-700 hover:text-[#118B50] shadow-sm border border-gray-200"
                }
                ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-all
          ${
            currentPage === totalPages || isLoading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-50 text-gray-700 hover:text-[#118B50] shadow-sm border border-gray-200"
          }`}
        aria-label={t("next")}
      >
        <span className="hidden sm:inline">{t("next")}</span>
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
});

export default ForumPagination;
