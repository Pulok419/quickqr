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

export interface QRStyleOptions {
  fgColor: string;
  bgColor: string;
  isTransparentBg: boolean;
  size: number;
  errorCorrection: ErrorCorrectionLevel;
  margin: number;
}
