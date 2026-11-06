import React, { useState } from 'react';
import { QrCode, Menu, X, ShieldCheck, ArrowRight } from 'lucide-react';

interface HeaderProps {
  onOpenPrivacy: () => void;
  onOpenContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPrivacy, onOpenContact }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-8">
          
          {/* Zone 1: Single text element wordmark with clean icon */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 text-slate-900 group whitespace-nowrap shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
                Quick<span className="text-blue-600">QR</span>
              </span>
            </div>
          </a>

          {/* Zone 2: Concise single-line text links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => scrollToSection('generator')}
              className="hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              QR Generator
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('comparison')}
              className="hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Why QuickQR
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              FAQ
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              onClick={() => scrollToSection('generator')}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-sm shadow-blue-500/20 hover:shadow-md transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Create QR Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => scrollToSection('generator')}
              className="text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              QR Generator
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('comparison')}
              className="text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              Why QuickQR
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPrivacy();
              }}
              className="text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Contact Support
            </button>
          </nav>
          <div className="pt-2">
            <button
              onClick={() => scrollToSection('generator')}
              className="w-full py-3 px-4 text-center font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm text-sm"
            >
              Start Generating Now
            </button>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Client-Side & Private</span>
          </div>
        </div>
      )}
    </header>
  );
};
