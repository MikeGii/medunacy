// src/components/exam-tests/ExamTimer.tsx - FIXED

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface ExamTimerProps {
  timeElapsed: number;
  timeLimit?: number; // in seconds, optional
  onTimeUp: () => void;
}

export default function ExamTimer({
  timeElapsed,
  timeLimit,
  onTimeUp,
}: ExamTimerProps) {
  const t = useTranslations("exam_tests");
  const [isWarning, setIsWarning] = useState(false);

  // ALWAYS call useEffect - never conditionally
  useEffect(() => {
    if (!timeLimit) return; // Early return inside useEffect is fine

    const timeRemaining = Math.max(0, timeLimit - timeElapsed);

    if (timeRemaining <= 300 && timeRemaining > 0) {
      // Last 5 minutes
      setIsWarning(true);
    }

    if (timeRemaining <= 0) {
      onTimeUp();
    }
  }, [timeLimit, timeElapsed, onTimeUp]);

  const formatTime = (seconds: number) => {
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

  if (!timeLimit) {
    // No time limit - show elapsed time
    return (
      <div className="font-mono text-lg text-gray-700">
        {t("time_elapsed")}: {formatTime(timeElapsed)}
      </div>
    );
  }

  // With time limit - show remaining time
  const timeRemaining = Math.max(0, timeLimit - timeElapsed);

  return (
    <div
      className={`font-mono text-lg ${
        isWarning ? "text-red-600 animate-pulse" : "text-gray-700"
      }`}
    >
      {t("time_remaining")}: {formatTime(timeRemaining)}
    </div>
  );
}
