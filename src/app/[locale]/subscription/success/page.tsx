// src/app/[locale]/subscription/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
  const t = useTranslations("subscription");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (!sessionId) {
        setError("No session ID found");
        setIsVerifying(false);
        return;
      }

      try {
        // Verify the session with our API
        const response = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error("Failed to verify session");
        }

        setIsVerifying(false);
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (err) {
        console.error("Verification error:", err);
        setError("Failed to verify subscription");
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [searchParams, router]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#118B50] mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/premium"
              className="text-[#118B50] hover:text-[#0F7A43] font-medium"
            >
              ← Back to Premium
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Premium! 🎉
          </h1>
          <p className="text-gray-600 mb-6">
            Your subscription is now active. You have full access to all premium features.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Redirecting to dashboard...
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-[#118B50] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0F7A43] transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}