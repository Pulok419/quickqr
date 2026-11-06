import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Zap, Infinity, CheckCircle2 } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToGenerator = () => {
    const el = document.getElementById('generator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHow = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-20 border-b border-slate-100 bg-white">
      {/* Subtle radial background tint */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-50/50 via-purple-50/20 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Top kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/60 text-blue-800 text-xs font-semibold mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Fast, Free & Private QR Code Generator</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
            Create Custom QR Codes in Seconds.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Free Forever.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Generate high-resolution PNG and vector SVG QR codes for websites, Wi-Fi networks, contact info, and messages. All generated locally in your browser with zero data collection.
          </p>

          {/* CTA Group */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={scrollToGenerator}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-sm shadow-blue-500/25 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <span>Create Your QR Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={scrollToHow}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <span>See How It Works</span>
            </button>
          </div>

          {/* Trust proof list */}
          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-center gap-y-3 gap-x-6 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Client-Side Privacy</span>
            </div>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">·</span>
            <div className="flex items-center gap-1.5">
              <Infinity className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Permanent Static Codes (Never Expire)</span>
            </div>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">·</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Free High-Res PNG & Vector SVG</span>
            </div>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">·</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>No Sign-Up Required</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
