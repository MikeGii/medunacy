// src/components/exam-tests/ExamTimer.tsx

"use client";

import { memo, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface ExamTimerProps {
  timeElapsed: number; // in seconds
  timeLimit: number; // in seconds
  onTimeUp: () => void;
}

const ExamTimer = memo(
  ({ timeElapsed, timeLimit, onTimeUp }: ExamTimerProps) => {
    const t = useTranslations("exam_tests");
    const [isWarning, setIsWarning] = useState(false);
    const [isCritical, setIsCritical] = useState(false);

    const timeRemaining = Math.max(0, timeLimit - timeElapsed);
    const percentageRemaining = (timeRemaining / timeLimit) * 100;

    useEffect(() => {
      // Warning at 10 minutes remaining
      if (timeRemaining <= 600 && timeRemaining > 300) {
        setIsWarning(true);
        setIsCritical(false);
      }
      // Critical at 5 minutes remaining
      else if (timeRemaining <= 300 && timeRemaining > 0) {
        setIsWarning(false);
        setIsCritical(true);
      }
      // Time's up
      else if (timeRemaining === 0) {
        onTimeUp();
      }
    }, [timeRemaining, onTimeUp]);

    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`;
      }
      return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    return (
      <div
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
          isCritical
            ? "bg-red-100 text-red-800"
            : isWarning
            ? "bg-yellow-100 text-yellow-800"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        <svg
          className={`w-5 h-5 ${isCritical ? "animate-pulse" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <div className="text-xs opacity-75">{t("time_remaining")}</div>
          <div className="font-mono font-semibold">
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="w-16 h-1 bg-gray-300 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isCritical
                ? "bg-red-500"
                : isWarning
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${percentageRemaining}%` }}
          />
        </div>
      </div>
    );
  }
);

ExamTimer.displayName = "ExamTimer";

export default ExamTimer;
