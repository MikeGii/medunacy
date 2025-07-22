// src/app/[locale]/exam-tests/[mode]/[testId]/page.tsx - FIXED

import ExamTestPage from "@/components/exam-tests/ExamTestPage";

interface PageProps {
  params: Promise<{
    locale: string;
    mode: "training" | "exam";
    testId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { mode, testId } = await params;

  return (
    <ExamTestPage
      mode={mode}
      testId={testId}
      // Remove any third parameter if you have one
    />
  );
}
