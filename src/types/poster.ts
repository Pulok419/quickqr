export type PosterCategory = 'restaurant' | 'business' | 'event' | 'wifi';

export type PosterLayout = 'classic-card' | 'bold-banner' | 'minimalist' | 'table-stand';

export type PosterAlignment = 'center' | 'left';

export type PosterAspectRatio = 'portrait' | 'square';

export interface PosterTheme {
  id: string;
  name: string;
  category: PosterCategory;
  bgColor: string;
  bgGradientEnd?: string;
  cardBg: string;
  textColor: string;
  subtitleColor: string;
  accentColor: string;
  qrFgColor: string;
  qrBgColor: string;
  badgeBg: string;
  badgeText: string;
}

export interface PosterData {
  templateId: string;
  category: PosterCategory;
  layout: PosterLayout;
  alignment: PosterAlignment;
  aspectRatio: PosterAspectRatio;
  
  // Text Content
  badgeText: string;
  title: string;
  subtitle: string;
  extraInfoLabel: string;
  extraInfoValue: string;
  footerText: string;

  // QR Content & Type
  qrPayload: string;
  qrLabel: string;

  // Colors
  bgColor: string;
  cardBg: string;
  textColor: string;
  subtitleColor: string;
  accentColor: string;
  qrFgColor: string;
  qrBgColor: string;

  // Logo
  logoDataUrl: string | null;
  logoName: string | null;
}
