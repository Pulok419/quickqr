import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Upload,
  Trash2,
  RefreshCw,
  Sliders,
  Palette,
  Layout,
  Type,
  QrCode,
  Check,
  AlertTriangle,
  Info,
  Utensils,
  Briefcase,
  Calendar,
  Wifi,
  ExternalLink,
} from 'lucide-react';
import {
  PosterData,
  PosterCategory,
  PosterLayout,
  PosterAlignment,
  PosterAspectRatio,
} from '../../types/poster';
import {
  POSTER_TEMPLATES,
  POSTER_COLOR_PRESETS,
  PosterTemplateDefinition,
} from '../../data/posterTemplates';
import {
  renderPosterToCanvas,
  downloadPoster,
} from '../../utils/posterRenderer';

interface PosterMakerProps {
  currentQRDataUrl?: string;
  currentQRPayload?: string;
}

export const PosterMaker: React.FC<PosterMakerProps> = ({
  currentQRPayload,
}) => {
  // Active Poster Data initialized with Restaurant Menu template
  const [posterData, setPosterData] = useState<PosterData>(
    POSTER_TEMPLATES[0].defaultData
  );

  const [activeTab, setActiveTab] = useState<'template' | 'content' | 'qr' | 'logo' | 'layout' | 'colors'>('template');
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Update QR payload if user explicitly passed it from QR generator
  useEffect(() => {
    if (currentQRPayload && currentQRPayload.trim()) {
      setPosterData((prev) => ({
        ...prev,
        qrPayload: currentQRPayload,
      }));
    }
  }, [currentQRPayload]);

  // Redraw canvas whenever posterData changes
  const updateCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    try {
      await renderPosterToCanvas(canvasRef.current, posterData);
    } catch (err) {
      console.error('Error rendering poster canvas:', err);
    } finally {
      setIsRendering(false);
    }
  }, [posterData]);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  // Handle Template Selection
  const handleSelectTemplate = (template: PosterTemplateDefinition) => {
    setPosterData({
      ...template.defaultData,
      // Preserve existing user logo if already uploaded
      logoDataUrl: posterData.logoDataUrl || template.defaultData.logoDataUrl,
      logoName: posterData.logoName || template.defaultData.logoName,
    });
  };

  // Handle Logo Upload (Client-side, 2MB limit, PNG/JPG/WebP)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));
    const validMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/pjpeg', 'image/webp'];
    const hasValidMime = validMimes.includes(file.type.toLowerCase()) || file.type.startsWith('image/');

    if (!hasValidExt && !hasValidMime) {
      setLogoError('Please upload a valid PNG, JPG, or WebP image file.');
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }

    const maxBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxBytes) {
      setLogoError(`Image is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max limit is 2 MB.`);
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPosterData((prev) => ({
          ...prev,
          logoDataUrl: dataUrl,
          logoName: file.name,
        }));
      }
    };
    reader.onerror = () => {
      setLogoError('Failed to read image. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoError(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
    setPosterData((prev) => ({
      ...prev,
      logoDataUrl: null,
      logoName: null,
    }));
  };

  // Handle High-Res Download
  const handleDownload = async () => {
    try {
      await downloadPoster(posterData);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Handle Browser Print
  const handlePrint = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // Fallback: trigger standard print
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Poster - QuickQR</title>
          <style>
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
            img { max-width: 100%; max-height: 100vh; object-fit: contain; }
            @page { margin: 0; size: auto; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const categoryIcons: Record<PosterCategory, React.ReactNode> = {
    restaurant: <Utensils className="w-3.5 h-3.5" />,
    business: <Briefcase className="w-3.5 h-3.5" />,
    event: <Calendar className="w-3.5 h-3.5" />,
    wifi: <Wifi className="w-3.5 h-3.5" />,
  };

  return (
    <section id="poster-maker" className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Free In-Browser Print Studio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Create Print-Ready QR Posters & Table Stands
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
            Turn your QR codes into stunning flyers, table cards, and promotional posters. Customize headings, branding colors, upload a logo, and export in 300 DPI high resolution.
          </p>
        </div>

        {/* Studio Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-7 lg:p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Poster Customizer Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Category Quick Selector Pills */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
                  1. Select Poster Purpose & Template
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {POSTER_TEMPLATES.map((tmpl) => {
                    const isSelected = posterData.templateId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tmpl)}
                        className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs font-medium'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="p-1 rounded-md bg-slate-100 text-slate-700">
                            {categoryIcons[tmpl.category]}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <div className="font-bold text-xs text-slate-900 mb-0.5">{tmpl.name}</div>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{tmpl.tagline}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Tabs for Customizing Steps */}
              <div className="border border-slate-200/90 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto no-scrollbar">
                  {[
                    { id: 'content', label: 'Copy & Text', icon: <Type className="w-3.5 h-3.5" /> },
                    { id: 'qr', label: 'QR Content', icon: <QrCode className="w-3.5 h-3.5" /> },
                    { id: 'logo', label: 'Brand Logo', icon: <Upload className="w-3.5 h-3.5" /> },
                    { id: 'layout', label: 'Layout & Align', icon: <Layout className="w-3.5 h-3.5" /> },
                    { id: 'colors', label: 'Colors & Theme', icon: <Palette className="w-3.5 h-3.5" /> },
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab: Content & Copy */}
                {activeTab === 'content' && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Badge Callout (Top Pill)
                      </label>
                      <input
                        type="text"
                        maxLength={35}
                        value={posterData.badgeText}
                        onChange={(e) => setPosterData({ ...posterData, badgeText: e.target.value })}
                        placeholder="e.g. TABLE TOP MENU or GUEST WI-FI"
                        className="w-full px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Poster Main Title
                      </label>
                      <input
                        type="text"
                        maxLength={50}
                        value={posterData.title}
                        onChange={(e) => setPosterData({ ...posterData, title: e.target.value })}
                        placeholder="e.g. SCAN FOR DIGITAL MENU"
                        className="w-full px-3.5 py-2 text-sm font-extrabold text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Subtitle / Instructions
                      </label>
                      <textarea
                        rows={2}
                        maxLength={160}
                        value={posterData.subtitle}
                        onChange={(e) => setPosterData({ ...posterData, subtitle: e.target.value })}
                        placeholder="e.g. Point your phone camera to view full menu and order directly."
                        className="w-full px-3.5 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Extra Info Label
                        </label>
                        <input
                          type="text"
                          maxLength={30}
                          value={posterData.extraInfoLabel}
                          onChange={(e) => setPosterData({ ...posterData, extraInfoLabel: e.target.value })}
                          placeholder="e.g. NETWORK & PASSWORD"
                          className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Extra Info Details
                        </label>
                        <input
                          type="text"
                          maxLength={70}
                          value={posterData.extraInfoValue}
                          onChange={(e) => setPosterData({ ...posterData, extraInfoValue: e.target.value })}
                          placeholder="e.g. Pass: GuestWifi2026"
                          className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Footer Notice
                      </label>
                      <input
                        type="text"
                        maxLength={70}
                        value={posterData.footerText}
                        onChange={(e) => setPosterData({ ...posterData, footerText: e.target.value })}
                        placeholder="e.g. Compatible with iOS & Android camera scanners"
                        className="w-full px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-xl focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Tab: QR Code Content */}
                {activeTab === 'qr' && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        QR Code Encoded Payload (URL, Wi-Fi or Text)
                      </label>
                      <input
                        type="text"
                        value={posterData.qrPayload}
                        onChange={(e) => setPosterData({ ...posterData, qrPayload: e.target.value })}
                        placeholder="https://yourwebsite.com or WIFI:S:MyWifi;P:pass;;"
                        className="w-full px-3.5 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        QR Callout Label (Underneath QR)
                      </label>
                      <input
                        type="text"
                        maxLength={25}
                        value={posterData.qrLabel}
                        onChange={(e) => setPosterData({ ...posterData, qrLabel: e.target.value.toUpperCase() })}
                        placeholder="e.g. TOUCHLESS MENU or SCAN TO JOIN"
                        className="w-full px-3.5 py-2 text-xs font-bold uppercase text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-indigo-500"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>High error correction (Level H) auto-applied for sharp scanning.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Brand Logo Upload */}
                {activeTab === 'logo' && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="poster-logo-upload"
                    />

                    {posterData.logoDataUrl ? (
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center overflow-hidden">
                            <img
                              src={posterData.logoDataUrl}
                              alt="Poster logo preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                              {posterData.logoName || 'Uploaded Logo'}
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit mt-1">
                              <Check className="w-3 h-3" />
                              <span>Active on Poster</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove logo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => logoInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-800 mb-0.5">
                          Click to Upload Brand Logo
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Supports PNG, JPG, or WebP (max 2 MB). Processed 100% locally.
                        </p>
                      </div>
                    )}

                    {logoError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{logoError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Layout & Alignment */}
                {activeTab === 'layout' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Poster Aspect Ratio & Sizing
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'portrait' as PosterAspectRatio, label: 'Portrait Poster', desc: '1200 × 1600 px (A4 / Flyer)' },
                          { id: 'square' as PosterAspectRatio, label: 'Square Stand', desc: '1200 × 1200 px (Table Tent / Counter)' },
                        ].map((ar) => (
                          <button
                            key={ar.id}
                            type="button"
                            onClick={() => setPosterData({ ...posterData, aspectRatio: ar.id })}
                            className={`p-3 text-left rounded-xl border text-xs cursor-pointer transition-all ${
                              posterData.aspectRatio === ar.id
                                ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 font-bold'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <div>{ar.label}</div>
                            <div className="text-[10px] text-slate-500">{ar.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Card Layout Style
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'classic-card' as PosterLayout, label: 'Classic Card', desc: 'Rounded plate with soft shadow' },
                          { id: 'bold-banner' as PosterLayout, label: 'Bold Banner', desc: 'Contrasting top color bar' },
                          { id: 'table-stand' as PosterLayout, label: 'Table Stand', desc: 'Photo-card style for stands' },
                          { id: 'minimalist' as PosterLayout, label: 'Minimalist Frame', desc: 'Clean fine double border line' },
                        ].map((ly) => (
                          <button
                            key={ly.id}
                            type="button"
                            onClick={() => setPosterData({ ...posterData, layout: ly.id })}
                            className={`p-3 text-left rounded-xl border text-xs cursor-pointer transition-all ${
                              posterData.layout === ly.id
                                ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 font-bold'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <div>{ly.label}</div>
                            <div className="text-[10px] text-slate-500">{ly.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Text & Header Alignment
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'center' as PosterAlignment, label: 'Centered (Recommended)' },
                          { id: 'left' as PosterAlignment, label: 'Left Aligned' },
                        ].map((al) => (
                          <button
                            key={al.id}
                            type="button"
                            onClick={() => setPosterData({ ...posterData, alignment: al.id })}
                            className={`p-2.5 text-center rounded-xl border text-xs cursor-pointer transition-all ${
                              posterData.alignment === al.id
                                ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 font-bold'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            {al.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Colors & Theme */}
                {activeTab === 'colors' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Curated Color Themes
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {POSTER_COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() =>
                              setPosterData({
                                ...posterData,
                                bgColor: preset.bg,
                                cardBg: preset.card,
                                textColor: preset.text,
                                subtitleColor: preset.sub,
                                accentColor: preset.accent,
                                qrFgColor: preset.qrFg,
                              })
                            }
                            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-left text-xs cursor-pointer flex flex-col justify-between"
                          >
                            <span className="font-bold text-[11px] text-slate-800 mb-1 truncate">{preset.label}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: preset.accent }} />
                              <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: preset.bg }} />
                              <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: preset.qrFg }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Poster Background
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={posterData.bgColor}
                            onChange={(e) => setPosterData({ ...posterData, bgColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                          />
                          <input
                            type="text"
                            value={posterData.bgColor}
                            onChange={(e) => setPosterData({ ...posterData, bgColor: e.target.value })}
                            className="w-24 px-2 py-1 text-xs font-mono border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Card Background
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={posterData.cardBg}
                            onChange={(e) => setPosterData({ ...posterData, cardBg: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                          />
                          <input
                            type="text"
                            value={posterData.cardBg}
                            onChange={(e) => setPosterData({ ...posterData, cardBg: e.target.value })}
                            className="w-24 px-2 py-1 text-xs font-mono border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Accent / Badge Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={posterData.accentColor}
                            onChange={(e) => setPosterData({ ...posterData, accentColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                          />
                          <input
                            type="text"
                            value={posterData.accentColor}
                            onChange={(e) => setPosterData({ ...posterData, accentColor: e.target.value })}
                            className="w-24 px-2 py-1 text-xs font-mono border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          QR Foreground Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={posterData.qrFgColor}
                            onChange={(e) => setPosterData({ ...posterData, qrFgColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                          />
                          <input
                            type="text"
                            value={posterData.qrFgColor}
                            onChange={(e) => setPosterData({ ...posterData, qrFgColor: e.target.value })}
                            className="w-24 px-2 py-1 text-xs font-mono border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reset to template defaults */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>All changes apply in real-time to the preview canvas.</span>
                <button
                  type="button"
                  onClick={() => {
                    const currentTmpl = POSTER_TEMPLATES.find((t) => t.id === posterData.templateId) || POSTER_TEMPLATES[0];
                    handleSelectTemplate(currentTmpl);
                  }}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Current Template</span>
                </button>
              </div>

            </div>

            {/* Right Column: Live Poster Canvas Preview & Actions (5 cols sticky) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
              
              <div className="bg-slate-900/5 rounded-3xl p-4 sm:p-5 border border-slate-200 flex flex-col items-center">
                
                <div className="w-full flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Live Poster Preview</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {posterData.aspectRatio === 'portrait' ? '1200 × 1600 px' : '1200 × 1200 px'}
                  </span>
                </div>

                {/* Canvas Container with Frame Mockup */}
                <div className="relative w-full max-w-[380px] aspect-[3/4] max-h-[500px] flex items-center justify-center bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/80 group">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain"
                  />
                  {isRendering && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center text-xs font-semibold text-slate-700">
                      <span>Updating canvas...</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="w-full mt-5 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {downloadSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Downloaded High-Res Poster!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download High-Res Poster (PNG)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Direct from Browser</span>
                  </button>
                </div>

                {/* Printing Tip */}
                <div className="w-full mt-4 p-3 bg-white/80 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Print Recommendation:</span> Export as PNG and print on 200+ GSM cardstock or matte photo paper for acrylic table stands and storefront windows.
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
