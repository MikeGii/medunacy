// src/app/[locale]/exam-tests/results/[sessionId]/page.tsx

import ExamResultsPage from '@/components/exam-tests/ExamResultsPage';

interface PageProps {
  params: {
    locale: string;
    sessionId: string;
  };
}

export default function Page({ params }: PageProps) {
  return <ExamResultsPage sessionId={params.sessionId} />;
}