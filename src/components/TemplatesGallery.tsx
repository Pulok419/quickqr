import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Eye, SlidersHorizontal } from 'lucide-react';
import { QR_TEMPLATES, QRTemplate } from '../data/templates';

interface TemplatesGalleryProps {
  onSelectTemplate: (template: QRTemplate) => void;
  selectedTemplateId?: string;
}

export const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({
  onSelectTemplate,
  selectedTemplateId,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    'All',
    'Minimal',
    'Business',
    'Restaurant',
    'Gaming',
    'Nature',
    'Gradient',
    'Wedding',
    'Social Media',
  ];

  const filteredTemplates = activeCategory === 'All'
    ? QR_TEMPLATES
    : QR_TEMPLATES.filter((t) => t.category === activeCategory);

  const handleApply = (template: QRTemplate) => {
    onSelectTemplate(template);
    const generatorEl = document.getElementById('generator');
    if (generatorEl) {
      generatorEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="templates" className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200/60 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Ready-Made Design Gallery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Explore Creative QR Design Templates
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
            Choose from professionally styled themes for menus, business cards, weddings, and social channels. Load any template into the studio with one click and customize freely.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-1.5 mb-10 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => {
            const isCurrentlyActive = selectedTemplateId === template.id;

            return (
              <div
                key={template.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Visual Mini Mockup */}
                <div className="p-5 pb-2 bg-gradient-to-b from-slate-50 to-white flex items-center justify-center border-b border-slate-100">
                  <div
                    className="relative w-44 aspect-square rounded-xl bg-white border border-slate-200/80 p-3 shadow-xs flex flex-col items-center justify-between group-hover:scale-105 transition-transform duration-200"
                    style={{ borderColor: template.frameColor + '40' }}
                  >
                    {/* Top banner if active */}
                    {template.frameStyle === 'top-banner' && (
                      <div
                        className="w-full py-0.5 rounded-md text-[9px] font-bold text-center uppercase tracking-wider text-white"
                        style={{ backgroundColor: template.frameColor }}
                      >
                        {template.frameText}
                      </div>
                    )}

                    {/* QR Code Graphic Mockup */}
                    <div className="w-24 h-24 my-auto relative flex items-center justify-center">
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full"
                        fill={template.fgColor}
                      >
                        {/* Finder Top-Left */}
                        <rect x="0" y="0" width="28" height="28" rx="4" />
                        <rect x="5" y="5" width="18" height="18" rx="2" fill="#ffffff" />
                        <rect x="9" y="9" width="10" height="10" rx="2" />
                        
                        {/* Finder Top-Right */}
                        <rect x="72" y="0" width="28" height="28" rx="4" />
                        <rect x="77" y="5" width="18" height="18" rx="2" fill="#ffffff" />
                        <rect x="81" y="9" width="10" height="10" rx="2" />

                        {/* Finder Bottom-Left */}
                        <rect x="0" y="72" width="28" height="28" rx="4" />
                        <rect x="5" y="77" width="18" height="18" rx="2" fill="#ffffff" />
                        <rect x="9" y="81" width="10" height="10" rx="2" />

                        {/* Timing / Modules pattern */}
                        <rect x="36" y="8" width="6" height="6" />
                        <rect x="48" y="8" width="6" height="6" />
                        <rect x="60" y="8" width="6" height="6" />
                        <rect x="36" y="20" width="6" height="6" />
                        <rect x="48" y="20" width="6" height="6" />
                        <rect x="8" y="36" width="6" height="6" />
                        <rect x="8" y="48" width="6" height="6" />
                        <rect x="8" y="60" width="6" height="6" />
                        <rect x="36" y="36" width="12" height="12" rx="2" />
                        <rect x="54" y="36" width="8" height="8" rx="1" />
                        <rect x="72" y="36" width="6" height="6" />
                        <rect x="84" y="36" width="10" height="6" />
                        <rect x="36" y="54" width="8" height="16" rx="2" />
                        <rect x="50" y="54" width="12" height="8" rx="2" />
                        <rect x="68" y="54" width="8" height="8" />
                        <rect x="82" y="54" width="12" height="12" rx="2" />
                        <rect x="36" y="76" width="12" height="8" />
                        <rect x="54" y="76" width="10" height="16" rx="2" />
                        <rect x="70" y="76" width="10" height="8" />
                        <rect x="86" y="76" width="8" height="16" />
                      </svg>
                    </div>

                    {/* Bottom banner if active */}
                    {template.frameStyle === 'bottom-banner' && (
                      <div
                        className="w-full py-0.5 rounded-md text-[9px] font-bold text-center uppercase tracking-wider text-white"
                        style={{ backgroundColor: template.frameColor }}
                      >
                        {template.frameText}
                      </div>
                    )}

                    {/* Polaroid text if active */}
                    {template.frameStyle === 'card-frame' && (
                      <div
                        className="w-full text-[9px] font-bold text-center uppercase tracking-wider pt-0.5 truncate"
                        style={{ color: template.frameColor }}
                      >
                        {template.frameText}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        {template.badgeLabel}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: template.fgColor }}
                          title={`Color: ${template.fgColor}`}
                        />
                        {template.frameStyle !== 'none' && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: template.frameColor }}
                            title={`Banner: ${template.frameColor}`}
                          />
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mb-2">
                      {template.tagline}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
                      {template.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApply(template)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isCurrentlyActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200/80 hover:border-blue-600'
                    }`}
                  >
                    {isCurrentlyActive ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active in Studio</span>
                      </>
                    ) : (
                      <>
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Apply & Customize</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gallery bottom footnote */}
        <div className="mt-10 p-4 bg-white rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All templates run 100% locally in your browser. Fully customizable after applying.</span>
          </div>
          <a
            href="#generator"
            className="font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
          >
            Go to Generator Studio ↑
          </a>
        </div>

      </div>
    </section>
  );
};
