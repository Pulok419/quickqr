import React from 'react';
import { QrCode, ArrowUp, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenContact }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-slate-200/80 pt-12 pb-10 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Quick<span className="text-blue-600">QR</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Free, private, and unlimited online QR Code Generator for international users. No registration, no expiration, no ads.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% In-Browser Privacy</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              QR Generators
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => scrollTo('generator')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  URL QR Code
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('generator')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Wi-Fi QR Code
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('generator')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Plain Text QR Code
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('generator')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Email & SMS QR Code
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('generator')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Phone Call QR Code
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => scrollTo('how-it-works')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('features')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Features & Formats
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('comparison')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Why Choose QuickQR
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('faq')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('about')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Security & Contact
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenPrivacy} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Privacy Policy & Guarantees
                </button>
              </li>
              <li>
                <button onClick={onOpenContact} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Contact Support & Feedback
                </button>
              </li>
              <li>
                <span className="text-slate-400">Zero Server Logging</span>
              </li>
              <li>
                <span className="text-slate-400">ISO/IEC 18004 Compliant</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} QuickQR. All rights reserved. Built for international users.
          </div>
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
