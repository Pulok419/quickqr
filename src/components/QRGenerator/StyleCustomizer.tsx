import React, { useState } from 'react';
import { Palette, Sliders, Shield, AlertTriangle, Eye, Check } from 'lucide-react';
import { QRStyleOptions, ErrorCorrectionLevel } from '../../types/qr';

interface StyleCustomizerProps {
  options: QRStyleOptions;
  onChange: (options: QRStyleOptions) => void;
  onReset: () => void;
}

export const StyleCustomizer: React.FC<StyleCustomizerProps> = ({
  options,
  onChange,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'advanced'>('colors');

  // Pre-curated high-contrast foreground palettes
  const fgPresets = [
    { label: 'Obsidian Black', value: '#0f172a' },
    { label: 'Deep Classic', value: '#000000' },
    { label: 'Electric Blue', value: '#2563eb' },
    { label: 'Royal Purple', value: '#7c3aed' },
    { label: 'Forest Emerald', value: '#059669' },
    { label: 'Crimson Red', value: '#dc2626' },
  ];

  // Background presets
  const bgPresets = [
    { label: 'Pure White', value: '#ffffff' },
    { label: 'Soft Slate', value: '#f8fafc' },
    { label: 'Warm Light', value: '#fffbeb' },
    { label: 'Ice Blue', value: '#eff6ff' },
  ];

  // Size presets
  const sizePresets = [
    { label: '256 px', value: 256, sub: 'Web / Thumbnail' },
    { label: '512 px', value: 512, sub: 'Standard Display' },
    { label: '1024 px', value: 1024, sub: 'Flyers & Menus' },
    { label: '2048 px', value: 2048, sub: 'Large Print / Poster' },
  ];

  // Error correction levels
  const eccLevels: { level: ErrorCorrectionLevel; label: string; recovery: string; desc: string }[] = [
    { level: 'L', label: 'Low', recovery: '7% damage recovery', desc: 'Highest capacity, least dense dots. Ideal for screens.' },
    { level: 'M', label: 'Medium', recovery: '15% recovery', desc: 'Balanced standard recommended for general printing.' },
    { level: 'Q', label: 'Quartile', recovery: '25% recovery', desc: 'High resilience against smudges, ideal for outdoor flyers.' },
    { level: 'H', label: 'High', recovery: '30% recovery', desc: 'Maximum durability. Recommended if placed on curved surfaces.' },
  ];

  // Check if fg and bg might be too similar (basic luminance distance check)
  const isContrastLow = () => {
    if (options.isTransparentBg) return false;
    const hexToRgb = (hex: string) => {
      const c = hex.replace('#', '');
      const num = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    };
    try {
      const fg = hexToRgb(options.fgColor);
      const bg = hexToRgb(options.bgColor);
      const lumFg = 0.299 * fg.r + 0.587 * fg.g + 0.114 * fg.b;
      const lumBg = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b;
      return Math.abs(lumFg - lumBg) < 60;
    } catch {
      return false;
    }
  };

  const contrastWarning = isContrastLow();

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Tab toggle between Colors & Format Settings */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'colors'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            <span>Colors & Style</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('advanced')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'advanced'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-600" />
            <span>Size & Error Correction</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
        >
          Reset Styles
        </button>
      </div>

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Foreground (Dots) Color */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                QR Code Color (Foreground)
              </label>
              <span className="text-xs font-mono font-medium text-slate-500 uppercase">
                {options.fgColor}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex items-center">
                <input
                  type="color"
                  value={options.fgColor}
                  onChange={(e) => onChange({ ...options, fgColor: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 bg-transparent p-0.5"
                  title="Choose custom foreground color"
                />
              </div>
              <input
                type="text"
                value={options.fgColor}
                onChange={(e) => onChange({ ...options, fgColor: e.target.value })}
                className="w-28 px-3 py-2 text-xs font-mono text-slate-800 border border-slate-200 rounded-xl focus:border-blue-500"
                maxLength={7}
              />
              <span className="text-xs text-slate-400">Custom hex</span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {fgPresets.map((preset) => {
                const isSelected = options.fgColor.toLowerCase() === preset.value.toLowerCase();
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onChange({ ...options, fgColor: preset.value })}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: preset.value }}
                    />
                    <span className="truncate">{preset.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Color */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.isTransparentBg}
                    onChange={(e) => onChange({ ...options, isTransparentBg: e.target.checked })}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                  />
                  <span>Transparent Background</span>
                </label>
              </div>
            </div>

            {!options.isTransparentBg ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex items-center">
                    <input
                      type="color"
                      value={options.bgColor}
                      onChange={(e) => onChange({ ...options, bgColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 bg-transparent p-0.5"
                      title="Choose custom background color"
                    />
                  </div>
                  <input
                    type="text"
                    value={options.bgColor}
                    onChange={(e) => onChange({ ...options, bgColor: e.target.value })}
                    className="w-28 px-3 py-2 text-xs font-mono text-slate-800 border border-slate-200 rounded-xl focus:border-blue-500"
                    maxLength={7}
                  />
                  <span className="text-xs text-slate-400">Custom hex</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {bgPresets.map((preset) => {
                    const isSelected = options.bgColor.toLowerCase() === preset.value.toLowerCase();
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => onChange({ ...options, bgColor: preset.value })}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: preset.value }}
                        />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Transparent canvas enabled. Great for overlaying onto brochures, posters, or branded graphics.</span>
              </div>
            )}
          </div>

          {/* Contrast warning */}
          {contrastWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Low Contrast Notice:</span> The foreground and background colors are very close in brightness. QR code scanners require sharp contrast to read codes reliably.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Tab (Size, Error Correction, Margin) */}
      {activeTab === 'advanced' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Export Size Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Resolution & Export Size
              </label>
              <span className="text-xs font-mono text-slate-500">{options.size} × {options.size} px</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sizePresets.map((size) => {
                const isSelected = options.size === size.value;
                return (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => onChange({ ...options, size: size.value })}
                    className={`p-2.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 text-blue-900 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold">{size.label}</div>
                    <div className="text-[11px] text-slate-500">{size.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Correction Level */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Error Correction Level</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {eccLevels.map((ecc) => {
                const isSelected = options.errorCorrection === ecc.level;
                return (
                  <button
                    key={ecc.level}
                    type="button"
                    onClick={() => onChange({ ...options, errorCorrection: ecc.level })}
                    className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/40 text-purple-950 ring-1 ring-purple-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>Level {ecc.level} ({ecc.label})</span>
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded">
                        {ecc.recovery}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{ecc.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Margin / Quiet Zone */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Quiet Zone (Margin)
              </label>
              <span className="text-xs text-slate-500">{options.margin} modules border</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Compact', value: 1, desc: 'Tight margins' },
                { label: 'Standard', value: 2, desc: 'Recommended' },
                { label: 'Spacious', value: 4, desc: 'ISO Standard' },
              ].map((m) => {
                const isSelected = options.margin === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => onChange({ ...options, margin: m.value })}
                    className={`p-2.5 text-center rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>{m.label}</div>
                    <div className="text-[10px] text-slate-500">{m.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
