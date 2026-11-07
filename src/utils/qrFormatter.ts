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
  QRLogoData,
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
 * Draws a centered, proportional logo badge onto a canvas context
 */
async function drawLogoBadge(
  ctx: CanvasRenderingContext2D,
  qrX: number,
  qrY: number,
  qrSize: number,
  logo: QRLogoData
) {
  try {
    const logoImg = await loadImage(logo.dataUrl);

    // Bounded logo size ratio: 15% to 26%
    const ratio = Math.max(0.14, Math.min(0.26, logo.sizeRatio || 0.20));
    const badgeSize = Math.round(qrSize * ratio);
    const badgeX = qrX + Math.round((qrSize - badgeSize) / 2);
    const badgeY = qrY + Math.round((qrSize - badgeSize) / 2);
    const badgeRadius = Math.round(badgeSize * 0.22);

    ctx.save();

    // Draw white protective rounded badge
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, badgeRadius);
    } else {
      ctx.rect(badgeX, badgeY, badgeSize, badgeSize);
    }
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = Math.max(1, Math.round(qrSize * 0.004));
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    // Clip inner area with rounded corners
    ctx.beginPath();
    const innerPadding = Math.round(badgeSize * 0.12);
    const innerSize = badgeSize - innerPadding * 2;
    const innerX = badgeX + innerPadding;
    const innerY = badgeY + innerPadding;
    const innerRadius = Math.max(2, Math.round(badgeRadius * 0.8));

    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(innerX, innerY, innerSize, innerSize, innerRadius);
    } else {
      ctx.rect(innerX, innerY, innerSize, innerSize);
    }
    ctx.clip();

    // Compute proportional dimensions (prevent stretching)
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
}

/**
 * Generates PNG Data URL in browser with optional frames, custom text, and center logo
 */
export async function generateQRPng(
  payload: string,
  options: QRStyleOptions
): Promise<string> {
  const bg = options.isTransparentBg ? '#00000000' : options.bgColor;
  // Automatically enforce High error correction (30%) if a logo overlay or frame is active
  const hasLogo = Boolean(options.logo?.dataUrl);
  const errorCorrection = hasLogo ? 'H' : options.errorCorrection;
  const hasFrame = options.frameStyle && options.frameStyle !== 'none';

  // Base case: No logo and No frame -> Fast standard generation
  if (!hasLogo && !hasFrame) {
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

  // Create composite canvas
  const canvas = document.createElement('canvas');
  const size = options.size;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background fill
  if (!options.isTransparentBg) {
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, size, size);
  }

  // If No Frame but Logo is present:
  if (!hasFrame) {
    await QRCode.toCanvas(canvas, payload, {
      errorCorrectionLevel: 'H',
      margin: options.margin,
      width: size,
      color: {
        dark: options.fgColor,
        light: bg,
      },
    });
    if (options.logo?.dataUrl) {
      await drawLogoBadge(ctx, 0, 0, size, options.logo);
    }
    return canvas.toDataURL('image/png');
  }

  // With Frame (bottom-banner, top-banner, card-frame):
  const frameColor = options.frameColor || options.fgColor || '#2563eb';
  const frameTextColor = options.frameTextColor || '#ffffff';
  const frameText = (options.frameText || 'SCAN ME').toUpperCase();

  // Layout calculations
  const pad = Math.round(size * 0.04);
  const cardRadius = Math.round(size * 0.04);

  // Outer container card
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(pad, pad, size - pad * 2, size - pad * 2, cardRadius);
  } else {
    ctx.rect(pad, pad, size - pad * 2, size - pad * 2);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = Math.max(1, Math.round(size * 0.003));
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();
  ctx.restore();

  let qrX = 0;
  let qrY = 0;
  let qrSize = 0;

  if (options.frameStyle === 'bottom-banner') {
    const bannerH = Math.round(size * 0.12);
    qrSize = size - pad * 2 - bannerH - Math.round(size * 0.03);
    qrX = Math.round((size - qrSize) / 2);
    qrY = pad + Math.round(size * 0.015);

    // Temporary canvas for QR matrix
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = qrSize;
    tempCanvas.height = qrSize;
    await QRCode.toCanvas(tempCanvas, payload, {
      errorCorrectionLevel: 'H',
      margin: options.margin,
      width: qrSize,
      color: {
        dark: options.fgColor,
        light: '#ffffff',
      },
    });
    ctx.drawImage(tempCanvas, qrX, qrY, qrSize, qrSize);

    // Bottom Banner Pill
    const bannerW = Math.round(qrSize * 0.88);
    const bannerX = Math.round((size - bannerW) / 2);
    const bannerY = qrY + qrSize + Math.round(size * 0.015);
    const bannerRadius = Math.round(bannerH * 0.35);

    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(bannerX, bannerY, bannerW, bannerH, bannerRadius);
    } else {
      ctx.rect(bannerX, bannerY, bannerW, bannerH);
    }
    ctx.fillStyle = frameColor;
    ctx.fill();

    // Banner Text
    ctx.fillStyle = frameTextColor;
    ctx.font = `bold ${Math.round(bannerH * 0.44)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameText, size / 2, bannerY + bannerH / 2);
    ctx.restore();

  } else if (options.frameStyle === 'top-banner') {
    const bannerH = Math.round(size * 0.12);
    const bannerW = Math.round((size - pad * 2) * 0.85);
    const bannerX = Math.round((size - bannerW) / 2);
    const bannerY = pad + Math.round(size * 0.02);
    const bannerRadius = Math.round(bannerH * 0.35);

    // Top Banner Pill
    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(bannerX, bannerY, bannerW, bannerH, bannerRadius);
    } else {
      ctx.rect(bannerX, bannerY, bannerW, bannerH);
    }
    ctx.fillStyle = frameColor;
    ctx.fill();

    ctx.fillStyle = frameTextColor;
    ctx.font = `bold ${Math.round(bannerH * 0.44)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameText, size / 2, bannerY + bannerH / 2);
    ctx.restore();

    qrSize = size - pad * 2 - bannerH - Math.round(size * 0.04);
    qrX = Math.round((size - qrSize) / 2);
    qrY = bannerY + bannerH + Math.round(size * 0.02);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = qrSize;
    tempCanvas.height = qrSize;
    await QRCode.toCanvas(tempCanvas, payload, {
      errorCorrectionLevel: 'H',
      margin: options.margin,
      width: qrSize,
      color: {
        dark: options.fgColor,
        light: '#ffffff',
      },
    });
    ctx.drawImage(tempCanvas, qrX, qrY, qrSize, qrSize);

  } else {
    // 'card-frame' (Polaroid style)
    const textH = Math.round(size * 0.10);
    qrSize = size - pad * 2 - textH - Math.round(size * 0.03);
    qrX = Math.round((size - qrSize) / 2);
    qrY = pad + Math.round(size * 0.02);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = qrSize;
    tempCanvas.height = qrSize;
    await QRCode.toCanvas(tempCanvas, payload, {
      errorCorrectionLevel: 'H',
      margin: options.margin,
      width: qrSize,
      color: {
        dark: options.fgColor,
        light: '#ffffff',
      },
    });
    ctx.drawImage(tempCanvas, qrX, qrY, qrSize, qrSize);

    // Polaroid Text Underneath
    ctx.save();
    ctx.fillStyle = options.fgColor || '#0f172a';
    ctx.font = `bold ${Math.round(textH * 0.42)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameText, size / 2, qrY + qrSize + Math.round(textH * 0.5));
    ctx.restore();
  }

  // Draw Logo if present
  if (hasLogo && options.logo) {
    await drawLogoBadge(ctx, qrX, qrY, qrSize, options.logo);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Generates clean SVG markup in browser with optional frames, custom text, and center logo
 */
export async function generateQRSvg(
  payload: string,
  options: QRStyleOptions
): Promise<string> {
  const bg = options.isTransparentBg ? '#00000000' : options.bgColor;
  const hasLogo = Boolean(options.logo?.dataUrl);
  const errorCorrection = hasLogo ? 'H' : options.errorCorrection;
  const hasFrame = options.frameStyle && options.frameStyle !== 'none';

  // Base raw SVG for standard QR
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

  // Base case: No logo and No frame -> Return standard vector SVG
  if (!hasLogo && !hasFrame) {
    return rawSvg;
  }

  // Case 1: Logo present, but No Frame
  if (!hasFrame && hasLogo && options.logo) {
    try {
      const viewBoxMatch = rawSvg.match(/viewBox="0 0 (\d+(\.\d+)?) (\d+(\.\d+)?)"/);
      const widthMatch = rawSvg.match(/width="(\d+(\.\d+)?)"/);

      let totalDim = options.size;
      if (viewBoxMatch && viewBoxMatch[1]) {
        totalDim = parseFloat(viewBoxMatch[1]);
      } else if (widthMatch && widthMatch[1]) {
        totalDim = parseFloat(widthMatch[1]);
      }

      const ratio = Math.max(0.14, Math.min(0.26, options.logo.sizeRatio || 0.20));
      const badgeSize = totalDim * ratio;
      const badgeX = (totalDim - badgeSize) / 2;
      const badgeY = (totalDim - badgeSize) / 2;
      const rx = badgeSize * 0.22;

      const innerPadding = badgeSize * 0.12;
      const innerSize = badgeSize - innerPadding * 2;
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

  // Case 2: Frame is enabled (with or without logo)
  const size = options.size;
  const frameColor = options.frameColor || options.fgColor || '#2563eb';
  const frameTextColor = options.frameTextColor || '#ffffff';
  const frameText = (options.frameText || 'SCAN ME').toUpperCase();
  const pad = Math.round(size * 0.04);
  const cardRadius = Math.round(size * 0.04);

  // Extract path content from rawSvg
  const pathMatches = rawSvg.match(/<path[^>]+>/g) || [];
  const qrPaths = pathMatches.join('\n    ');

  // Determine inner QR dimensions
  let qrX = 0;
  let qrY = 0;
  let qrSize = 0;
  let bannerElement = '';

  if (options.frameStyle === 'bottom-banner') {
    const bannerH = Math.round(size * 0.12);
    qrSize = size - pad * 2 - bannerH - Math.round(size * 0.03);
    qrX = Math.round((size - qrSize) / 2);
    qrY = pad + Math.round(size * 0.015);

    const bannerW = Math.round(qrSize * 0.88);
    const bannerX = Math.round((size - bannerW) / 2);
    const bannerY = qrY + qrSize + Math.round(size * 0.015);
    const bannerRadius = Math.round(bannerH * 0.35);

    bannerElement = `
    <!-- Bottom Banner -->
    <rect x="${bannerX}" y="${bannerY}" width="${bannerW}" height="${bannerH}" rx="${bannerRadius}" fill="${frameColor}" />
    <text x="${size / 2}" y="${bannerY + bannerH / 2 + 1}" text-anchor="middle" dominant-baseline="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="bold" font-size="${Math.round(bannerH * 0.44)}" fill="${frameTextColor}">${frameText}</text>`;
  } else if (options.frameStyle === 'top-banner') {
    const bannerH = Math.round(size * 0.12);
    const bannerW = Math.round((size - pad * 2) * 0.85);
    const bannerX = Math.round((size - bannerW) / 2);
    const bannerY = pad + Math.round(size * 0.02);
    const bannerRadius = Math.round(bannerH * 0.35);

    bannerElement = `
    <!-- Top Banner -->
    <rect x="${bannerX}" y="${bannerY}" width="${bannerW}" height="${bannerH}" rx="${bannerRadius}" fill="${frameColor}" />
    <text x="${size / 2}" y="${bannerY + bannerH / 2 + 1}" text-anchor="middle" dominant-baseline="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="bold" font-size="${Math.round(bannerH * 0.44)}" fill="${frameTextColor}">${frameText}</text>`;

    qrSize = size - pad * 2 - bannerH - Math.round(size * 0.04);
    qrX = Math.round((size - qrSize) / 2);
    qrY = bannerY + bannerH + Math.round(size * 0.02);
  } else {
    // Card frame
    const textH = Math.round(size * 0.10);
    qrSize = size - pad * 2 - textH - Math.round(size * 0.03);
    qrX = Math.round((size - qrSize) / 2);
    qrY = pad + Math.round(size * 0.02);

    bannerElement = `
    <!-- Polaroid text -->
    <text x="${size / 2}" y="${qrY + qrSize + Math.round(textH * 0.5)}" text-anchor="middle" dominant-baseline="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="bold" font-size="${Math.round(textH * 0.42)}" fill="${options.fgColor || '#0f172a'}">${frameText}</text>`;
  }

  // Extract raw viewBox to scale paths into qrSize
  const viewBoxMatch = rawSvg.match(/viewBox="0 0 (\d+(\.\d+)?) (\d+(\.\d+)?)"/);
  const rawDim = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : size;
  const scale = (qrSize / rawDim).toFixed(4);

  // Logo overlay for SVG if present
  let logoSvgGroup = '';
  if (hasLogo && options.logo) {
    const ratio = Math.max(0.14, Math.min(0.26, options.logo.sizeRatio || 0.20));
    const badgeSize = qrSize * ratio;
    const badgeX = qrX + (qrSize - badgeSize) / 2;
    const badgeY = qrY + (qrSize - badgeSize) / 2;
    const rx = badgeSize * 0.22;
    const innerPadding = badgeSize * 0.12;
    const innerSize = badgeSize - innerPadding * 2;
    const innerX = badgeX + innerPadding;
    const innerY = badgeY + innerPadding;

    logoSvgGroup = `
    <g id="qr-logo-overlay">
      <rect x="${badgeX.toFixed(2)}" y="${badgeY.toFixed(2)}" width="${badgeSize.toFixed(2)}" height="${badgeSize.toFixed(2)}" rx="${rx.toFixed(2)}" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
      <image href="${options.logo.dataUrl}" xlink:href="${options.logo.dataUrl}" x="${innerX.toFixed(2)}" y="${innerY.toFixed(2)}" width="${innerSize.toFixed(2)}" height="${innerSize.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />
    </g>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <!-- Card background -->
  <rect x="${pad}" y="${pad}" width="${size - pad * 2}" height="${size - pad * 2}" rx="${cardRadius}" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
  
  <!-- Scaled QR Matrix -->
  <g transform="translate(${qrX}, ${qrY}) scale(${scale})">
    ${qrPaths}
  </g>
  ${bannerElement}
  ${logoSvgGroup}
</svg>`;
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
