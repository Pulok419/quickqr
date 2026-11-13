import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  Download,
  FileArchive,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Link as LinkIcon,
  Edit3,
  ListChecks,
  Check,
} from 'lucide-react';
import { ErrorCorrectionLevel } from '../../types/qr';
import {
  BulkValidationMode,
  BulkStyleConfig,
  BulkGeneratedItem,
  parseAndValidateBulkLines,
  generateSingleBulkQR,
  downloadSingleBulkPng,
  downloadBulkQrZip,
} from '../../utils/bulkQr';

const SAMPLE_ENTRIES = `https://quickqr.app | homepage
https://quickqr.app/menu | restaurant-menu
https://quickqr.app/promo | flash-sale-2026`;

export const BulkQRCreator: React.FC = () => {
  const [rawInput, setRawInput] = useState<string>(SAMPLE_ENTRIES);
  const [validationMode, setValidationMode] = useState<BulkValidationMode>('urls');
  const [allowPipeFilenames, setAllowPipeFilenames] = useState<boolean>(true);

  const [styleConfig, setStyleConfig] = useState<BulkStyleConfig>({
    size: 512,
    fgColor: '#000000',
    bgColor: '#ffffff',
    errorCorrection: 'M',
    margin: 2,
    filenamePrefix: '',
  });

  const [zipFilename, setZipFilename] = useState<string>('quickqr-bulk-codes');
  const [generatedItems, setGeneratedItems] = useState<BulkGeneratedItem[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [zipSuccess, setZipSuccess] = useState<boolean>(false);

  // Live line parsing and validation
  const validation = useMemo(() => {
    return parseAndValidateBulkLines(
      rawInput,
      validationMode,
      styleConfig.filenamePrefix,
      allowPipeFilenames
    );
  }, [rawInput, validationMode, styleConfig.filenamePrefix, allowPipeFilenames]);

  // Batch limit check
  const maxBatchLimit = 200;
  const exceedsLimit = validation.validEntries.length > maxBatchLimit;

  const handleGenerateBulk = async () => {
    setGenerationError(null);
    setZipSuccess(false);

    if (!rawInput.trim()) {
      setGenerationError('Input is empty. Please paste at least one URL or text entry (one per line).');
      setGeneratedItems([]);
      return;
    }

    if (validation.validEntries.length === 0) {
      setGenerationError(
        validation.invalidEntries.length > 0
          ? 'All entered lines failed validation. Fix the highlighted lines or switch to "Mixed Text & URLs" mode.'
          : 'No valid entries found to generate.'
      );
      setGeneratedItems([]);
      return;
    }

    if (exceedsLimit) {
      setGenerationError(
        `You entered ${validation.validEntries.length} valid lines. Please limit each batch to ${maxBatchLimit} QR codes for smooth in-browser ZIP packaging.`
      );
      return;
    }

    setIsGenerating(true);
    try {
      const results: BulkGeneratedItem[] = await Promise.all(
        validation.validEntries.map(async (entry, idx) => {
          const pngDataUrl = await generateSingleBulkQR(entry.content, styleConfig);
          return {
            id: `bulk-${entry.lineNumber}-${idx}-${Date.now()}`,
            lineNumber: entry.lineNumber,
            content: entry.content,
            filename: entry.suggestedFilename,
            pngDataUrl,
          };
        })
      );
      setGeneratedItems(results);
    } catch (err) {
      console.error('Bulk QR generation error:', err);
      setGenerationError('Failed to generate one or more QR codes. Check entry lengths and colors.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateItemFilename = (id: string, newFilename: string) => {
    setGeneratedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, filename: newFilename } : item))
    );
  };

  const handlePrefixChange = (prefix: string) => {
    setStyleConfig((prev) => ({ ...prev, filenamePrefix: prefix }));
  };

  const handleDownloadZip = async () => {
    if (generatedItems.length === 0) return;
    setGenerationError(null);
    setIsZipping(true);
    try {
      await downloadBulkQrZip(generatedItems, zipFilename);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error('ZIP creation failed:', err);
      setGenerationError('Unable to create ZIP archive in browser. Try downloading individual PNGs.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleClear = () => {
    setRawInput('');
    setGeneratedItems([]);
    setGenerationError(null);
    setZipSuccess(false);
  };

  const handleLoadSample = () => {
    setRawInput(SAMPLE_ENTRIES);
    setValidationMode('urls');
    setGenerationError(null);
  };

  return (
    <section
      id="bulk-creator"
      className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-100 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 mb-3">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Batch QR Engine • 100% Client-Side</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Bulk QR Code Creator &amp; ZIP Exporter
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
            Paste multiple URLs or text entries (one per line) to batch-generate QR codes with custom filenames. Preview every item and download individual PNGs or all codes in a single ZIP archive.
          </p>
        </div>

        {/* Main Studio Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-7 lg:p-8 space-y-8">
          {/* Configuration & Input Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Multiline Input & Validation */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label
                  htmlFor="bulk-qr-textarea"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
                >
                  <ListChecks className="w-4 h-4 text-blue-600" />
                  <span>1. Paste Entries (One Per Line)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Load Sample
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Validation Mode Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setValidationMode('urls')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      validationMode === 'urls'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>URLs Only (Strict)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValidationMode('mixed')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      validationMode === 'mixed'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>Text &amp; Mixed</span>
                  </button>
                </div>

                <label className="flex items-center gap-1.5 text-xs text-slate-600 pr-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowPipeFilenames}
                    onChange={(e) => setAllowPipeFilenames(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300"
                  />
                  <span>Support <code className="font-mono text-[11px] bg-white px-1 rounded">entry | filename</code></span>
                </label>
              </div>

              {/* Multiline Textarea */}
              <textarea
                id="bulk-qr-textarea"
                rows={8}
                value={rawInput}
                onChange={(e) => {
                  setRawInput(e.target.value);
                  setGenerationError(null);
                }}
                placeholder={
                  validationMode === 'urls'
                    ? 'https://example.com | homepage\nhttps://example.com/pricing | pricing-page\nhttps://example.com/contact'
                    : 'Welcome to QuickQR\nWIFI:S:Guest;T:WPA;P:Pass123;; | guest-wifi\nhttps://example.com | website'
                }
                className="w-full p-4 text-xs sm:text-sm font-mono text-slate-900 bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all outline-none resize-y leading-relaxed"
              />

              {/* Live Validation Summary */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{validation.validEntries.length} valid</span>
                  </span>

                  {validation.invalidEntries.length > 0 && (
                    <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{validation.invalidEntries.length} invalid</span>
                    </span>
                  )}

                  {validation.emptyLineCount > 0 && (
                    <span className="text-slate-500">
                      ({validation.emptyLineCount} empty {validation.emptyLineCount === 1 ? 'line' : 'lines'} skipped)
                    </span>
                  )}
                </div>

                <span className="text-slate-400">Max {maxBatchLimit} per batch</span>
              </div>

              {/* Detailed Line Validation Errors */}
              {validation.invalidEntries.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 space-y-1.5 text-xs text-amber-950">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {validation.invalidEntries.length} invalid{' '}
                      {validation.invalidEntries.length === 1 ? 'entry' : 'entries'} detected (will be skipped):
                    </span>
                  </div>
                  <ul className="space-y-1 max-h-28 overflow-y-auto pl-5 list-disc text-[11px] text-amber-900">
                    {validation.invalidEntries.slice(0, 10).map((item) => (
                      <li key={item.lineNumber}>
                        <span className="font-bold">Line {item.lineNumber}:</span>{' '}
                        <span className="font-mono bg-amber-100/80 px-1 rounded">
                          {item.rawLine.trim().slice(0, 40)}
                          {item.rawLine.trim().length > 40 ? '...' : ''}
                        </span>{' '}
                        — {item.error}
                      </li>
                    ))}
                    {validation.invalidEntries.length > 10 && (
                      <li className="font-semibold">
                        ...and {validation.invalidEntries.length - 10} more invalid lines.
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {generationError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-900 font-medium">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{generationError}</span>
                </div>
              )}
            </div>

            {/* Right 5 Columns: Batch Style & Generate Controls */}
            <div className="lg:col-span-5 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="pb-3 border-b border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Batch Output Settings
                </span>
              </div>

              {/* Filename Prefix */}
              <div>
                <label
                  htmlFor="bulk-prefix-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                >
                  Custom Filename Prefix (Optional)
                </label>
                <input
                  id="bulk-prefix-input"
                  type="text"
                  maxLength={30}
                  value={styleConfig.filenamePrefix}
                  onChange={(e) => handlePrefixChange(e.target.value)}
                  placeholder="e.g. promo-2026"
                  className="w-full px-3.5 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  You can also rename every individual file below after generating.
                </p>
              </div>

              {/* Resolution */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  PNG Image Resolution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[256, 512, 1024].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setStyleConfig({ ...styleConfig, size: sz })}
                      className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        styleConfig.size === sz
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {sz} × {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    QR Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styleConfig.fgColor}
                      onChange={(e) => setStyleConfig({ ...styleConfig, fgColor: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      maxLength={7}
                      value={styleConfig.fgColor}
                      onChange={(e) => setStyleConfig({ ...styleConfig, fgColor: e.target.value })}
                      className="w-24 px-2.5 py-1.5 text-xs font-mono text-slate-800 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styleConfig.bgColor}
                      onChange={(e) => setStyleConfig({ ...styleConfig, bgColor: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      maxLength={7}
                      value={styleConfig.bgColor}
                      onChange={(e) => setStyleConfig({ ...styleConfig, bgColor: e.target.value })}
                      className="w-24 px-2.5 py-1.5 text-xs font-mono text-slate-800 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Error Correction */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Error Correction Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((ecc) => (
                    <button
                      key={ecc}
                      type="button"
                      onClick={() => setStyleConfig({ ...styleConfig, errorCorrection: ecc })}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        styleConfig.errorCorrection === ecc
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {ecc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Batch Button */}
              <button
                type="button"
                disabled={isGenerating || exceedsLimit}
                onClick={handleGenerateBulk}
                className="w-full py-3.5 px-5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isGenerating
                    ? 'Generating QR Codes...'
                    : `Generate ${validation.validEntries.length || ''} QR ${
                        validation.validEntries.length === 1 ? 'Code' : 'Codes'
                      }`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>All PNG &amp; ZIP generation runs 100% locally in your browser.</span>
              </div>
            </div>
          </div>

          {/* Generated Results Preview & ZIP Download Bar */}
          {generatedItems.length > 0 && (
            <div className="pt-8 border-t border-slate-200/80 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-blue-50/70 via-indigo-50/60 to-purple-50/70 border border-blue-200/70 rounded-2xl">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>
                      {generatedItems.length} QR {generatedItems.length === 1 ? 'Code' : 'Codes'} Generated
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Edit any filename below before downloading individual PNG files or bundling all into a ZIP.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs">
                    <input
                      type="text"
                      value={zipFilename}
                      onChange={(e) => setZipFilename(e.target.value)}
                      placeholder="quickqr-bulk-codes"
                      aria-label="ZIP archive filename"
                      className="w-36 font-mono text-slate-800 outline-none bg-transparent"
                    />
                    <span className="text-slate-400 font-mono">.zip</span>
                  </div>

                  <button
                    type="button"
                    disabled={isZipping}
                    onClick={handleDownloadZip}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  >
                    {zipSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>ZIP Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <FileArchive className="w-4 h-4 text-blue-300" />
                        <span>{isZipping ? 'Creating ZIP...' : `Download All (${generatedItems.length}) ZIP`}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Preview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {generatedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Line #{item.lineNumber}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {styleConfig.size}px PNG
                        </span>
                      </div>

                      {/* QR Preview Thumbnail */}
                      <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex items-center justify-center mb-3">
                        <img
                          src={item.pngDataUrl}
                          alt={`QR code for ${item.filename}`}
                          className="w-36 h-36 object-contain rounded-lg"
                        />
                      </div>

                      {/* Encoded Content */}
                      <p
                        className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 line-clamp-2 break-all mb-3"
                        title={item.content}
                      >
                        {item.content}
                      </p>

                      {/* Editable Custom Filename */}
                      <div>
                        <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          <Edit3 className="w-3 h-3" />
                          <span>Custom Filename</span>
                        </label>
                        <div className="flex items-center bg-slate-50 focus-within:bg-white border border-slate-200 focus-within:border-blue-500 rounded-xl px-2.5 py-1.5 text-xs transition-colors">
                          <input
                            type="text"
                            value={item.filename}
                            onChange={(e) => handleUpdateItemFilename(item.id, e.target.value)}
                            className="w-full font-mono text-slate-900 bg-transparent outline-none"
                            aria-label={`Custom filename for line ${item.lineNumber}`}
                          />
                          <span className="text-slate-400 font-mono text-[11px] shrink-0 pl-1">
                            .png
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Individual PNG Download */}
                    <button
                      type="button"
                      onClick={() => downloadSingleBulkPng(item)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200/80 hover:border-blue-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
