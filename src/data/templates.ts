import { QRFrameStyle, DesignStyle } from '../types/qr';

export interface QRTemplate {
  id: string;
  name: string;
  category: 'Minimal' | 'Business' | 'Restaurant' | 'Gaming' | 'Nature' | 'Gradient' | 'Wedding' | 'Social Media';
  tagline: string;
  description: string;
  fgColor: string;
  bgColor: string;
  frameStyle: QRFrameStyle;
  frameText: string;
  frameColor: string;
  frameTextColor: string;
  badgeLabel: string;
  accentGradient: string;
}

export const QR_TEMPLATES: QRTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal Classic',
    category: 'Minimal',
    tagline: 'Pure Monochrome Contrast',
    description: 'Crisp black modules on pure white. Timeless, authoritative, and scanned with lightning speed by every smartphone camera.',
    fgColor: '#000000',
    bgColor: '#ffffff',
    frameStyle: 'none',
    frameText: 'SCAN ME',
    frameColor: '#000000',
    frameTextColor: '#ffffff',
    badgeLabel: 'Clean Standard',
    accentGradient: 'from-slate-800 to-black',
  },
  {
    id: 'business',
    name: 'Corporate Executive',
    category: 'Business',
    tagline: 'Executive Consulting & B2B',
    description: 'Deep obsidian slate with a bold callout banner. Engineered for corporate presentations, business cards, and marketing collateral.',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    frameStyle: 'bottom-banner',
    frameText: 'SCAN FOR INFO',
    frameColor: '#0f172a',
    frameTextColor: '#ffffff',
    badgeLabel: 'Corporate',
    accentGradient: 'from-slate-900 to-blue-950',
  },
  {
    id: 'restaurant',
    name: 'Bistro & Gastronomy',
    category: 'Restaurant',
    tagline: 'Menus & Table Stands',
    description: 'Rich warm terracotta with a Polaroid card format. Tailored for restaurant table stands, cocktail bars, and food truck ordering.',
    fgColor: '#c2410c',
    bgColor: '#ffffff',
    frameStyle: 'card-frame',
    frameText: 'VIEW DIGITAL MENU',
    frameColor: '#c2410c',
    frameTextColor: '#ffffff',
    badgeLabel: 'Dining & Hospitality',
    accentGradient: 'from-amber-600 to-orange-700',
  },
  {
    id: 'gaming',
    name: 'Cyber Arcade',
    category: 'Gaming',
    tagline: 'Discord & Streamers',
    description: 'Vibrant electric indigo with an overhead badge banner. Designed for Twitch streams, Discord servers, and esports teams.',
    fgColor: '#4f46e5',
    bgColor: '#ffffff',
    frameStyle: 'top-banner',
    frameText: 'JOIN COMMUNITY',
    frameColor: '#4f46e5',
    frameTextColor: '#ffffff',
    badgeLabel: 'Esports & Streams',
    accentGradient: 'from-indigo-600 to-purple-700',
  },
  {
    id: 'nature',
    name: 'Botanical Sanctuary',
    category: 'Nature',
    tagline: 'Eco & Outdoor Gardens',
    description: 'Lush forest emerald tones with an elegant card frame. Ideal for parks, botanical gardens, plant nurseries, and eco packaging.',
    fgColor: '#047857',
    bgColor: '#ffffff',
    frameStyle: 'card-frame',
    frameText: 'EXPLORE NATURE',
    frameColor: '#047857',
    frameTextColor: '#ffffff',
    badgeLabel: 'Sustainable',
    accentGradient: 'from-emerald-600 to-teal-800',
  },
  {
    id: 'gradient',
    name: 'Sunset Glow',
    category: 'Gradient',
    tagline: 'Vibrant Pop & Drops',
    description: 'Warm coral and sunset hues with a modern pill banner. Eye-catching for boutique products, pop-up events, and retail promotions.',
    fgColor: '#ea580c',
    bgColor: '#ffffff',
    frameStyle: 'bottom-banner',
    frameText: 'DISCOVER MORE',
    frameColor: '#ea580c',
    frameTextColor: '#ffffff',
    badgeLabel: 'Modern Gradient',
    accentGradient: 'from-orange-500 via-rose-500 to-pink-600',
  },
  {
    id: 'wedding',
    name: 'Elegant Romance',
    category: 'Wedding',
    tagline: 'RSVPs & Celebrations',
    description: 'Sophisticated wine and champagne styling. Created for wedding invitations, RSVP responses, gift registries, and photo albums.',
    fgColor: '#9f1239',
    bgColor: '#ffffff',
    frameStyle: 'card-frame',
    frameText: 'RSVP & REGISTRY',
    frameColor: '#9f1239',
    frameTextColor: '#ffffff',
    badgeLabel: 'Weddings & Galas',
    accentGradient: 'from-rose-800 to-pink-900',
  },
  {
    id: 'social-media',
    name: 'Creator Hub',
    category: 'Social Media',
    tagline: 'Audience Growth & Links',
    description: 'Electric cobalt blue with a high-conversion follow banner. Built for Linktree, Instagram, YouTube, and music streaming pages.',
    fgColor: '#2563eb',
    bgColor: '#ffffff',
    frameStyle: 'bottom-banner',
    frameText: 'FOLLOW & SUBSCRIBE',
    frameColor: '#2563eb',
    frameTextColor: '#ffffff',
    badgeLabel: 'Creator Links',
    accentGradient: 'from-blue-600 to-indigo-600',
  },
];
