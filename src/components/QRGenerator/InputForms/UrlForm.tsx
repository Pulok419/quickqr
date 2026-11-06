import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { UrlFormData } from '../../../types/qr';

interface UrlFormProps {
  data: UrlFormData;
  onChange: (data: UrlFormData) => void;
  error?: string;
}

export const UrlForm: React.FC<UrlFormProps> = ({ data, onChange, error }) => {
  const quickLinks = [
    { label: 'Website', example: 'https://example.com' },
    { label: 'LinkedIn', example: 'https://linkedin.com/in/' },
    { label: 'Instagram', example: 'https://instagram.com/' },
    { label: 'YouTube', example: 'https://youtube.com/@' },
    { label: 'Google Maps', example: 'https://maps.google.com/' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="url-input" className="block text-sm font-semibold text-slate-800 mb-1.5">
          Website or Link URL <span className="text-blue-600">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Globe className="w-5 h-5 text-blue-500" />
          </div>
          <input
            id="url-input"
            type="url"
            value={data.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://example.com"
            className={`block w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all ${
              error ? 'border-red-300 focus:border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-blue-500'
            }`}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
            <span>●</span> {error}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-500">
            Enter any web page, portfolio, booking link, or digital menu. Protocol (https://) will be added automatically if omitted.
          </p>
        )}
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
          Quick Link Templates
        </span>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onChange({ url: item.example })}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{item.label}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
