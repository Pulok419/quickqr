import React from 'react';
import { PhoneCall } from 'lucide-react';
import { PhoneFormData } from '../../../types/qr';

interface PhoneFormProps {
  data: PhoneFormData;
  onChange: (data: PhoneFormData) => void;
  error?: string;
}

export const PhoneForm: React.FC<PhoneFormProps> = ({ data, onChange, error }) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="phone-number" className="block text-sm font-semibold text-slate-800 mb-1.5">
          Phone Number <span className="text-blue-600">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <PhoneCall className="w-5 h-5 text-blue-500" />
          </div>
          <input
            id="phone-number"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+1 (555) 019-2834"
            className={`block w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-mono ${
              error ? 'border-red-300 focus:border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-blue-500'
            }`}
            autoComplete="tel"
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
            <span>●</span> {error}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-500">
            Include the country code (e.g., +1 for USA/Canada, +44 for UK, +49 for Germany, +81 for Japan, +91 for India) for reliable international dialing.
          </p>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600 space-y-1.5">
        <span className="font-semibold text-slate-800 block">Instant 1-Tap Calling:</span>
        <p>
          Scanning this QR code prompts the phone's dialer to open with the number pre-filled, so customers can call your customer desk or hotline without manually typing numbers.
        </p>
      </div>
    </div>
  );
};
