// src/app/[locale]/exam-tests/create/[testId]/questions/page.tsx

import QuestionManagementPage from '@/components/exam-tests/creation/QuestionManagementPage';

interface PageProps {
  params: Promise<{
    locale: string;
    testId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { testId } = await params;
  
  return <QuestionManagementPage testId={testId} />;
}