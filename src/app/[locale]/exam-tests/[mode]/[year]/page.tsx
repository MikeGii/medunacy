// src/app/[locale]/exam-tests/[mode]/[year]/page.tsx

import ExamTestPage from "@/components/exam-tests/ExamTestPage";

interface PageProps {
  params: Promise<{
    locale: string;
    mode: "training" | "exam";
    year: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  // Await the params as required by Next.js 15
  const { mode, year } = await params;

  return <ExamTestPage mode={mode} year={parseInt(year)} />;
}
