// src/components/analytics/WeeklyStatsCard.tsx
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface WeeklyStats {
  week_start: string;
  week_end: string;
  training_sessions_count: number;
  training_avg_score: number;
  training_total_questions: number;
  training_correct_answers: number;
  exam_sessions_count: number;
  exam_avg_score: number;
  exam_total_questions: number;
  exam_correct_answers: number;
  overall_avg_score: number;
  improvement_percentage: number;
}

interface WeeklyStatsCardProps {
  title: string;
  stats: WeeklyStats | null;
  showImprovement: boolean;
  improvementPercentage?: number;
  isImproving?: boolean;
}

export default function WeeklyStatsCard({
  title,
  stats,
  showImprovement,
  improvementPercentage = 0,
  isImproving = false,
}: WeeklyStatsCardProps) {
  const t = useTranslations("analytics.progress");

  if (!stats) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 md:p-6">
        <h4 className="font-medium text-gray-700 mb-2">{title}</h4>
        <p className="text-sm text-gray-500">{t("no_data")}</p>
      </div>
    );
  }

  // Calculate accuracy rates
  const trainingAccuracy =
    stats.training_total_questions > 0
      ? Math.round(
          (stats.training_correct_answers / stats.training_total_questions) *
            100
        )
      : 0;

  const examAccuracy =
    stats.exam_total_questions > 0
      ? Math.round(
          (stats.exam_correct_answers / stats.exam_total_questions) * 100
        )
      : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-gray-800 text-sm md:text-base">
              {title}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5 md:mt-1">
              {format(new Date(stats.week_start), "MMM d")} -{" "}
              {format(new Date(stats.week_end), "MMM d")}
            </p>
          </div>
          {showImprovement && improvementPercentage !== 0 && (
            <div
              className={`flex items-center space-x-1 ${
                isImproving ? "text-green-600" : "text-red-600"
              }`}
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isImproving
                      ? "M5 10l7-7m0 0l7 7m-7-7v18"
                      : "M19 14l-7 7m0 0l-7-7m7 7V3"
                  }
                />
              </svg>
              <span className="font-medium text-sm md:text-base">
                {Math.abs(improvementPercentage)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content - Mobile */}
      <div className="md:hidden p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Training Column */}
          <div>
            <h5 className="text-sm font-medium text-blue-600 mb-3 flex items-center">
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              {t("training")}
            </h5>
            <div className="space-y-2">
              <div className="text-xs">
                <span className="text-gray-600 block">{t("sessions")}</span>
                <span className="font-semibold text-blue-700">
                  {stats.training_sessions_count}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-gray-600 block">{t("score")}</span>
                <span className="font-semibold text-blue-700">
                  {stats.training_avg_score}%
                </span>
              </div>
              <div className="text-xs">
                <span className="text-gray-600 block">{t("accuracy")}</span>
                <span className="font-semibold text-blue-700">
                  {trainingAccuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* Exam Column */}
          <div>
            <h5 className="text-sm font-medium text-purple-600 mb-3 flex items-center">
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              {t("exam")}
            </h5>
            <div className="space-y-2">
              <div className="text-xs">
                <span className="text-gray-600 block">{t("sessions")}</span>
                <span className="font-semibold text-purple-700">
                  {stats.exam_sessions_count}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-gray-600 block">{t("score")}</span>
                <span className="font-semibold text-purple-700">
                  {stats.exam_avg_score}%
                </span>
              </div>
              <div className="text-xs">
                <span className="text-gray-600 block">{t("accuracy")}</span>
                <span className="font-semibold text-purple-700">
                  {examAccuracy}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary for mobile */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-2xs text-gray-500">{t("total_sessions")}</p>
            <p className="text-sm font-bold text-gray-800">
              {stats.training_sessions_count + stats.exam_sessions_count}
            </p>
          </div>
          <div>
            <p className="text-2xs text-gray-500">{t("questions")}</p>
            <p className="text-sm font-bold text-gray-800">
              {stats.training_total_questions + stats.exam_total_questions}
            </p>
          </div>
          <div>
            <p className="text-2xs text-gray-500">{t("correct")}</p>
            <p className="text-sm font-bold text-gray-800">
              {stats.training_correct_answers + stats.exam_correct_answers}
            </p>
          </div>
        </div>
      </div>

      {/* Content - Desktop */}
      <div className="hidden md:block p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Training Stats */}
          <div className="space-y-4">
            <h5 className="font-medium text-blue-600 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              {t("training_mode")}
            </h5>

            {/* Training metrics */}
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {t("sessions_completed")}
                  </span>
                  <span className="font-semibold text-blue-700">
                    {stats.training_sessions_count}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {t("average_score")}
                  </span>
                  <span className="font-semibold text-blue-700">
                    {stats.training_avg_score}%
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {t("accuracy_rate")}
                  </span>
                  <span className="font-semibold text-blue-700">
                    {trainingAccuracy}%
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {t("questions_answered")}
                  </span>
                  <span className="font-semibold text-blue-700">
                    {stats.training_total_questions}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Stats */}
          <div className="space-y-4">
            <h5 className="font-medium text-purple-600 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              {t("exam_mode")}
            </h5>

            {/* Exam metrics */}
            <div className="space-y-3">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {t("exams_taken")}
                  </span>
                  <span className="font-semibold text-purple-700">
                    {stats.exam_sessions_count}
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {t("average_score")}
                  </span>
                  <span className="font-semibold text-purple-700">
                    {stats.exam_avg_score}%
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {t("accuracy_rate")}
                  </span>
                  <span className="font-semibold text-purple-700">
                    {examAccuracy}%
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {t("questions_answered")}
                  </span>
                  <span className="font-semibold text-purple-700">
                    {stats.exam_total_questions}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary section - Desktop */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">{t("total_sessions")}</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.training_sessions_count + stats.exam_sessions_count}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("total_questions")}</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.training_total_questions + stats.exam_total_questions}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("total_correct")}</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.training_correct_answers + stats.exam_correct_answers}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
