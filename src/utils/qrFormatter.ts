import QRCode from 'qrcode';
import {
  QRType,
  UrlFormData,
  TextFormData,
  WifiFormData,
  EmailFormData,
  PhoneFormData,
  SmsFormData,
  QRStyleOptions,
} from '../types/qr';

/**
 * Escapes special characters for Wi-Fi QR strings (ZXing standard)
 */
function escapeWifiString(str: string): string {
  return str.replace(/([\\;,:"])/g, '\\$1');
}

/**
 * Formats data based on the QR Code type according to standard URI protocols
 */
export function formatQRData(
  type: QRType,
  data: {
    url: UrlFormData;
    text: TextFormData;
    wifi: WifiFormData;
    email: EmailFormData;
    phone: PhoneFormData;
    sms: SmsFormData;
  }
): { payload: string; isValid: boolean; errorMessage?: string } {
  switch (type) {
    case 'url': {
      const rawUrl = data.url.url.trim();
      if (!rawUrl) {
        return { payload: '', isValid: false, errorMessage: 'Please enter a URL or website address.' };
      }
      let formattedUrl = rawUrl;
      // Auto-prefix https:// if protocol is missing
      if (!/^https?:\/\//i.test(formattedUrl) && !/^[a-zA-Z0-9+-.]+:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      try {
        new URL(formattedUrl);
        return { payload: formattedUrl, isValid: true };
      } catch {
        return { payload: formattedUrl, isValid: false, errorMessage: 'Please enter a valid website URL.' };
      }
    }

    case 'text': {
      const rawText = data.text.text;
      if (!rawText.trim()) {
        return { payload: '', isValid: false, errorMessage: 'Please enter some text to generate a QR code.' };
      }
      return { payload: rawText, isValid: true };
    }

    case 'wifi': {
      const { ssid, password, encryption, hidden } = data.wifi;
      const trimmedSsid = ssid.trim();
      if (!trimmedSsid) {
        return { payload: '', isValid: false, errorMessage: 'Network Name (SSID) is required.' };
      }

      if (encryption !== 'nopass' && !password) {
        return { payload: '', isValid: false, errorMessage: 'Password is required for encrypted Wi-Fi networks.' };
      }

      if (encryption === 'WPA' && password.length < 8) {
        return { payload: '', isValid: false, errorMessage: 'WPA/WPA2/WPA3 passwords must be at least 8 characters.' };
      }

      const escapedSsid = escapeWifiString(trimmedSsid);
      const escapedPassword = encryption !== 'nopass' ? escapeWifiString(password) : '';
      const hiddenFlag = hidden ? 'true' : 'false';

      // Standard WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
      let wifiPayload = `WIFI:T:${encryption};S:${escapedSsid};`;
      if (encryption !== 'nopass') {
        wifiPayload += `P:${escapedPassword};`;
      }
      wifiPayload += `H:${hiddenFlag};;`;

      return { payload: wifiPayload, isValid: true };
    }

    case 'email': {
      const { email, subject, body } = data.email;
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        return { payload: '', isValid: false, errorMessage: 'Recipient email address is required.' };
      }

      // Basic RFC 5322 email regex check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return { payload: '', isValid: false, errorMessage: 'Please enter a valid email address (e.g. name@domain.com).' };
      }

      const params = new URLSearchParams();
      if (subject.trim()) params.append('subject', subject.trim());
      if (body.trim()) params.append('body', body.trim());

      const queryString = params.toString();
      const mailtoPayload = queryString ? `mailto:${trimmedEmail}?${queryString}` : `mailto:${trimmedEmail}`;

      return { payload: mailtoPayload, isValid: true };
    }

    case 'phone': {
      const rawPhone = data.phone.phone.trim();
      if (!rawPhone) {
        return { payload: '', isValid: false, errorMessage: 'Phone number is required.' };
      }

      // Allow +, digits, spaces, hyphens, parentheses
      const cleanPhone = rawPhone.replace(/[\s\-()]/g, '');
      if (!/^\+?[0-9]{3,15}$/.test(cleanPhone)) {
        return { payload: '', isValid: false, errorMessage: 'Please enter a valid phone number with digits (3-15 digits).' };
      }

      return { payload: `tel:${cleanPhone}`, isValid: true };
    }

    case 'sms': {
      const { phone, message } = data.sms;
      const rawPhone = phone.trim();
      if (!rawPhone) {
        return { payload: '', isValid: false, errorMessage: 'Recipient phone number is required.' };
      }

      const cleanPhone = rawPhone.replace(/[\s\-()]/g, '');
      if (!/^\+?[0-9]{3,15}$/.test(cleanPhone)) {
        return { payload: '', isValid: false, errorMessage: 'Please enter a valid phone number (3-15 digits).' };
      }

      const encodedBody = message ? `?body=${encodeURIComponent(message)}` : '';
      return { payload: `sms:${cleanPhone}${encodedBody}`, isValid: true };
    }

    default:
      return { payload: '', isValid: false, errorMessage: 'Unknown QR code type.' };
  }
}

/**
 * Generates PNG Data URL in browser
 */
export async function generateQRPng(
  payload: string,
  options: QRStyleOptions
): Promise<string> {
  const bg = options.isTransparentBg ? '#00000000' : options.bgColor;
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: options.errorCorrection,
    margin: options.margin,
    width: options.size,
    color: {
      dark: options.fgColor,
      light: bg,
    },
  });
}

/**
 * Generates clean SVG markup in browser
 */
export async function generateQRSvg(
  payload: string,
  options: QRStyleOptions
): Promise<string> {
  const bg = options.isTransparentBg ? '#00000000' : options.bgColor;
  return QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: options.errorCorrection,
    margin: options.margin,
    width: options.size,
    color: {
      dark: options.fgColor,
      light: bg,
    },
  });
}

/**
 * Downloads a file to user device
 */
export function downloadFile(content: string, filename: string, isDataUrl = false) {
  const link = document.createElement('a');
  if (isDataUrl) {
    link.href = content;
  } else {
    const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
    link.href = URL.createObjectURL(blob);
  }
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (!isDataUrl) {
    URL.revokeObjectURL(link.href);
  }
}
