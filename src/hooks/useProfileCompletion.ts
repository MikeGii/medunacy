// src/hooks/useProfileCompletion.ts
'use client';

import { useMemo } from 'react';
import { useUserData } from './useUserData';

export function useProfileCompletion() {
  const { userData, loading } = useUserData();

  const profileCompletion = useMemo(() => {
    if (loading || !userData) {
      return {
        isComplete: false,
        isLoading: loading,
        completedFields: 0,
        totalFields: 6,
        percentage: 0
      };
    }

    let completedFields = 0;
    const totalFields = 6;

    // Check each required field
    if (userData.university && userData.university.trim()) completedFields++;
    if (userData.specialization && userData.specialization.trim()) completedFields++;
    if (userData.workplace && userData.workplace.trim()) completedFields++;
    if (userData.languages && userData.languages.length > 0) completedFields++;
    if (userData.personal_description && userData.personal_description.trim()) completedFields++;
    if (userData.university_finished !== undefined) completedFields++; // This is always set, but we count it

    const percentage = Math.round((completedFields / totalFields) * 100);
    const isComplete = completedFields >= 4; // Consider complete if at least 4/6 fields are filled

    return {
      isComplete,
      isLoading: false,
      completedFields,
      totalFields,
      percentage
    };
  }, [userData, loading]);

  return profileCompletion;
}