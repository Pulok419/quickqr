import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Do QR codes generated with QuickQR ever expire?',
      answer:
        'No, never. QuickQR creates static QR codes where your data (the URL, text, Wi-Fi password, or phone number) is encoded directly into the pattern of black and white squares. Because there are no intermediate redirect servers or tracking links, your QR codes will remain scannable indefinitely for the life of the printed material.',
    },
    {
      question: 'Is it safe to generate Wi-Fi QR codes with my private password?',
      answer:
        'Yes, 100% safe. QuickQR performs all cryptographic and matrix operations directly inside your web browser using JavaScript. No passwords, text, or destination URLs are ever uploaded to a server or stored in a database. You can even disconnect your internet after loading the page and the generator will continue working offline.',
    },
    {
      question: 'What is the difference between PNG and SVG downloads?',
      answer:
        'PNG is a standard raster image format with fixed pixel dimensions (e.g., 512px or 2048px), ideal for websites, email signatures, presentation slides, and digital displays. SVG (Scalable Vector Graphics) is a mathematical vector format that scales infinitely without pixelation or blurriness, making it the preferred format for professional graphic designers, Figma, Adobe Illustrator, and commercial print shops.',
    },
    {
      question: 'Which Error Correction Level (L, M, Q, H) should I choose?',
      answer:
        'Level L (7% recovery) yields the cleanest, least dense pattern, ideal for display on digital screens. Level M (15% recovery) is the recommended industry standard for most everyday print applications. Level Q (25%) and Level H (30%) provide heavy damage resilience, ensuring the QR code remains readable even if printed on textured paper, placed on outdoor signage subject to weathering, or partially obscured by a logo.',
    },
    {
      question: 'What is the minimum physical print size for a scannable QR code?',
      answer:
        'For standard smartphone cameras scanning at a normal arm’s length (approx. 20–30 cm), we recommend a minimum physical printed size of 2 × 2 cm (0.8 × 0.8 inches). For posters, outdoor billboards, or exhibition banners where people will scan from several meters away, calculate size using the 10:1 ratio: a QR code intended to be scanned from 2 meters away should be at least 20 × 20 cm in size.',
    },
    {
      question: 'Can I use QuickQR for commercial and client projects?',
      answer:
        'Yes. All QR codes created on QuickQR are 100% royalty-free and can be used for commercial merchandise, restaurant menus, product packaging, marketing brochures, client websites, and public events without attribution or licensing fees.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-100 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 block mb-2">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Everything you need to know about QR technology, printing guidelines, and privacy.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition-all duration-200 shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full py-4.5 px-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-slate-900">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
