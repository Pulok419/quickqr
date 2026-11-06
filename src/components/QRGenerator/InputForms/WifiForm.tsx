import React, { useState } from 'react';
import { Wifi, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { WifiFormData, WifiEncryption } from '../../../types/qr';

interface WifiFormProps {
  data: WifiFormData;
  onChange: (data: WifiFormData) => void;
  error?: string;
}

export const WifiForm: React.FC<WifiFormProps> = ({ data, onChange, error }) => {
  const [showPassword, setShowPassword] = useState(false);

  const securityOptions: { value: WifiEncryption; label: string; sub: string }[] = [
    { value: 'WPA', label: 'WPA / WPA2 / WPA3', sub: 'Standard modern routers' },
    { value: 'WEP', label: 'WEP', sub: 'Legacy encryption' },
    { value: 'nopass', label: 'Open (No password)', sub: 'Unencrypted public networks' },
  ];

  return (
    <div className="space-y-4">
      {/* Network Name (SSID) */}
      <div>
        <label htmlFor="wifi-ssid" className="block text-sm font-semibold text-slate-800 mb-1.5">
          Network Name (SSID) <span className="text-blue-600">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Wifi className="w-5 h-5 text-blue-600" />
          </div>
          <input
            id="wifi-ssid"
            type="text"
            value={data.ssid}
            onChange={(e) => onChange({ ...data, ssid: e.target.value })}
            placeholder="e.g. CafeGuest_5G or HomeOffice"
            className="block w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Security Type */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Security Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {securityOptions.map((opt) => {
            const isSelected = data.encryption === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...data, encryption: opt.value })}
                className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 text-blue-900 shadow-xs ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-sm mb-0.5">{opt.label}</div>
                <div className="text-[11px] text-slate-500">{opt.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Password (if not Open) */}
      {data.encryption !== 'nopass' && (
        <div>
          <label htmlFor="wifi-password" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Wi-Fi Password <span className="text-blue-600">*</span>
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-5 h-5 text-slate-400" />
            </div>
            <input
              id="wifi-password"
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              onChange={(e) => onChange({ ...data, password: e.target.value })}
              placeholder="Enter exact Wi-Fi network password"
              className="block w-full pl-11 pr-12 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Hidden Network Checkbox */}
      <div className="pt-1">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={data.hidden}
            onChange={(e) => onChange({ ...data, hidden: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">This is a hidden network (SSID is not broadcasted)</span>
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
          <span>●</span> {error}
        </p>
      )}

      {/* Privacy guarantee badge */}
      <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Zero-Knowledge Security:</span> Your Wi-Fi password is coded directly into the QR pattern inside your browser. No passwords ever reach our server or any third party.
        </div>
      </div>
    </div>
  );
};
