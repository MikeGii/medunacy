// src/components/common/OptimizedPagination.tsx
"use client";

import { memo, useMemo } from "react";
import { useTranslations } from "next-intl";

interface OptimizedPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  showFirstLast?: boolean;
  maxVisible?: number;
  className?: string;
}

const OptimizedPagination = memo(function OptimizedPagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  showFirstLast = true,
  maxVisible = 5,
  className = "",
}: OptimizedPaginationProps) {
  const t = useTranslations("pagination");

  // Memoize page numbers calculation
  const pageNumbers = useMemo(() => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisible / 2);
    const pages: (number | string)[] = [];

    // Always show first page
    if (showFirstLast) {
      pages.push(1);
      if (currentPage > halfVisible + 2) {
        pages.push("...");
      }
    }

    // Calculate start and end of visible pages
    let start = Math.max(showFirstLast ? 2 : 1, currentPage - halfVisible);
    let end = Math.min(
      showFirstLast ? totalPages - 1 : totalPages,
      currentPage + halfVisible
    );

    // Adjust if at the beginning or end
    if (currentPage <= halfVisible + 1) {
      end = Math.min(maxVisible, totalPages);
      if (!showFirstLast) start = 1;
    } else if (currentPage >= totalPages - halfVisible) {
      start = Math.max(1, totalPages - maxVisible + 1);
      if (showFirstLast) start = Math.max(2, start);
    }

    // Add visible page numbers
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Always show last page
    if (showFirstLast && currentPage < totalPages - halfVisible - 1) {
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, maxVisible, showFirstLast]);

  if (totalPages <= 1) return null;

  return (
    <nav
      className={`flex items-center justify-center space-x-1 ${className}`}
      aria-label={t("pagination_nav")}
    >
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className={`px-3 py-2 rounded-lg transition-all flex items-center ${
          currentPage === 1 || isLoading
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300"
        }`}
        aria-label={t("previous_page")}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="ml-1 hidden sm:inline">{t("previous")}</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => {
          if (typeof page === "string") {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                {page}
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className={`min-w-[40px] px-3 py-2 rounded-lg transition-all ${
                page === currentPage
                  ? "bg-red-500 text-white font-medium"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300"
              } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
              aria-label={t("page_number", { page })}
              aria-current={page === currentPage ? "page" : undefined}
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
        className={`px-3 py-2 rounded-lg transition-all flex items-center ${
          currentPage === totalPages || isLoading
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300"
        }`}
        aria-label={t("next_page")}
      >
        <span className="mr-1 hidden sm:inline">{t("next")}</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
});

export default OptimizedPagination;