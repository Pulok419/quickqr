import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  QRType,
  UrlFormData,
  TextFormData,
  WifiFormData,
  EmailFormData,
  PhoneFormData,
  SmsFormData,
  QRStyleOptions,
} from '../../types/qr';
import { formatQRData, generateQRPng, generateQRSvg } from '../../utils/qrFormatter';
import { TabSelector } from './TabSelector';
import { StyleCustomizer } from './StyleCustomizer';
import { QRPreview } from './QRPreview';
import { UrlForm } from './InputForms/UrlForm';
import { TextForm } from './InputForms/TextForm';
import { WifiForm } from './InputForms/WifiForm';
import { EmailForm } from './InputForms/EmailForm';
import { PhoneForm } from './InputForms/PhoneForm';
import { SmsForm } from './InputForms/SmsForm';

interface AllFormData {
  url: UrlFormData;
  text: TextFormData;
  wifi: WifiFormData;
  email: EmailFormData;
  phone: PhoneFormData;
  sms: SmsFormData;
}

const defaultStyles: QRStyleOptions = {
  designStyle: 'minimal',
  presetTheme: 'minimal',
  fgColor: '#000000',
  bgColor: '#ffffff',
  isTransparentBg: false,
  size: 512,
  errorCorrection: 'M',
  margin: 2,
  logo: null,
  frameStyle: 'none',
  frameText: 'SCAN ME',
  frameColor: '#2563eb',
  frameTextColor: '#ffffff',
};

const initialFormData: AllFormData = {
  url: { url: 'https://quickqr.app' },
  text: { text: 'Welcome to QuickQR! Scan to read this private client-side message.' },
  wifi: { ssid: 'QuickQR_Guest', password: 'FreeWifiPassword2026', encryption: 'WPA', hidden: false },
  email: { email: 'hello@quickqr.app', subject: 'QuickQR Inquiry', body: 'Hi, I created this QR code using QuickQR!' },
  phone: { phone: '+1 800 555 0199' },
  sms: { phone: '+1 800 555 0199', message: 'Hello! I scanned your QuickQR code.' },
};

export const QRGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<QRType>('url');
  const [formData, setFormData] = useState<AllFormData>(initialFormData);
  const [styles, setStyles] = useState<QRStyleOptions>(defaultStyles);

  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [svgString, setSvgString] = useState<string>('');
  const [payload, setPayload] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [justGenerated, setJustGenerated] = useState<boolean>(false);

  // Manual trigger when user clicks "Generate QR Code"
  const handleManualGenerate = async () => {
    await updateQR();
    setJustGenerated(true);
    setTimeout(() => {
      setJustGenerated(false);
    }, 2000);

    // If mobile, smooth scroll to preview
    if (window.innerWidth < 1024) {
      const previewEl = document.getElementById('qr-preview-card');
      if (previewEl) {
        previewEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // Clear current active tab input
  const handleClearCurrent = () => {
    setFormData((prev) => ({
      ...prev,
      [activeTab]:
        activeTab === 'url'
          ? { url: '' }
          : activeTab === 'text'
          ? { text: '' }
          : activeTab === 'wifi'
          ? { ssid: '', password: '', encryption: 'WPA', hidden: false }
          : activeTab === 'email'
          ? { email: '', subject: '', body: '' }
          : activeTab === 'phone'
          ? { phone: '' }
          : { phone: '', message: '' },
    }));
  };

  // Reset everything to default demo
  const handleResetAll = () => {
    setFormData(initialFormData);
    setStyles(defaultStyles);
  };

  // Trigger live QR generation
  const updateQR = useCallback(async () => {
    const formatResult = formatQRData(activeTab, formData);
    setPayload(formatResult.payload);
    setIsValid(formatResult.isValid);
    setErrorMessage(formatResult.errorMessage);

    if (!formatResult.isValid || !formatResult.payload) {
      setPngDataUrl('');
      setSvgString('');
      return;
    }

    setIsGenerating(true);
    try {
      const [png, svg] = await Promise.all([
        generateQRPng(formatResult.payload, styles),
        generateQRSvg(formatResult.payload, styles),
      ]);
      setPngDataUrl(png);
      setSvgString(svg);
    } catch (err: unknown) {
      console.error('QR Generation failed:', err);
      setIsValid(false);
      setErrorMessage('The data payload is too large or contains unsupported characters for this error correction level.');
    } finally {
      setIsGenerating(false);
    }
  }, [activeTab, formData, styles]);

  useEffect(() => {
    updateQR();
  }, [updateQR]);

  const tabLabels: Record<QRType, string> = {
    url: 'URL',
    text: 'Text',
    wifi: 'WiFi',
    email: 'Email',
    phone: 'Phone',
    sms: 'SMS',
  };

  return (
    <section id="generator" className="py-12 sm:py-16 bg-gradient-to-b from-white via-slate-50/50 to-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Instant In-Browser QR Code Studio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Generate Custom, Permanent QR Codes for Free
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
            Select a QR format below, customize colors, adjust size, and download high-resolution PNG or vector SVG graphics in seconds.
          </p>
        </div>

        {/* Studio Workspace Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-7 lg:p-8">
          
          {/* Top Bar: Tabs + Clear/Reset Actions */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="flex-1">
              <TabSelector activeTab={activeTab} onSelectTab={setActiveTab} />
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearCurrent}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Clear input fields for this tab"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear</span>
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Reset all settings to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset All</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Inputs + Styling (Left) vs Live Preview (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form inputs & Styles (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Form Input Area */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Step 1: Fill in {tabLabels[activeTab]} Content
                  </span>
                  {isValid && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Valid Payload</span>
                    </span>
                  )}
                </div>

                {activeTab === 'url' && (
                  <UrlForm
                    data={formData.url}
                    onChange={(urlData) => setFormData((prev) => ({ ...prev, url: urlData }))}
                    error={!isValid ? errorMessage : undefined}
                  />
                )}

                {activeTab === 'text' && (
                  <TextForm
                    data={formData.text}
                    onChange={(textData) => setFormData((prev) => ({ ...prev, text: textData }))}
                    error={!isValid ? errorMessage : undefined}
                  />
                )}

                {activeTab === 'wifi' && (
                  <WifiForm
                    data={formData.wifi}
                    onChange={(wifiData) => setFormData((prev) => ({ ...prev, wifi: wifiData }))}
                    error={!isValid ? errorMessage : undefined}
                  />
                )}

                {activeTab === 'email' && (
                  <EmailForm
                    data={formData.email}
                    onChange={(emailData) => setFormData((prev) => ({ ...prev, email: emailData }))}
                    error={!isValid ? errorMessage : undefined}
                  />
                )}

                {activeTab === 'phone' && (
                  <PhoneForm
                    data={formData.phone}
                    onChange={(phoneData) => setFormData((prev) => ({ ...prev, phone: phoneData }))}
                    error={!isValid ? errorMessage : undefined}
                  />
                )}

                {activeTab === 'sms' && (
                  <SmsForm
                    data={formData.sms}
                    onChange={(smsData) => setFormData((prev) => ({ ...prev, sms: smsData }))}
                    error={!isValid ? errorMessage : undefined}
                  />
                )}

                {/* Primary Generate Button Bar */}
                <div className="mt-5 pt-4 border-t border-slate-200/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Live real-time preview active — codes generate as you type.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualGenerate}
                    disabled={!isValid || isGenerating}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{justGenerated ? 'Generated Successfully!' : 'Generate QR Code'}</span>
                  </button>
                </div>
              </div>

              {/* Style & Configuration Panel */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2 px-1">
                  Step 2: Customize Appearance & Format
                </span>
                <StyleCustomizer
                  options={styles}
                  onChange={setStyles}
                  onReset={() => setStyles(defaultStyles)}
                />
              </div>

            </div>

            {/* Right Column: Live Preview & Downloads (5 cols sticky) */}
            <div id="qr-preview-card" className="lg:col-span-5 lg:sticky lg:top-24">
              <QRPreview
                pngDataUrl={pngDataUrl}
                svgString={svgString}
                payload={payload}
                isValid={isValid}
                errorMessage={errorMessage}
                options={styles}
                activeTabName={tabLabels[activeTab]}
                justGenerated={justGenerated}
                onRegenerate={handleManualGenerate}
              />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
