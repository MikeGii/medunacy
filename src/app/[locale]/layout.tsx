// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import "../globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { ForumProvider } from "@/contexts/ForumContext";
import { ExamProvider } from "@/contexts/ExamContext";
import LanguageTransitionOverlay from "@/components/layout/LanguageTransitionOverlay";
import GlobalErrorBoundary from "@/components/common/GlobalErrorBoundary";

export const metadata: Metadata = {
  title: "Medunacy",
  icons: {
    icon: "/favicon.png",
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await the params as required by Next.js 15
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} antialiased`}
        style={{ backgroundColor: "#FBF6E9" }}
      >
        <LanguageTransitionOverlay />
        <NextIntlClientProvider messages={messages}>
          <GlobalErrorBoundary>
            <AuthProvider>
              <AuthModalProvider>
                <ForumProvider>
                  <ExamProvider>{children}</ExamProvider>
                </ForumProvider>
              </AuthModalProvider>
            </AuthProvider>
          </GlobalErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
