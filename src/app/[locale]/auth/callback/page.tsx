'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the token from URL parameters
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (token_hash && type === 'email') {
          // Verify the email with the token
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email'
          });

          if (error) {
            console.error('Verification error:', error);
            setStatus('error');
            setMessage(error.message);
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
            setMessage('Your email has been successfully verified!');
            
            // Redirect to home page after 3 seconds
            setTimeout(() => {
              router.push('/');
            }, 3000);
          }
        } else {
          // Fallback: try to get current session
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
          }

          if (sessionData.session) {
            // Update verification status
            await supabase
              .from('users')
              .update({ is_verified: true })
              .eq('user_id', sessionData.session.user.id);

            setStatus('success');
            setMessage('Email verified successfully!');
            
            setTimeout(() => {
              router.push('/');
            }, 3000);
          } else {
            setStatus('error');
            setMessage('No valid session found');
          }
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during verification');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin w-12 h-12 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-[#118B50] mb-2">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we confirm your account.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-600 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to home page in 3 seconds...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-[#118B50] text-white rounded-lg hover:bg-[#0F7A43] transition-colors"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}