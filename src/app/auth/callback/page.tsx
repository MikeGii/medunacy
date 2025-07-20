'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the hash parameters from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        if (access_token && refresh_token) {
          // Set the session with the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });

          if (error) {
            console.error('Session error:', error);
            setStatus('error');
            return;
          }

          if (data.user) {
            // Update user verification status in our custom table
            const { error: dbError } = await supabase
              .from('users')
              .update({ is_verified: true })
              .eq('user_id', data.user.id);

            if (dbError) {
              console.error('Database update error:', dbError);
            }

            setStatus('success');
            
            // Redirect to home page after 2 seconds
            setTimeout(() => {
              router.push('/et'); // Default to Estonian
            }, 2000);
          }
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-12 text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin w-16 h-16 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-6"></div>
            <div className="text-2xl">⚕️</div>
            <h2 className="text-lg font-semibold text-[#118B50] mt-2">Medunacy</h2>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-3xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-600">Verified!</h2>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-3xl mb-4">❌</div>
            <button
              onClick={() => router.push('/et')}
              className="px-6 py-2 bg-[#118B50] text-white rounded-lg hover:bg-[#0F7A43] transition-colors"
            >
              ← Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}