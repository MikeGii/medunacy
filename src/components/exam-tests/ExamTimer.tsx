// src/components/exam-tests/ExamTimer.tsx

'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface ExamTimerProps {
  timeElapsed: number;
  onTimeUp: () => void;
}

export default function ExamTimer({ timeElapsed, onTimeUp }: ExamTimerProps) {
  const t = useTranslations('exam_tests');
  const [isWarning, setIsWarning] = useState(false);
  
  const TIME_LIMIT = 5400; // 90 minutes in seconds
  const timeRemaining = TIME_LIMIT - timeElapsed;
  
  useEffect(() => {
    if (timeRemaining <= 300 && timeRemaining > 0) { // Last 5 minutes
      setIsWarning(true);
    }
    
    if (timeRemaining <= 0) {
      onTimeUp();
    }
  }, [timeRemaining, onTimeUp]);
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={`font-mono text-lg ${
      isWarning ? 'text-red-600 animate-pulse' : 'text-gray-700'
    }`}>
      {t('time_remaining')}: {formatTime(Math.max(0, timeRemaining))}
    </div>
  );
}