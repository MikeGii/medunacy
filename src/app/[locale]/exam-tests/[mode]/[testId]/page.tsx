// src/app/[locale]/exam-tests/[mode]/[testId]/page.tsx

import ExamTestPage from '@/components/exam-tests/ExamTestPage';

interface PageProps {
  params: Promise<{
    locale: string;
    mode: 'training' | 'exam';
    testId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  // Await the params as required by Next.js 15
  const { mode, testId } = await params;
  
  return (
    <ExamTestPage 
      mode={mode} 
      testId={testId}
    />
  );
}