// src/components/layout/LanguageTransitionOverlay.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function LanguageTransitionOverlay() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkTransition = () => {
      const transitionData = sessionStorage.getItem("medunacy_lang_transition");
      if (transitionData) {
        try {
          const data = JSON.parse(transitionData);
          // Only show overlay for very recent transitions (300ms)
          if (Date.now() - data.timestamp < 300) {
            setIsTransitioning(true);
          } else {
            setIsTransitioning(false);
            sessionStorage.removeItem("medunacy_lang_transition");
          }
        } catch {
          setIsTransitioning(false);
        }
      } else {
        setIsTransitioning(false);
      }
    };

    // Check immediately
    checkTransition();

    // Only check once after a short delay
    const timeout = setTimeout(() => {
      setIsTransitioning(false);
      sessionStorage.removeItem("medunacy_lang_transition");
    }, 300); // Reduced from checking every 100ms to just 300ms total

    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Much more subtle overlay - barely visible */}
      <div className="absolute inset-0 bg-white/10" />
    </div>
  );
}
