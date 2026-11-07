import React, { useState, useRef } from 'react';
import {
  Palette,
  Sliders,
  Shield,
  AlertTriangle,
  Check,
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import { QRStyleOptions, ErrorCorrectionLevel, DesignStyle } from '../../types/qr';

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
  const [activeTab, setActiveTab] = useState<'styles' | 'logo' | 'advanced'>('styles');
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pre-curated high-contrast foreground palettes for Colorful & Modern
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
    { level: 'L', label: 'Low', recovery: '7% damage recovery', desc: 'Highest capacity, least dense dots. Ideal for screens without logos.' },
    { level: 'M', label: 'Medium', recovery: '15% recovery', desc: 'Balanced standard recommended for general printing.' },
    { level: 'Q', label: 'Quartile', recovery: '25% recovery', desc: 'High resilience against smudges, ideal for outdoor flyers.' },
    { level: 'H', label: 'High', recovery: '30% recovery', desc: 'Maximum durability. Required for codes with a logo overlay.' },
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

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (supports PNG, JPG, JPEG, and WebP by MIME type or extension)
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));
    const validMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/pjpeg', 'image/webp'];
    const hasValidMime = validMimes.includes(file.type.toLowerCase()) || file.type.startsWith('image/');

    if (!hasValidExt && !hasValidMime) {
      setLogoError('Invalid file type. Please upload a PNG, JPG, JPEG, or WebP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file size (2 MB limit)
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setLogoError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 2 MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Process locally in browser
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        setLogoError('Failed to read image file. Please try another image.');
        return;
      }

      // Test image load
      const testImg = new Image();
      testImg.onload = () => {
        onChange({
          ...options,
          logo: {
            dataUrl,
            name: file.name,
          },
          // Automatically upgrade error correction to Level H for reliable scanning
          errorCorrection: 'H',
        });
      };
      testImg.onerror = () => {
        setLogoError('Corrupted or unreadable image file. Please choose a valid image.');
      };
      testImg.src = dataUrl;
    };

    reader.onerror = () => {
      setLogoError('Error reading file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChange({
      ...options,
      logo: null,
      errorCorrection: 'M',
    });
  };

  const handleStylePresetChange = (style: DesignStyle) => {
    if (style === 'minimal') {
      onChange({
        ...options,
        designStyle: 'minimal',
        fgColor: '#000000',
        bgColor: '#ffffff',
        isTransparentBg: false,
      });
    } else {
      onChange({
        ...options,
        designStyle: 'colorful',
        fgColor: options.fgColor === '#000000' ? '#2563eb' : options.fgColor,
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Tab toggle between Styles, Logo Overlay, and Advanced Specs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('styles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'styles'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            <span>Design Style & Colors</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'logo'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Logo Inside QR</span>
            {options.logo && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('advanced')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
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
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 font-medium transition-colors cursor-pointer self-end sm:self-auto"
          title="Reset colors, style presets, and logo back to defaults"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Design</span>
        </button>
      </div>

      {/* Tab 1: Design Style & Colors */}
      {activeTab === 'styles' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          {/* Selectable Styles: Style A (Minimal) vs Style B (Colorful) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Select Design Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Style A: Minimal & Professional */}
              <button
                type="button"
                onClick={() => handleStylePresetChange('minimal')}
                className={`p-3.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                  options.designStyle === 'minimal'
                    ? 'border-slate-900 bg-slate-50/70 text-slate-950 ring-1 ring-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">A. Minimal & Professional</span>
                  {options.designStyle === 'minimal' && (
                    <Check className="w-4 h-4 text-slate-900" />
                  )}
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Clean black QR modules on a white background. Simple, authoritative, and 100% camera contrast.
                </p>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-black border border-slate-300"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300"></span>
                  <span className="text-[10px] text-slate-400 font-medium ml-1">Black / White Pure Contrast</span>
                </div>
              </button>

              {/* Style B: Colorful & Modern */}
              <button
                type="button"
                onClick={() => handleStylePresetChange('colorful')}
                className={`p-3.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                  options.designStyle === 'colorful'
                    ? 'border-blue-600 bg-blue-50/40 text-blue-950 ring-1 ring-blue-600 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-blue-900">B. Colorful & Modern</span>
                  {options.designStyle === 'colorful' && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Custom foreground and background colors with transparent background options for brand integration.
                </p>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-600"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-600"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-600"></span>
                  <span className="text-[10px] text-slate-400 font-medium ml-1">Custom Palettes</span>
                </div>
              </button>
            </div>
          </div>

          {/* Color pickers shown if Colorful & Modern is active */}
          {options.designStyle === 'colorful' ? (
            <div className="pt-2 border-t border-slate-100 space-y-4">
              {/* Foreground (Dots) Color */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    QR Foreground Color
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
          ) : (
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5 text-xs text-slate-600">
              <Info className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Minimal & Professional mode uses standard high-contrast black modules on pure white, guaranteed to scan reliably on all camera lenses.</span>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: Logo Inside QR */}
      {activeTab === 'logo' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Center Logo Overlay
              </label>
              <span className="text-[11px] text-slate-500">Optional</span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Upload your company emblem, brand icon, or social logo. It will be centered with a clean white protective badge, keeping your QR code proportional and scannable.
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
              id="qr-logo-upload-input"
            />

            {/* Logo Preview or Upload Box */}
            {options.logo ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-200/80 p-2 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={options.logo.dataUrl}
                        alt="Uploaded logo preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[280px]">
                        {options.logo.name}
                      </h4>
                      <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active & Centered in QR</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Logo"
                      aria-label="Remove uploaded logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200/60 flex items-start gap-2 text-xs text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Automatic Error Correction Protection:</span> When a logo is present, Error Correction is automatically set to Level H (30% recovery) to ensure the QR code remains 100% scannable.
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="font-semibold text-sm text-slate-800 mb-1">
                  Click to Upload Logo
                </div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Supports PNG, JPG, JPEG, and WebP (up to 2 MB).
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 group-hover:bg-blue-100/60 text-slate-600 group-hover:text-blue-700 rounded-lg text-xs font-medium transition-colors">
                  <span>Select Image</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {logoError && (
              <div className="mt-2.5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{logoError}</span>
              </div>
            )}
          </div>

          {/* Practical scanning tips */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
            <span className="font-semibold text-slate-800 block">Best Practices for Logo QR Codes:</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-500">
              <li>Square or circular logos with transparent backgrounds give the cleanest look.</li>
              <li>Keep logos simple (such as an icon or brand mark) rather than detailed multi-line text.</li>
              <li>All image processing is executed entirely in your local browser memory (zero server uploads).</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Size & Error Correction */}
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
              {options.logo && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Level H Enforced for Logo
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {eccLevels.map((ecc) => {
                const isSelected = (options.logo ? 'H' : options.errorCorrection) === ecc.level;
                const isDisabled = Boolean(options.logo && ecc.level !== 'H');
                return (
                  <button
                    key={ecc.level}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => onChange({ ...options, errorCorrection: ecc.level })}
                    className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/40 text-purple-950 ring-1 ring-purple-600 font-semibold'
                        : isDisabled
                        ? 'border-slate-100 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed'
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
