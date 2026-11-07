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
  Info,
  Layers,
  LayoutTemplate,
  Type
} from 'lucide-react';
import {
  QRStyleOptions,
  ErrorCorrectionLevel,
  DesignStyle,
  QRFrameStyle,
} from '../../types/qr';

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
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'frames' | 'logo' | 'advanced'>('presets');
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Creative Presets
  const presets = [
    {
      id: 'minimal',
      name: 'Minimal Classic',
      desc: 'Black & white, standard borderless',
      fg: '#000000',
      bg: '#ffffff',
      frame: 'none' as QRFrameStyle,
      frameColor: '#000000',
      frameText: 'SCAN ME',
      style: 'minimal' as DesignStyle,
    },
    {
      id: 'ocean',
      name: 'Ocean Blue',
      desc: 'Cobalt blue with bottom banner',
      fg: '#2563eb',
      bg: '#ffffff',
      frame: 'bottom-banner' as QRFrameStyle,
      frameColor: '#2563eb',
      frameText: 'SCAN ME',
      style: 'colorful' as DesignStyle,
    },
    {
      id: 'purple',
      name: 'Royal Purple',
      desc: 'Vibrant purple with bottom banner',
      fg: '#7c3aed',
      bg: '#ffffff',
      frame: 'bottom-banner' as QRFrameStyle,
      frameColor: '#7c3aed',
      frameText: 'SCAN ME',
      style: 'colorful' as DesignStyle,
    },
    {
      id: 'emerald',
      name: 'Forest Emerald',
      desc: 'Clean green with Polaroid card frame',
      fg: '#059669',
      bg: '#ffffff',
      frame: 'card-frame' as QRFrameStyle,
      frameColor: '#059669',
      frameText: 'SCAN FOR MENU',
      style: 'colorful' as DesignStyle,
    },
    {
      id: 'sunset',
      name: 'Sunset Coral',
      desc: 'Warm coral with top banner badge',
      fg: '#ea580c',
      bg: '#ffffff',
      frame: 'top-banner' as QRFrameStyle,
      frameColor: '#ea580c',
      frameText: 'VISIT WEBSITE',
      style: 'colorful' as DesignStyle,
    },
  ];

  // Foreground presets
  const fgPresets = [
    { label: 'Deep Black', value: '#000000' },
    { label: 'Obsidian', value: '#0f172a' },
    { label: 'Electric Blue', value: '#2563eb' },
    { label: 'Royal Purple', value: '#7c3aed' },
    { label: 'Forest Emerald', value: '#059669' },
    { label: 'Sunset Coral', value: '#ea580c' },
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

  // Frame text suggestions
  const frameTextSuggestions = [
    'SCAN ME',
    'SCAN FOR MENU',
    'JOIN WI-FI',
    'VISIT WEBSITE',
    'CONNECT WITH US',
    'EXCLUSIVE OFFER',
  ];

  // Error correction levels
  const eccLevels: { level: ErrorCorrectionLevel; label: string; recovery: string; desc: string }[] = [
    { level: 'L', label: 'Low', recovery: '7% damage recovery', desc: 'Highest data capacity, smallest pixel density. For clean screens.' },
    { level: 'M', label: 'Medium', recovery: '15% recovery', desc: 'Standard industry default for everyday general printing.' },
    { level: 'Q', label: 'Quartile', recovery: '25% recovery', desc: 'High damage resilience, great for outdoor flyers and stickers.' },
    { level: 'H', label: 'High', recovery: '30% recovery', desc: 'Maximum durability. Automatically required for logos and framed designs.' },
  ];

  // Check if fg and bg might be too similar
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

  // Apply a design preset
  const handleApplyPreset = (preset: typeof presets[0]) => {
    onChange({
      ...options,
      presetTheme: preset.id,
      designStyle: preset.style,
      fgColor: preset.fg,
      bgColor: preset.bg,
      isTransparentBg: false,
      frameStyle: preset.frame,
      frameColor: preset.frameColor,
      frameText: preset.frameText,
    });
  };

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
            sizeRatio: options.logo?.sizeRatio || 0.20,
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
      errorCorrection: options.frameStyle !== 'none' ? 'H' : 'M',
    });
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Studio Tab bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'presets'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-blue-600" />
            <span>Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('frames')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'frames'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-3.5 h-3.5 text-purple-600" />
            <span>Frames & Text</span>
            {options.frameStyle !== 'none' && (
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            )}
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
            <span>Logo</span>
            {options.logo && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'colors'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-emerald-600" />
            <span>Colors</span>
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
            <Sliders className="w-3.5 h-3.5 text-slate-600" />
            <span>Size & Specs</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 font-medium transition-colors cursor-pointer self-end sm:self-auto"
          title="Reset all design parameters to defaults"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Design</span>
        </button>
      </div>

      {/* Tab 1: Presets */}
      {activeTab === 'presets' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Curated Creative Presets
            </label>
            <span className="text-[11px] text-slate-500">1-click instant styling</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {presets.map((preset) => {
              const isSelected = options.presetTheme === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3.5 text-left rounded-xl border text-xs transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/30 text-blue-950 ring-2 ring-blue-500/20 shadow-xs font-medium'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900">{preset.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </div>
                  <p className="text-slate-500 text-[11px] leading-snug mb-2.5">{preset.desc}</p>
                  
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.fg }} />
                    <span className="truncate">{preset.frame === 'none' ? 'Standard frame' : 'With banner frame'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Frames & Text */}
      {activeTab === 'frames' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Select Frame Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'none', label: 'No Frame', desc: 'Standard clean QR' },
                { id: 'bottom-banner', label: 'Bottom Banner', desc: 'Badge underneath' },
                { id: 'top-banner', label: 'Top Banner', desc: 'Badge on top' },
                { id: 'card-frame', label: 'Polaroid Card', desc: 'Framed card' },
              ].map((frame) => {
                const isSelected = options.frameStyle === frame.id;
                return (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => onChange({ ...options, frameStyle: frame.id as QRFrameStyle, presetTheme: 'custom' })}
                    className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/40 text-purple-950 ring-1 ring-purple-600 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold mb-0.5">{frame.label}</div>
                    <div className="text-[10px] text-slate-500">{frame.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frame Customization when a frame is active */}
          {options.frameStyle !== 'none' && (
            <div className="pt-3 border-t border-slate-100 space-y-3.5 animate-in fade-in duration-150">
              <div>
                <label htmlFor="frame-text-input" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Frame Call-To-Action Text
                </label>
                <input
                  id="frame-text-input"
                  type="text"
                  maxLength={25}
                  value={options.frameText}
                  onChange={(e) => onChange({ ...options, frameText: e.target.value.toUpperCase(), presetTheme: 'custom' })}
                  placeholder="e.g. SCAN ME"
                  className="w-full px-3.5 py-2 text-sm font-semibold tracking-wider text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-blue-500 font-mono uppercase"
                />
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                  Quick Text Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {frameTextSuggestions.map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => onChange({ ...options, frameText: text, presetTheme: 'custom' })}
                      className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Color Picker */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Banner Background Color
                  </label>
                  <span className="text-xs font-mono text-slate-500 uppercase">{options.frameColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={options.frameColor}
                    onChange={(e) => onChange({ ...options, frameColor: e.target.value, presetTheme: 'custom' })}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200 p-0.5"
                    title="Choose custom frame color"
                  />
                  <input
                    type="text"
                    value={options.frameColor}
                    onChange={(e) => onChange({ ...options, frameColor: e.target.value, presetTheme: 'custom' })}
                    className="w-28 px-3 py-1.5 text-xs font-mono text-slate-800 border border-slate-200 rounded-xl focus:border-blue-500"
                    maxLength={7}
                  />
                  <button
                    type="button"
                    onClick={() => onChange({ ...options, frameColor: options.fgColor, presetTheme: 'custom' })}
                    className="px-2.5 py-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg"
                  >
                    Match QR Color
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Logo Inside QR */}
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
              Upload your brand icon or badge. It will be centered with a clean protective white plate without distorting or stretching.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
              id="qr-logo-upload-input"
            />

            {options.logo ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
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
                      <h4 className="text-sm font-bold text-slate-900 truncate max-w-[180px] sm:max-w-[260px]">
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

                {/* Logo Size Ratio Slider (15% to 26%) */}
                <div className="pt-2 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-semibold text-slate-700">Logo Size in QR Code</span>
                    <span className="font-mono text-slate-500">
                      {Math.round((options.logo.sizeRatio || 0.20) * 100)}% of QR width
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.15"
                    max="0.25"
                    step="0.01"
                    value={options.logo.sizeRatio || 0.20}
                    onChange={(e) =>
                      onChange({
                        ...options,
                        logo: {
                          ...options.logo!,
                          sizeRatio: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Compact (15%)</span>
                    <span>Recommended (20%)</span>
                    <span>Max Safe (25%)</span>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200/60 flex items-start gap-2 text-xs text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Scannability Guarantee:</span> Level H error correction is active to ensure instant reading by all smartphone camera lenses.
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

            {logoError && (
              <div className="mt-2.5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{logoError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Colors */}
      {activeTab === 'colors' && (
        <div className="space-y-4 animate-in fade-in duration-150">
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
              <input
                type="color"
                value={options.fgColor}
                onChange={(e) => onChange({ ...options, fgColor: e.target.value, presetTheme: 'custom' })}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 bg-transparent p-0.5"
                title="Choose custom foreground color"
              />
              <input
                type="text"
                value={options.fgColor}
                onChange={(e) => onChange({ ...options, fgColor: e.target.value, presetTheme: 'custom' })}
                className="w-28 px-3 py-2 text-xs font-mono text-slate-800 border border-slate-200 rounded-xl focus:border-blue-500"
                maxLength={7}
              />
              <span className="text-xs text-slate-400">Custom hex</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {fgPresets.map((preset) => {
                const isSelected = options.fgColor.toLowerCase() === preset.value.toLowerCase();
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onChange({ ...options, fgColor: preset.value, presetTheme: 'custom' })}
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

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Background Color
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.isTransparentBg}
                  onChange={(e) => onChange({ ...options, isTransparentBg: e.target.checked, presetTheme: 'custom' })}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                />
                <span>Transparent Background</span>
              </label>
            </div>

            {!options.isTransparentBg ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="color"
                    value={options.bgColor}
                    onChange={(e) => onChange({ ...options, bgColor: e.target.value, presetTheme: 'custom' })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 bg-transparent p-0.5"
                    title="Choose custom background color"
                  />
                  <input
                    type="text"
                    value={options.bgColor}
                    onChange={(e) => onChange({ ...options, bgColor: e.target.value, presetTheme: 'custom' })}
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
                        onClick={() => onChange({ ...options, bgColor: preset.value, presetTheme: 'custom' })}
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
                <span>Transparent canvas enabled.</span>
              </div>
            )}
          </div>

          {contrastWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Low Contrast Notice:</span> The foreground and background colors are very close in brightness. Ensure sharp contrast for fast scanning.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Size & Specs */}
      {activeTab === 'advanced' && (
        <div className="space-y-4 animate-in fade-in duration-150">
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

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Error Correction Level</span>
              </label>
              {(options.logo || options.frameStyle !== 'none') && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Level H Enforced for Creative Elements
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {eccLevels.map((ecc) => {
                const isLocked = Boolean(options.logo || options.frameStyle !== 'none');
                const isSelected = (isLocked ? 'H' : options.errorCorrection) === ecc.level;
                const isDisabled = isLocked && ecc.level !== 'H';
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
