// src/app/[locale]/exam-tests/[mode]/[year]/page.tsx

import ExamTestPage from '@/components/exam-tests/ExamTestPage';

interface PageProps {
  params: {
    locale: string;
    mode: 'training' | 'exam';
    year: string;
  };
}

export default function Page({ params }: PageProps) {
  return (
    <ExamTestPage 
      mode={params.mode} 
      year={parseInt(params.year)} 
    />
  );
}