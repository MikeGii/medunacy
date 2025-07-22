// src/app/[locale]/exam-tests/results/[sessionId]/page.tsx

import ExamResultsPage from "@/components/exam-tests/ExamResultsPage";

interface PageProps {
  params: Promise<{
    locale: string;
    sessionId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  // Await the params as required by Next.js 15
  const { sessionId } = await params;

  return <ExamResultsPage sessionId={sessionId} />;
}
