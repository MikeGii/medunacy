// src/app/[locale]/error.tsx
'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.667-2.308-1.667-3.08 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('error_title')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('generic.something_went_wrong')}
          </p>
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] 
                     text-white rounded-xl font-semibold hover:from-[#0A6B3B] 
                     hover:to-[#4A9B7E] transition-all duration-300"
          >
            {t('generic.try_again')}
          </button>
        </div>
      </div>
    </div>
  );
}