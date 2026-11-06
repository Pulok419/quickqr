import React from 'react';
import { MousePointerClick, SlidersHorizontal, DownloadCloud } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Choose Type & Input Details',
      desc: 'Pick from 6 specialized formats: website URLs, Wi-Fi credentials, plain text, email messages, phone numbers, or SMS. Fill in the requested details with automatic validation.',
      icon: MousePointerClick,
      badge: 'Step 1',
    },
    {
      number: '02',
      title: 'Style Colors & Error Correction',
      desc: 'Customize the foreground and background colors to match your brand palette. Adjust error recovery up to 30% for robust outdoor and physical print resilience.',
      icon: SlidersHorizontal,
      badge: 'Step 2',
    },
    {
      number: '03',
      title: 'Download PNG or Vector SVG',
      desc: 'Save your code instantly as a crisp high-DPI PNG or infinite-resolution vector SVG. Print on business cards, menus, packaging, or flyers with 100% camera readability.',
      icon: DownloadCloud,
      badge: 'Step 3',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-white border-b border-slate-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How QuickQR Works
          </h2>
          <p className="mt-3 text-base text-slate-600">
            No technical knowledge needed. Create reliable, camera-scannable QR codes completely within your browser.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-white rounded-2xl border border-slate-200/90 p-7 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-mono">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                  <span>Fast & automated</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
