import { PosterData, PosterTheme } from '../types/poster';

export interface PosterTemplateDefinition {
  id: string;
  name: string;
  category: 'restaurant' | 'business' | 'event' | 'wifi';
  tagline: string;
  description: string;
  badgeLabel: string;
  defaultData: PosterData;
}

export const POSTER_TEMPLATES: PosterTemplateDefinition[] = [
  {
    id: 'restaurant-menu',
    name: 'Bistro Digital Menu',
    category: 'restaurant',
    tagline: 'Table Stand & Counter Flyer',
    description: 'Warm terracotta tones with clean culinary badge. Designed for restaurant table tents, cafe counters, and bar QR ordering.',
    badgeLabel: 'Restaurant & Dining',
    defaultData: {
      templateId: 'restaurant-menu',
      category: 'restaurant',
      layout: 'table-stand',
      alignment: 'center',
      aspectRatio: 'portrait',
      badgeText: 'TABLE TOP MENU',
      title: 'SCAN FOR DIGITAL MENU',
      subtitle: 'Browse our seasonal food specials, wine list, and place orders directly from your phone.',
      extraInfoLabel: 'HOURS & SPECIALS',
      extraInfoValue: 'Open Daily 11:30 AM – 10:30 PM • Ask server for allergy-friendly options',
      footerText: 'No app download needed • Point your smartphone camera at the code',
      qrPayload: 'https://quickqr.app/menu',
      qrLabel: 'TOUCHLESS MENU',
      bgColor: '#fff7ed', // warm amber-50
      cardBg: '#ffffff',
      textColor: '#1c1917',
      subtitleColor: '#78716c',
      accentColor: '#c2410c', // terracotta orange-700
      qrFgColor: '#9a3412',
      qrBgColor: '#ffffff',
      logoDataUrl: null,
      logoName: null,
    },
  },
  {
    id: 'business-promo',
    name: 'Retail Flash Promotion',
    category: 'business',
    tagline: 'Store Window & Checkout Stand',
    description: 'Electric cobalt and indigo accents with high-conversion discount callout. Perfect for retail sales, coupons, and client onboarding.',
    badgeLabel: 'Business & Retail',
    defaultData: {
      templateId: 'business-promo',
      category: 'business',
      layout: 'bold-banner',
      alignment: 'center',
      aspectRatio: 'portrait',
      badgeText: 'LIMITED TIME PROMO',
      title: 'GET 20% OFF TODAY',
      subtitle: 'Scan now to join our VIP club and instantly unlock 20% off your entire in-store or online purchase.',
      extraInfoLabel: 'PROMO CODE AT CHECKOUT',
      extraInfoValue: 'CODE: QUICK20 • Valid on all merchandise this weekend only',
      footerText: 'Instant coupon delivery • Safe & private local scan',
      qrPayload: 'https://quickqr.app/discount-20',
      qrLabel: 'CLAIM DISCOUNT',
      bgColor: '#eff6ff', // blue-50
      cardBg: '#ffffff',
      textColor: '#0f172a',
      subtitleColor: '#475569',
      accentColor: '#2563eb', // blue-600
      qrFgColor: '#1d4ed8',
      qrBgColor: '#ffffff',
      logoDataUrl: null,
      logoName: null,
    },
  },
  {
    id: 'event-pass',
    name: 'Concert & Event Pass',
    category: 'event',
    tagline: 'Posters, Badges & Entry Check-in',
    description: 'Deep midnight obsidian with vivid violet accents and VIP badge. Designed for live concerts, conferences, and gala invitations.',
    badgeLabel: 'Events & Tickets',
    defaultData: {
      templateId: 'event-pass',
      category: 'event',
      layout: 'classic-card',
      alignment: 'center',
      aspectRatio: 'portrait',
      badgeText: 'ADMISSION & RSVP',
      title: 'LIVE MUSIC & SUMMIT',
      subtitle: 'Scan to view the event timetable, speaker lineup, interactive venue map, and check in at the door.',
      extraInfoLabel: 'DATE & VENUE',
      extraInfoValue: 'Saturday, Nov 14th • Doors open at 6:30 PM • Main Stage Hall B',
      footerText: 'Present this QR pass to security at the gate for rapid entry',
      qrPayload: 'https://quickqr.app/event-checkin',
      qrLabel: 'FAST PASS ENTRY',
      bgColor: '#0f172a', // slate-900
      cardBg: '#1e293b', // slate-800
      textColor: '#f8fafc',
      subtitleColor: '#cbd5e1',
      accentColor: '#a855f7', // purple-500
      qrFgColor: '#7c3aed',
      qrBgColor: '#ffffff',
      logoDataUrl: null,
      logoName: null,
    },
  },
  {
    id: 'wifi-connect',
    name: 'High-Speed Guest Wi-Fi',
    category: 'wifi',
    tagline: 'Offices, Hotels & Coffee Shops',
    description: 'Clean emerald green connectivity poster with prominent Wi-Fi credentials box. Connects devices automatically without manual typing.',
    badgeLabel: 'Free Guest Wi-Fi',
    defaultData: {
      templateId: 'wifi-connect',
      category: 'wifi',
      layout: 'classic-card',
      alignment: 'center',
      aspectRatio: 'portrait',
      badgeText: 'COMPLIMENTARY ACCESS',
      title: 'CONNECT TO WI-FI',
      subtitle: 'Enjoy ultra-fast wireless internet. Simply open your camera and point it at the code to connect immediately.',
      extraInfoLabel: 'NETWORK DETAILS (WPA2)',
      extraInfoValue: 'Network: QuickQR_Guest_5G • Password: FreeInternet2026',
      footerText: 'Protected by WPA2-Personal • No manual password typing needed',
      qrPayload: 'WIFI:S:QuickQR_Guest_5G;T:WPA;P:FreeInternet2026;;',
      qrLabel: 'SCAN TO CONNECT',
      bgColor: '#f0fdf4', // emerald-50
      cardBg: '#ffffff',
      textColor: '#064e3b',
      subtitleColor: '#374151',
      accentColor: '#059669', // emerald-600
      qrFgColor: '#047857',
      qrBgColor: '#ffffff',
      logoDataUrl: null,
      logoName: null,
    },
  },
];

export const POSTER_COLOR_PRESETS: { label: string; bg: string; card: string; text: string; sub: string; accent: string; qrFg: string }[] = [
  { label: 'Culinary Amber', bg: '#fff7ed', card: '#ffffff', text: '#1c1917', sub: '#78716c', accent: '#c2410c', qrFg: '#9a3412' },
  { label: 'Cobalt Pro', bg: '#eff6ff', card: '#ffffff', text: '#0f172a', sub: '#475569', accent: '#2563eb', qrFg: '#1d4ed8' },
  { label: 'Emerald Fresh', bg: '#f0fdf4', card: '#ffffff', text: '#064e3b', sub: '#374151', accent: '#059669', qrFg: '#047857' },
  { label: 'Royal Violet', bg: '#faf5ff', card: '#ffffff', text: '#3b0764', sub: '#6b7280', accent: '#9333ea', qrFg: '#7e22ce' },
  { label: 'Midnight Dark', bg: '#090d16', card: '#161e2e', text: '#ffffff', sub: '#94a3b8', accent: '#38bdf8', qrFg: '#0284c7' },
  { label: 'Minimal Monochrome', bg: '#f8fafc', card: '#ffffff', text: '#0f172a', sub: '#64748b', accent: '#0f172a', qrFg: '#000000' },
  { label: 'Sunset Coral', bg: '#fff1f2', card: '#ffffff', text: '#881337', sub: '#701a75', accent: '#e11d48', qrFg: '#be123c' },
];
