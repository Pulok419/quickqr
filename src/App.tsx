/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { QRGenerator } from './components/QRGenerator/QRGenerator';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { WhyQuickQR } from './components/WhyQuickQR';
import { FAQ } from './components/FAQ';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { TemplatesGallery } from './components/TemplatesGallery';
import { PosterMaker } from './components/PosterMaker/PosterMaker';
import { QRScanner } from './components/QRScanner/QRScanner';
import { BulkQRCreator } from './components/BulkQR/BulkQRCreator';
import { QRTemplate } from './data/templates';
import { Footer } from './components/Footer';
import { PrivacyModal } from './components/PrivacyModal';

export default function App() {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [appliedTemplate, setAppliedTemplate] = useState<QRTemplate | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('minimal');

  const handleOpenContact = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectTemplate = (template: QRTemplate) => {
    setAppliedTemplate(template);
    setActiveTemplateId(template.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Header */}
      <Header
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
        onOpenContact={handleOpenContact}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Core QR Code Generator Tool */}
        <QRGenerator
          externalTemplate={appliedTemplate}
          onTemplateApplied={() => setAppliedTemplate(null)}
          onSelectTemplateId={(id) => setActiveTemplateId(id)}
        />

        {/* Ready-Made QR Design Templates Gallery */}
        <TemplatesGallery
          onSelectTemplate={handleSelectTemplate}
          selectedTemplateId={activeTemplateId}
        />

        {/* QR Poster Maker & Table Stand Studio */}
        <PosterMaker />

        {/* QR Code Scanner & Inspector */}
        <QRScanner />

        {/* Bulk QR Code Creator & ZIP Exporter */}
        <BulkQRCreator />

        {/* How QuickQR Works */}
        <HowItWorks />

        {/* Key Features & Formats */}
        <Features />

        {/* Why Choose QuickQR (Comparison Matrix) */}
        <WhyQuickQR />

        {/* Frequently Asked Questions */}
        <FAQ />

        {/* About QuickQR */}
        <AboutSection />

        {/* Contact & Feedback */}
        <ContactSection />
      </main>

      {/* Global Semantic Footer */}
      <Footer
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
        onOpenContact={handleOpenContact}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
}
