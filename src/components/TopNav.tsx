"use client";

import GooeyNav from './GooeyNav';
import { ShieldAlert } from 'lucide-react';
import NextLink from 'next/link';
import Image from 'next/image';
import LocationDisplay from './LocationDisplay';

export default function TopNav() {
  const items = [
    { label: "Home", href: "/" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "My Reports", href: "/my-reports" },
    { label: "Profile", href: "/profile" },
    { label: "Official Portal", href: "/official" },
  ];

  return (
    <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <NextLink href="/" className="flex items-center gap-3 group">
          <div className="rounded-full shadow-sm shadow-teal-500/10 group-hover:scale-105 transition-transform overflow-hidden border border-slate-100">
            <Image src="/logo.jpg" alt="Nagar Drishti Logo" width={44} height={44} className="object-cover" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-800 flex items-center">
            Nagar Drishti <LocationDisplay />
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
