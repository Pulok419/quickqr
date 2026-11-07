import React, { useState } from 'react';
import {
  Download,
  Copy,
  Printer,
  Check,
  Code2,
  Scan,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { QRStyleOptions } from '../../types/qr';
import { downloadFile } from '../../utils/qrFormatter';

interface QRPreviewProps {
  pngDataUrl: string;
  svgString: string;
  payload: string;
  isValid: boolean;
  errorMessage?: string;
  options: QRStyleOptions;
  activeTabName: string;
  justGenerated?: boolean;
  onRegenerate?: () => void;
}

export const QRPreview: React.FC<QRPreviewProps> = ({
  pngDataUrl,
  svgString,
  payload,
  isValid,
  errorMessage,
  options,
  activeTabName,
  justGenerated,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  // Download PNG handler
  const handleDownloadPng = () => {
    if (!pngDataUrl || !isValid) return;
    const frameSuffix = options.frameStyle && options.frameStyle !== 'none' ? `-${options.frameStyle}` : '';
    const logoSuffix = options.logo ? '-with-logo' : '';
    const filename = `quickqr-${activeTabName.toLowerCase()}${frameSuffix}${logoSuffix}-${options.size}px.png`;
    downloadFile(pngDataUrl, filename, true);
  };

  // Download SVG handler
  const handleDownloadSvg = () => {
    if (!svgString || !isValid) return;
    const frameSuffix = options.frameStyle && options.frameStyle !== 'none' ? `-${options.frameStyle}` : '';
    const logoSuffix = options.logo ? '-with-logo' : '';
    const filename = `quickqr-${activeTabName.toLowerCase()}${frameSuffix}${logoSuffix}-vector.svg`;
    downloadFile(svgString, filename, false);
  };

  // Copy to clipboard handler
  const handleCopy = async () => {
    if (!pngDataUrl || !isValid) return;
    try {
      // Try copying PNG blob to clipboard
      const res = await fetch(pngDataUrl);
      const blob = await res.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      }
    } catch {
      // Fallback: copy payload text
    }

    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // unable to copy
    }
  };

  // Print QR Code
  const handlePrint = () => {
    if (!pngDataUrl || !isValid) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - QuickQR</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              font-family: system-ui, sans-serif;
              color: #0f172a;
              text-align: center;
              margin: 0;
              padding: 20px;
            }
            img {
              max-width: 320px;
              height: auto;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              background: white;
            }
            h2 {
              margin: 16px 0 6px 0;
              font-size: 20px;
            }
            p {
              margin: 4px 0 0 0;
              font-size: 13px;
              color: #64748b;
              max-width: 360px;
              word-break: break-all;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <img src="${pngDataUrl}" alt="QR Code" />
          <h2>QuickQR Code</h2>
          <p>${payload}</p>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 tracking-tight">Live QR Preview</span>
            {options.logo && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>Logo</span>
              </span>
            )}
            {options.frameStyle && options.frameStyle !== 'none' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md">
                <span>Framed</span>
              </span>
            )}
            {justGenerated ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md animate-in fade-in duration-200">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Generated Just Now</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Ready to Scan</span>
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {options.size}×{options.size}px
          </span>
        </div>

        {/* QR Canvas / Preview Box */}
        <div className="relative aspect-square max-w-[320px] mx-auto w-full bg-slate-50/70 rounded-2xl border border-slate-200/70 p-6 flex flex-col items-center justify-center overflow-hidden transition-all">
          {isValid && pngDataUrl ? (
            <div className="relative group flex items-center justify-center w-full h-full">
              <img
                src={pngDataUrl}
                alt="Generated QR Code preview"
                className="max-h-full max-w-full object-contain rounded-lg shadow-xs transition-transform duration-200 group-hover:scale-[1.02]"
              />
              <div className="absolute bottom-1 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 shadow-xs flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-blue-600" />
                <span>Scan with your phone camera</span>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Scan className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700">QR Code Preview</h4>
              <p className="text-xs text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                {errorMessage || 'Enter content on the left to see your instant live QR code preview.'}
              </p>
            </div>
          )}
        </div>

        {/* Camera action detect preview */}
        {isValid && payload && (
          <div className="mt-3.5 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-700 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-semibold text-slate-900 block mb-0.5">
                Camera Detection Action:
              </span>
              <span className="text-slate-600">
                {activeTabName === 'URL' && 'Tapping the camera scan prompt will open your URL in the browser.'}
                {activeTabName === 'WiFi' && 'Scanning prompts the phone to connect directly to the Wi-Fi network.'}
                {activeTabName === 'Email' && 'Scanning pre-fills an email message in the default mail app.'}
                {activeTabName === 'Phone' && 'Scanning prompts 1-tap phone dialing on smartphones.'}
                {activeTabName === 'SMS' && 'Scanning opens the SMS messaging app with pre-filled text.'}
                {activeTabName === 'Text' && 'Scanning decodes and displays the plain text message on screen.'}
              </span>
            </div>
          </div>
        )}

        {/* Payload inspector toggle */}
        {isValid && payload && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowPayload(!showPayload)}
              className="text-xs font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showPayload ? 'Hide encoded payload' : 'Inspect encoded payload'}</span>
            </button>
            {showPayload && (
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 break-all select-all">
                {payload}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Download PNG */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={!isValid || !pngDataUrl}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          {/* Download SVG */}
          <button
            type="button"
            onClick={handleDownloadSvg}
            disabled={!isValid || !svgString}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-purple-700 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
            title="Scalable Vector Graphics for infinite resolution printing"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>Download SVG</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Copy to clipboard */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!isValid || !pngDataUrl}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={!isValid || !pngDataUrl}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print QR Code</span>
          </button>
        </div>

        {/* Logo download format advice */}
        {options.logo && (
          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span>PNG download provides the highest pixel fidelity with the centered logo badge. SVG download includes the vector QR modules with an embedded logo overlay.</span>
            </div>
          </div>
        )}

        {/* Client side privacy note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Generated 100% locally in your browser. Zero tracking.</span>
        </div>
      </div>
    </div>
  );
};
