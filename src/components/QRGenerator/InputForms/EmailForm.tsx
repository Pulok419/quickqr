import React from 'react';
import { Mail } from 'lucide-react';
import { EmailFormData } from '../../../types/qr';

interface EmailFormProps {
  data: EmailFormData;
  onChange: (data: EmailFormData) => void;
  error?: string;
}

export const EmailForm: React.FC<EmailFormProps> = ({ data, onChange, error }) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="email-recipient" className="block text-sm font-semibold text-slate-800 mb-1.5">
          Recipient Email Address <span className="text-blue-600">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-5 h-5 text-blue-500" />
          </div>
          <input
            id="email-recipient"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="support@company.com or yourname@gmail.com"
            className={`block w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all ${
              error ? 'border-red-300 focus:border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-blue-500'
            }`}
            autoComplete="off"
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
            <span>●</span> {error}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email-subject" className="block text-sm font-semibold text-slate-800 mb-1.5">
          Default Subject Line <span className="text-slate-400 text-xs font-normal">(Optional)</span>
        </label>
        <input
          id="email-subject"
          type="text"
          value={data.subject}
          onChange={(e) => onChange({ ...data, subject: e.target.value })}
          placeholder="e.g. Inquiring about Product Consultation"
          className="block w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      <div>
        <label htmlFor="email-body" className="block text-sm font-semibold text-slate-800 mb-1.5">
          Pre-filled Message Body <span className="text-slate-400 text-xs font-normal">(Optional)</span>
        </label>
        <textarea
          id="email-body"
          rows={3}
          value={data.body}
          onChange={(e) => onChange({ ...data, body: e.target.value })}
          placeholder="Hello team, I would like to request more information regarding..."
          className="block w-full p-3.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-y"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          When scanned, this will automatically launch the user's default email client (Gmail, Apple Mail, Outlook) pre-addressed and ready to send.
        </p>
      </div>
    </div>
  );
};
