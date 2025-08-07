// src/utils/analytics.ts
import { format } from "date-fns";

export function calculatePassRate(stats: any): string {
  if (!stats || stats.exam_sessions_count === 0) return "0%";
  
  // You'll need to track passed exams in your stats
  // For now, let's estimate based on average score
  const passThreshold = 70; // 70% to pass
  const estimatedPassRate = stats.exam_avg_score >= passThreshold ? 100 : 
    Math.round((stats.exam_avg_score / passThreshold) * 100);
  
  return `${estimatedPassRate}%`;
}

export function formatTimeSpent(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getWeekDateRange(weekStart: string, weekEnd: string): string {
  const start = format(new Date(weekStart), "MMM d");
  const end = format(new Date(weekEnd), "MMM d, yyyy");
  return `${start} - ${end}`;
}