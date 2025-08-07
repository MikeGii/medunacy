// src/components/analytics/ProgressChart.tsx
"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

interface ProgressChartProps {
  data: WeeklyStats[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
  const chartData = useMemo(
    () => ({
      labels: data.map((d) => format(new Date(d.week_start), "MMM d")),
      datasets: [
        {
          label: "Overall Score",
          data: data.map((d) => d.overall_avg_score),
          borderColor: "#118B50",
          backgroundColor: "rgba(17, 139, 80, 0.1)",
          tension: 0.3,
        },
        {
          label: "Training Score",
          data: data.map((d) => d.training_avg_score),
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.3,
        },
        {
          label: "Exam Score",
          data: data.map((d) => d.exam_avg_score),
          borderColor: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.3,
        },
      ],
    }),
    [data]
  );

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          // Fix the type error by properly typing the callback
          callback: function (tickValue: string | number) {
            return tickValue + "%";
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <div className="h-[300px] md:h-[400px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
