import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import SideRays from "@/components/SideRays";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nagar Drishti — Smart Civic Infrastructure Platform",
  description: "Report and track civic issues in your neighborhood.",
  keywords: "civic tech, smart city, infrastructure, AI triage, pothole, hazard reporting",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    images: [{ url: "/logo.jpg" }],
  },
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
      <body className="min-h-full flex flex-col font-sans relative overflow-x-hidden">
        <div className="fixed inset-0 w-full h-full -z-10 opacity-70 pointer-events-none">
          <SideRays
            rayColor1="#e8880b"
            rayColor2="#1e456c"
            origin="bottom-right"
            speed={2.5}
            intensity={1.1}
            spread={2}
            tilt={0}
            saturation={1.5}
            blend={0.75}
            falloff={1.6}
            opacity={1}
          />
        </div>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
