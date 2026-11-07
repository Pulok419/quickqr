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
 * Loads an image from a Data URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load logo image'));
    img.src = src;
  });
}

/**
 * Generates PNG Data URL in browser with optional center logo overlay
 */
export async function generateQRPng(
  payload: string,
  options: QRStyleOptions
): Promise<string> {
  const bg = options.isTransparentBg ? '#00000000' : options.bgColor;
  // Automatically enforce High error correction (30%) if a logo overlay is present
  const errorCorrection = options.logo?.dataUrl ? 'H' : options.errorCorrection;

  // If no logo, use standard fast QR generator
  if (!options.logo?.dataUrl) {
    return QRCode.toDataURL(payload, {
      errorCorrectionLevel: errorCorrection,
      margin: options.margin,
      width: options.size,
      color: {
        dark: options.fgColor,
        light: bg,
      },
    });
  }

  // With Logo: Render base QR onto canvas, then draw center badge & proportional logo
  const canvas = document.createElement('canvas');
  canvas.width = options.size;
  canvas.height = options.size;

  await QRCode.toCanvas(canvas, payload, {
    errorCorrectionLevel: 'H',
    margin: options.margin,
    width: options.size,
    color: {
      dark: options.fgColor,
      light: bg,
    },
  });

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/png');

  try {
    const logoImg = await loadImage(options.logo.dataUrl);

    const size = options.size;
    // Central badge is ~20% of QR width, leaving finder patterns intact
    const badgeSize = Math.round(size * 0.20);
    const badgeX = Math.round((size - badgeSize) / 2);
    const badgeY = Math.round((size - badgeSize) / 2);
    const badgeRadius = Math.round(badgeSize * 0.22);

    ctx.save();
    
    // Draw white protective rounded background badge
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, badgeRadius);
    } else {
      // Fallback for older browsers
      ctx.rect(badgeX, badgeY, badgeSize, badgeSize);
    }
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = Math.max(1, Math.round(size * 0.004));
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    // Clip inner area with rounded corners to ensure logo stays cleanly inside
    ctx.beginPath();
    const innerPadding = Math.round(badgeSize * 0.12);
    const innerSize = badgeSize - (innerPadding * 2);
    const innerX = badgeX + innerPadding;
    const innerY = badgeY + innerPadding;
    const innerRadius = Math.max(2, Math.round(badgeRadius * 0.8));

    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(innerX, innerY, innerSize, innerSize, innerRadius);
    } else {
      ctx.rect(innerX, innerY, innerSize, innerSize);
    }
    ctx.clip();

    // Compute proportional dimensions (prevent distortion/stretching)
    const imgRatio = logoImg.width / logoImg.height;
    let drawW = innerSize;
    let drawH = innerSize;

    if (imgRatio > 1) {
      drawH = innerSize / imgRatio;
    } else if (imgRatio < 1) {
      drawW = innerSize * imgRatio;
    }

    const drawX = innerX + (innerSize - drawW) / 2;
    const drawY = innerY + (innerSize - drawH) / 2;

    ctx.drawImage(logoImg, drawX, drawY, drawW, drawH);
    ctx.restore();
  } catch (err) {
    console.warn('Could not overlay logo onto QR canvas:', err);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Generates clean SVG markup in browser with optional center logo overlay
 */
export async function generateQRSvg(
  payload: string,
  options: QRStyleOptions
): Promise<string> {
  const bg = options.isTransparentBg ? '#00000000' : options.bgColor;
  const errorCorrection = options.logo?.dataUrl ? 'H' : options.errorCorrection;

  const rawSvg = await QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: errorCorrection,
    margin: options.margin,
    width: options.size,
    color: {
      dark: options.fgColor,
      light: bg,
    },
  });

  // If no logo, return standard vector SVG
  if (!options.logo?.dataUrl) {
    return rawSvg;
  }

  // Inject logo overlay inside SVG
  try {
    const viewBoxMatch = rawSvg.match(/viewBox="0 0 (\d+(\.\d+)?) (\d+(\.\d+)?)"/);
    const widthMatch = rawSvg.match(/width="(\d+(\.\d+)?)"/);
    
    let totalDim = options.size;
    if (viewBoxMatch && viewBoxMatch[1]) {
      totalDim = parseFloat(viewBoxMatch[1]);
    } else if (widthMatch && widthMatch[1]) {
      totalDim = parseFloat(widthMatch[1]);
    }

    const badgeSize = totalDim * 0.20;
    const badgeX = (totalDim - badgeSize) / 2;
    const badgeY = (totalDim - badgeSize) / 2;
    const rx = badgeSize * 0.22;

    const innerPadding = badgeSize * 0.12;
    const innerSize = badgeSize - (innerPadding * 2);
    const innerX = badgeX + innerPadding;
    const innerY = badgeY + innerPadding;
    const strokeWidth = Math.max(0.5, totalDim * 0.004);

    const logoGroup = `
  <g id="qr-logo-overlay">
    <rect x="${badgeX.toFixed(2)}" y="${badgeY.toFixed(2)}" width="${badgeSize.toFixed(2)}" height="${badgeSize.toFixed(2)}" rx="${rx.toFixed(2)}" fill="#ffffff" stroke="#e2e8f0" stroke-width="${strokeWidth.toFixed(2)}" />
    <image href="${options.logo.dataUrl}" xlink:href="${options.logo.dataUrl}" x="${innerX.toFixed(2)}" y="${innerY.toFixed(2)}" width="${innerSize.toFixed(2)}" height="${innerSize.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />
  </g>
</svg>`;

    let svgWithLogo = rawSvg.replace(/<\/svg>\s*$/, logoGroup);
    if (!svgWithLogo.includes('xmlns:xlink=')) {
      svgWithLogo = svgWithLogo.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');
    }
    return svgWithLogo;
  } catch (err) {
    console.warn('Could not inject logo into SVG:', err);
    return rawSvg;
  }
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
