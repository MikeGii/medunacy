import { useCallback } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Course } from "@/types/course.types";

interface UseCourseAccessReturn {
  canAccessCourse: (course: Course) => boolean;
  checkCourseAccess: (course: Course) => { 
    canAccess: boolean; 
    needsPremium: boolean;
  };
}

export function useCourseAccess(): UseCourseAccessReturn {
  const { isPremium } = useSubscription();

  const canAccessCourse = useCallback(
    (course: Course): boolean => {
      // If course is not premium, everyone can access
      if (!course.is_premium) return true;

      // If course is premium, check user subscription
      return isPremium;
    },
    [isPremium]
  );

  const checkCourseAccess = useCallback(
    (course: Course) => {
      const canAccess = canAccessCourse(course);
      const needsPremium = course.is_premium && !isPremium;

      return {
        canAccess,
        needsPremium,
      };
    },
    [canAccessCourse, isPremium]
  );

  return {
    canAccessCourse,
    checkCourseAccess,
  };
}