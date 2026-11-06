import React from 'react';
import {
  FileCode,
  Shield,
  Layers,
  Sparkles,
  Smartphone,
  EyeOff,
  Palette,
  CheckCircle,
} from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 block mb-2">
            Engineered For Reliability
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Features Built for Everyday & Commercial Use
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Everything you need for clean, durable, scannable QR codes without subscription paywalls or hidden limitations.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Vector SVG (Col span 2 on lg) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-7 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Vector SVG & Ultra HD PNG Downloads
                </h3>
                <span className="text-xs text-slate-500">Perfect for professional print and digital publishing</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Export standard raster PNGs up to 2048×2048px or clean, infinite-resolution vector SVG files. Open directly in Adobe Illustrator, Figma, or send to commercial printing presses for posters, vinyl banners, and restaurant signage without pixelation.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono">.SVG Vector</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono">.PNG 300+ DPI</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg">CMYK & RGB Ready</span>
            </div>
          </div>

          {/* Card 2: 100% Client-Side Privacy */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              100% In-Browser Privacy
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              All encoding algorithms execute entirely in your local browser sandbox. Sensitive data like Wi-Fi passwords, private links, and emails are never sent across the internet.
            </p>
          </div>

          {/* Card 3: 6 Universal Standard Formats */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              6 Universal Standard Formats
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Support for web URLs, Wi-Fi networks (WPA/WEP/Open), plain text, email mailto protocols, telephone dialers, and SMS messaging with pre-composed text.
            </p>
          </div>

          {/* Card 4: Permanent & Direct */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Permanent Static QR Codes
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your destination data is embedded directly into the physical matrix. Unlike commercial platforms, there is no intermediate redirect server that could shut down or expire your code.
            </p>
          </div>

          {/* Card 5: Error Correction (Col span 1) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              ISO Error Correction (7% to 30%)
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Select from Low (7%), Medium (15%), Quartile (25%), or High (30%) Reed-Solomon error correction to keep codes scannable even if partly scratched or covered.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
