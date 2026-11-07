export type QRType = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface UrlFormData {
  url: string;
}

export interface TextFormData {
  text: string;
}

export interface WifiFormData {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

export interface EmailFormData {
  email: string;
  subject: string;
  body: string;
}

export interface PhoneFormData {
  phone: string;
}

export interface SmsFormData {
  phone: string;
  message: string;
}

export type DesignStyle = 'minimal' | 'colorful';

export type QRFrameStyle = 'none' | 'bottom-banner' | 'top-banner' | 'card-frame';

export interface QRLogoData {
  dataUrl: string;
  name: string;
  sizeRatio?: number; // 0.15 to 0.26, default 0.20
}

export interface QRStyleOptions {
  designStyle: DesignStyle;
  presetTheme?: string;
  fgColor: string;
  bgColor: string;
  isTransparentBg: boolean;
  size: number;
  errorCorrection: ErrorCorrectionLevel;
  margin: number;
  logo?: QRLogoData | null;
  frameStyle: QRFrameStyle;
  frameText: string;
  frameColor: string;
  frameTextColor: string;
}

