import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nagar Drishti AI — Smart Civic Infrastructure Platform",
  description: "AI-powered civic infrastructure reporting and triage. Report issues in seconds — our AI instantly analyzes severity and routes to the right city crew.",
  keywords: "civic tech, smart city, infrastructure, AI triage, pothole, hazard reporting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TopNav />
        {children}
      </body>
    </html>
  );
}
