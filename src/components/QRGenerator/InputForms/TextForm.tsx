import React from 'react';
import { AlignLeft } from 'lucide-react';
import { TextFormData } from '../../../types/qr';

interface TextFormProps {
  data: TextFormData;
  onChange: (data: TextFormData) => void;
  error?: string;
}

export const TextForm: React.FC<TextFormProps> = ({ data, onChange, error }) => {
  const charCount = data.text.length;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="text-input" className="block text-sm font-semibold text-slate-800">
            Plain Text Message <span className="text-blue-600">*</span>
          </label>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {charCount} characters
          </span>
        </div>
        <div className="relative rounded-xl shadow-xs">
          <textarea
            id="text-input"
            rows={5}
            value={data.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Type or paste any note, message, product code, serial number, or instructions here..."
            className={`block w-full p-3.5 text-sm text-slate-900 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all resize-y ${
              error ? 'border-red-300 focus:border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-blue-500'
            }`}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
            <span>●</span> {error}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-500">
            Plain text is decoded directly on the user's screen without opening a browser. Ideal for serial numbers, crypto wallet addresses, event credentials, and private notes.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
        <AlignLeft className="w-4 h-4 text-purple-600 shrink-0" />
        <span>Supports multi-line formatting and international Unicode / emoji characters.</span>
      </div>
    </div>
  );
};
