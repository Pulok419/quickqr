import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { SmsFormData } from '../../../types/qr';

interface SmsFormProps {
  data: SmsFormData;
  onChange: (data: SmsFormData) => void;
  error?: string;
}

export const SmsForm: React.FC<SmsFormProps> = ({ data, onChange, error }) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="sms-phone" className="block text-sm font-semibold text-slate-800 mb-1.5">
          Recipient Mobile Number <span className="text-blue-600">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <MessageSquareText className="w-5 h-5 text-purple-600" />
          </div>
          <input
            id="sms-phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="+1 555 123 4567"
            className={`block w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-mono ${
              error ? 'border-red-300 focus:border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-blue-500'
            }`}
            autoComplete="tel"
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
            <span>●</span> {error}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="sms-message" className="block text-sm font-semibold text-slate-800">
            Pre-composed Text Message <span className="text-slate-400 text-xs font-normal">(Optional)</span>
          </label>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {data.message.length} chars
          </span>
        </div>
        <textarea
          id="sms-message"
          rows={3}
          value={data.message}
          onChange={(e) => onChange({ ...data, message: e.target.value })}
          placeholder="e.g. START or SUBSCRIBE to VIP club promotions"
          className="block w-full p-3.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-y"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Frequently used for automated SMS keyword opt-ins, contest entries, RSVPs, or customer support dispatch.
        </p>
      </div>
    </div>
  );
};
