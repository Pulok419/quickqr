import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, ServerOff, CheckCircle } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Privacy & Security Policy</h3>
              <p className="text-xs text-slate-500">Last updated: 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close privacy modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-sm text-slate-600 max-h-[75vh] overflow-y-auto">
          
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3 text-emerald-950">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Core Privacy Guarantee:</span>
              <span>All QR code computation occurs exclusively on your client device using JavaScript. Your data is never uploaded to any remote server, saved to any disk, or analyzed.</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                <ServerOff className="w-4 h-4 text-blue-600" />
                <span>1. Zero Server-Side Processing</span>
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed">
                QuickQR functions as a static web application hosted on global edge networks. When you generate a QR code, the text, URL, Wi-Fi password, or phone number you type is passed directly into the open-source QR algorithm running inside your browser's local memory (RAM). We do not operate a backend server to receive, record, or store generated codes.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-purple-600" />
                <span>2. Handling of Wi-Fi Passwords and Private Text</span>
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed">
                When you generate a Wi-Fi QR code, your password is formatted into the standard Wi-Fi URI format locally. It is never logged or transmitted. Once you close or reload the browser tab, any data entered into input fields is cleared.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                <EyeOff className="w-4 h-4 text-slate-700" />
                <span>3. No User Tracking or Third-Party Cookies</span>
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed">
                QuickQR does not use advertising cookies, fingerprinting scripts, or cross-site behavioral trackers. We do not sell user data to data brokers or marketing firms.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">
                4. International Compliance
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed">
                Because no personal identifiable information (PII) is collected or processed by our infrastructure, QuickQR inherently aligns with the data minimization principles of the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
