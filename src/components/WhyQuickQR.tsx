import React from 'react';
import { Check, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const WhyQuickQR: React.FC = () => {
  const comparisonRows = [
    {
      feature: 'QR Code Expiration',
      quickQr: 'Never expires (Direct static encoding)',
      competitors: 'Expires after 14-day trial or paywall',
      isAdvantage: true,
    },
    {
      feature: 'Scan Limits',
      quickQr: 'Unlimited scans forever',
      competitors: 'Capped at 50-100 scans on "free" tiers',
      isAdvantage: true,
    },
    {
      feature: 'Server Redirects & Middlemen',
      quickQr: 'None — scans link straight to your content',
      competitors: 'Reroutes through proprietary tracking URLs',
      isAdvantage: true,
    },
    {
      feature: 'High-Resolution Vector SVG Export',
      quickQr: 'Free, instant vector download',
      competitors: 'Locked behind $25–$40/month subscriptions',
      isAdvantage: true,
    },
    {
      feature: 'Data Privacy & Password Handling',
      quickQr: '100% processed locally in browser RAM',
      competitors: 'Passwords and links stored in cloud databases',
      isAdvantage: true,
    },
    {
      feature: 'Registration & Credit Card Required',
      quickQr: 'None — zero registration or personal info',
      competitors: 'Mandatory sign-up and payment prompt',
      isAdvantage: true,
    },
  ];

  return (
    <section id="comparison" className="py-16 sm:py-20 bg-white border-b border-slate-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
            Honest & Transparent
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
            Why Choose QuickQR Over Other Generators?
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Beware of "free trial" QR generators that secretly insert redirect links and hold your printed menus and flyers hostage. QuickQR encodes direct, non-expiring codes.
          </p>
        </div>

        {/* Comparison Table Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 w-2/5">
                    Feature
                  </th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50/50 w-2/5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>QuickQR (Static & Free)</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/5">
                    Other "Free" Generators
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 bg-blue-50/20 text-slate-900 font-medium">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.quickQr}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{row.competitors}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reassurance banner */}
        <div className="mt-8 max-w-4xl mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between flex-wrap gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Printed a QR code generated with QuickQR? It will work today, tomorrow, and 10 years from now.</span>
          </div>
          <a
            href="#generator"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Create yours now →
          </a>
        </div>

      </div>
    </section>
  );
};
