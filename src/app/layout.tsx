import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medunacy",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}