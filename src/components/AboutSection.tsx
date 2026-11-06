import React from 'react';
import { Globe2, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 sm:py-20 bg-white border-b border-slate-100 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
            Our Purpose
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            About QuickQR
          </h2>
          <p className="mt-3 text-base text-slate-600">
            A free, open utility dedicated to universal privacy and reliable digital-to-physical bridging.
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-7 sm:p-9 shadow-xs">
          <p>
            QuickQR was founded on a simple conviction: <strong>essential web utilities should be fast, private, and free forever</strong>. In recent years, search engines have become saturated with deceptive QR code generators that offer "free" codes, only to deactivate them 14 days later or reroute visitors through slow, tracking-laden redirect servers unless a steep monthly subscription is paid.
          </p>
          <p>
            We believe that you should have full ownership over the physical media you print. When you generate a QR code with QuickQR, your text, link, or Wi-Fi configuration is encoded straight into the standard ISO/IEC 18004 2D matrix directly within your local web browser. No cloud server ever receives your Wi-Fi password or personal details.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 not-prose">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                <Globe2 className="w-4 h-4 text-blue-600" />
                <span>Global Standards</span>
              </div>
              <p className="text-xs text-slate-500">
                Full UTF-8 unicode support for all international alphabets, emojis, and symbols.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Telemetry</span>
              </div>
              <p className="text-xs text-slate-500">
                No third-party trackers, analytics scripts, or behavioral ad pixels.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                <Heart className="w-4 h-4 text-purple-600" />
                <span>Free Forever</span>
              </div>
              <p className="text-xs text-slate-500">
                100% free for personal, non-profit, educational, and commercial purposes.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
