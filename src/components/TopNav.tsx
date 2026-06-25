"use client";

import GooeyNav from './GooeyNav';
import { ShieldAlert } from 'lucide-react';
import NextLink from 'next/link';

export default function TopNav() {
  const items = [
    { label: "Home", href: "/" },
    { label: "My Reports", href: "/my-reports" },
    { label: "Official Portal", href: "/official" },
  ];

  return (
    <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <NextLink href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-teal-50 shadow-sm shadow-teal-500/10 group-hover:scale-105 transition-transform">
            <ShieldAlert size={24} className="text-teal-600" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-800">
            Nagar Drishti<span className="text-teal-500">.ai</span>
          </span>
        </NextLink>
        
        <div className="hidden md:block">
          <GooeyNav
            items={items}
            particleCount={12}
            particleDistances={[60, 20]}
            particleR={80}
            initialActiveIndex={0}
            animationTime={600}
            timeVariance={200}
            colors={['#14b8a6', '#0f766e', '#0ea5e9', '#3b82f6']}
          />
        </div>
      </div>
    </header>
  );
}
