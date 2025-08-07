// src/components/profile/ProgressDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import ProgressChart from "./ProgressChart";
import WeeklyStatsCard from "./WeeklyStatsCard";
import StatCard from "./StatCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { calculatePassRate } from "@/utils/analytics";

export default function ProgressDashboard() {
  const t = useTranslations("analytics.progress");
  const { user } = useAuth();
  const {
    currentWeekStats,
    lastWeekStats,
    progressHistory,
    loading,
    error,
    refreshProgress
  } = useProgressTracking();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const improvementPercentage = currentWeekStats?.improvement_percentage || 0;
  const isImproving = improvementPercentage > 0;

  return (
    <div className="space-y-6">
      {/* Header with Title and Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("title")}
        </h2>
        <button
          onClick={refreshProgress}
          className="text-sm text-[#118B50] hover:text-[#0F7A42] transition-colors"
        >
          {t("refresh")}
        </button>
      </div>

      {/* Weekly Performance Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t("weekly_performance")}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Week Stats */}
          <WeeklyStatsCard
            title={t("this_week")}
            stats={currentWeekStats}
            showImprovement={true}
            improvementPercentage={improvementPercentage}
            isImproving={isImproving}
          />
          
          {/* Last Week Stats */}
          <WeeklyStatsCard
            title={t("last_week")}
            stats={lastWeekStats}
            showImprovement={false}
          />
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t("progress_over_time")}
        </h3>
        <ProgressChart data={progressHistory} />
      </div>

      {/* Detailed Statistics */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Training Mode Stats */}
        <StatCard
          title={t("training_mode")}
          icon="📚"
          stats={[
            {
              label: t("sessions_completed"),
              value: currentWeekStats?.training_sessions_count || 0
            },
            {
              label: t("average_score"),
              value: `${currentWeekStats?.training_avg_score || 0}%`
            },
            {
              label: t("questions_answered"),
              value: currentWeekStats?.training_total_questions || 0
            }
          ]}
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
        />

        {/* Exam Mode Stats */}
        <StatCard
          title={t("exam_mode")}
          icon="📝"
          stats={[
            {
              label: t("exams_taken"),
              value: currentWeekStats?.exam_sessions_count || 0
            },
            {
              label: t("average_score"),
              value: `${currentWeekStats?.exam_avg_score || 0}%`
            },
            {
              label: t("pass_rate"),
              value: calculatePassRate(currentWeekStats)
            }
          ]}
          bgColor="bg-green-50"
          borderColor="border-green-200"
        />

        {/* Overall Performance */}
        <StatCard
          title={t("overall_performance")}
          icon="🎯"
          stats={[
            {
              label: t("total_sessions"),
              value: (currentWeekStats?.training_sessions_count || 0) + 
                     (currentWeekStats?.exam_sessions_count || 0)
            },
            {
              label: t("overall_average"),
              value: `${currentWeekStats?.overall_avg_score || 0}%`
            },
            {
              label: t("weekly_improvement"),
              value: (
                <span className={isImproving ? "text-green-600" : "text-red-600"}>
                  {isImproving ? "↑" : "↓"} {Math.abs(improvementPercentage)}%
                </span>
              )
            }
          ]}
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
        />
      </div>
    </div>
  );
}