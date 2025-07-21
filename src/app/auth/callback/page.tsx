"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Starting auth callback...");

        // First, try to get the current session
        console.log("Getting current session...");
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Get session error:", error);
          setErrorMessage(`Authentication error: ${error.message}`);
          setStatus("error");
          return;
        }

        if (data?.session?.user) {
          console.log("Session found, user authenticated!");
          await handleSuccessfulAuth(data.session.user);
        } else {
          // No current session, check for hash parameters
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1)
          );
          const access_token = hashParams.get("access_token");
          const refresh_token = hashParams.get("refresh_token");

          if (access_token && refresh_token) {
            console.log(
              "Found tokens in URL, attempting manual session setup..."
            );

            try {
              // Try the original setSession approach with shorter timeout
              const sessionPromise = supabase.auth.setSession({
                access_token,
                refresh_token,
              });

              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Session timeout")), 3000)
              );

              const result = (await Promise.race([
                sessionPromise,
                timeoutPromise,
              ])) as {
                data?: { user: any };
                error?: any;
              };

              if (result.data?.user) {
                console.log("Manual session setup successful!");
                await handleSuccessfulAuth(result.data.user);
              } else if (result.error) {
                throw result.error;
              } else {
                throw new Error("No user data returned");
              }
            } catch (sessionError) {
              console.error("Manual session setup failed:", sessionError);

              // Last resort: try refreshing the page once to let Supabase handle it naturally
              if (!sessionStorage.getItem("callback_attempted")) {
                console.log("Attempting page refresh...");
                sessionStorage.setItem("callback_attempted", "true");
                window.location.reload();
                return;
              } else {
                // Remove the flag and show error
                sessionStorage.removeItem("callback_attempted");
                setErrorMessage(
                  "Failed to verify email. Please try clicking the verification link again."
                );
                setStatus("error");
              }
            }
          } else {
            console.log("No tokens found in URL");
            setErrorMessage(
              "No authentication data found in the verification link"
            );
            setStatus("error");
          }
        }
      } catch (error) {
        console.error("Callback error:", error);
        setErrorMessage(
          `Verification failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        setStatus("error");
      }
    };

    const handleSuccessfulAuth = async (user: {
      id: string;
      [key: string]: any;
    }) => {
      try {
        console.log("Handling successful authentication for user:", user.id);

        // Update verification status
        const { error: dbError } = await supabase
          .from("users")
          .update({ is_verified: true })
          .eq("user_id", user.id);

        if (dbError) {
          console.warn("Database update warning:", dbError);
          // Don't fail the whole process for this
        }

        console.log("Verification process completed successfully!");
        setStatus("success");

        // Clear the hash and session flag
        window.history.replaceState(null, "", window.location.pathname);
        sessionStorage.removeItem("callback_attempted");

        // Redirect after success
        setTimeout(() => {
          router.push("/et");
        }, 2000);
      } catch (err) {
        console.error("Error in handleSuccessfulAuth:", err);
        setErrorMessage(
          "Authentication succeeded but verification update failed"
        );
        setStatus("error");
      }
    };

    // Only run once when component mounts
    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-12 text-center">
        {status === "loading" && (
          <div>
            <div className="animate-spin w-16 h-16 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-6"></div>
            <div className="text-2xl">⚕️</div>
            <h2 className="text-lg font-semibold text-[#118B50] mt-2">
              Medunacy
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Verifying your account...
            </p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="text-3xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-600">
              Email Verified!
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Your account has been successfully verified.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Redirecting to home page...
            </p>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="text-3xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-600">
              Verification Failed
            </h2>
            <p className="text-sm text-gray-600 mt-2 mb-4">{errorMessage}</p>
            <p className="text-xs text-gray-500 mb-4">
              You can try registering again or contact support if the problem
              persists.
            </p>
            <button
              onClick={() => router.push("/et")}
              className="px-6 py-2 bg-[#118B50] text-white rounded-lg hover:bg-[#0F7A43] transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
