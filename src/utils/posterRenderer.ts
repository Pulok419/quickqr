import QRCode from 'qrcode';
import { PosterData } from '../types/poster';

/**
 * Loads an image from a Data URL asynchronously
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for poster'));
    img.src = src;
  });
}

/**
 * Helper to wrap text into lines fitting within a maximum width
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Draws a rounded rectangle path
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generates an in-memory high-res QR code data URL for embedding into the poster
 */
async function generatePosterQRDataUrl(data: PosterData, size: number): Promise<string> {
  const payload = data.qrPayload.trim() || 'https://quickqr.app';
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'H',
    width: size,
    margin: 2,
    color: {
      dark: data.qrFgColor || '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Renders the entire complete QR Poster onto a Canvas context
 */
export async function renderPosterToCanvas(
  canvas: HTMLCanvasElement,
  data: PosterData
): Promise<void> {
  const isPortrait = data.aspectRatio === 'portrait';
  const width = 1200;
  const height = isPortrait ? 1600 : 1200;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw Poster Base Background
  ctx.fillStyle = data.bgColor || '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Subtle background texture / decorative vignette
  const grad = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, width * 0.8);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Card Layout Dimensions
  const padding = 60;
  const cardX = padding;
  const cardY = padding;
  const cardW = width - padding * 2;
  const cardH = height - padding * 2;
  const cardRadius = data.layout === 'minimalist' ? 8 : 28;

  // Draw Card Shadow & Background Plate
  if (data.layout !== 'minimalist') {
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    ctx.fillStyle = data.cardBg || '#ffffff';
    ctx.fill();
    ctx.restore();

    // Subtle Card Border
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    // Minimalist layout: pure frame with double border line
    ctx.fillStyle = data.cardBg || '#ffffff';
    ctx.fillRect(cardX, cardY, cardW, cardH);

    ctx.strokeStyle = data.accentColor || '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(cardX + 16, cardY + 16, cardW - 32, cardH - 32);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cardX + 24, cardY + 24, cardW - 48, cardH - 48);
  }

  // 3. Layout Specific Decorations
  let contentStartY = cardY + 45;

  if (data.layout === 'bold-banner') {
    const bannerH = 130;
    ctx.save();
    ctx.beginPath();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    ctx.clip();

    ctx.fillStyle = data.accentColor;
    ctx.fillRect(cardX, cardY, cardW, bannerH);
    ctx.restore();

    contentStartY = cardY + bannerH + 35;
  }

  // 4. Logo (if uploaded)
  if (data.logoDataUrl) {
    try {
      const logoImg = await loadImage(data.logoDataUrl);
      const maxLogoH = 80;
      const maxLogoW = 240;
      let logoW = logoImg.width;
      let logoH = logoImg.height;

      const scale = Math.min(maxLogoW / logoW, maxLogoH / logoH);
      logoW *= scale;
      logoH *= scale;

      const logoX = data.alignment === 'left'
        ? cardX + 60
        : width / 2 - logoW / 2;

      ctx.drawImage(logoImg, logoX, contentStartY, logoW, logoH);
      contentStartY += logoH + 25;
    } catch {
      // Gracefully continue without logo if corrupted
    }
  }

  // 5. Category Badge Pill
  if (data.badgeText && data.badgeText.trim()) {
    const badgeText = data.badgeText.toUpperCase().trim();
    ctx.font = 'bold 22px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const badgeMetrics = ctx.measureText(badgeText);
    const badgePadX = 24;
    const badgeH = 42;
    const badgeW = badgeMetrics.width + badgePadX * 2;
    const badgeX = data.alignment === 'left' ? cardX + 60 : width / 2 - badgeW / 2;
    const badgeY = contentStartY;

    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 21);
    ctx.fillStyle = data.layout === 'bold-banner' ? 'rgba(0,0,0,0.06)' : data.accentColor;
    ctx.fill();

    ctx.fillStyle = data.layout === 'bold-banner' ? data.accentColor : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);

    contentStartY += badgeH + 24;
  }

  // 6. Title
  const titleText = data.title.trim() || 'SCAN ME';
  ctx.font = '900 52px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = data.textColor || '#0f172a';
  ctx.textAlign = data.alignment === 'left' ? 'left' : 'center';
  ctx.textBaseline = 'alphabetic';

  const titleMaxW = cardW - 120;
  const titleLines = wrapText(ctx, titleText, titleMaxW);
  const titleLineH = 62;
  const titleX = data.alignment === 'left' ? cardX + 60 : width / 2;

  for (const line of titleLines) {
    ctx.fillText(line, titleX, contentStartY + 45);
    contentStartY += titleLineH;
  }
  contentStartY += 8;

  // 7. Subtitle
  if (data.subtitle && data.subtitle.trim()) {
    ctx.font = '500 24px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = data.subtitleColor || '#64748b';
    ctx.textAlign = data.alignment === 'left' ? 'left' : 'center';

    const subLines = wrapText(ctx, data.subtitle.trim(), titleMaxW);
    const subLineH = 36;
    const subX = data.alignment === 'left' ? cardX + 60 : width / 2;

    for (const line of subLines) {
      ctx.fillText(line, subX, contentStartY + 20);
      contentStartY += subLineH;
    }
    contentStartY += 24;
  }

  // 8. QR Code Container Box & Rendering
  const availableH = (cardY + cardH) - contentStartY;
  // Dynamic sizing based on remaining height
  const qrPixelSize = isPortrait ? (availableH > 680 ? 460 : 380) : 340;
  const qrX = width / 2 - qrPixelSize / 2;
  const qrY = contentStartY + (isPortrait ? 10 : 0);

  // White Plate behind QR for optical quiet zone
  const platePadding = 24;
  const plateX = qrX - platePadding;
  const plateY = qrY - platePadding;
  const plateSize = qrPixelSize + platePadding * 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  drawRoundedRect(ctx, plateX, plateY, plateSize, plateSize, 24);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  drawRoundedRect(ctx, plateX, plateY, plateSize, plateSize, 24);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw QR Image
  const qrDataUrl = await generatePosterQRDataUrl(data, qrPixelSize);
  const qrImg = await loadImage(qrDataUrl);
  ctx.drawImage(qrImg, qrX, qrY, qrPixelSize, qrPixelSize);

  // Label below QR (if enabled)
  let qrBottomY = qrY + qrPixelSize + platePadding + 20;
  if (data.qrLabel && data.qrLabel.trim()) {
    const qrLabelText = data.qrLabel.toUpperCase().trim();
    ctx.font = 'bold 20px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = data.accentColor;
    ctx.textAlign = 'center';
    ctx.fillText(qrLabelText, width / 2, qrBottomY);
    qrBottomY += 32;
  }

  // 9. Extra Information Callout Box (e.g. WiFi SSID & Password or Promo Code)
  if (data.extraInfoValue && data.extraInfoValue.trim()) {
    const boxPadX = 30;
    const boxW = Math.min(cardW - 120, 800);
    const boxX = width / 2 - boxW / 2;
    const boxY = qrBottomY + 10;
    const boxH = 76;

    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 16);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.fill();

    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 16);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (data.extraInfoLabel && data.extraInfoLabel.trim()) {
      ctx.font = 'bold 15px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = data.accentColor;
      ctx.textAlign = 'center';
      ctx.fillText(data.extraInfoLabel.toUpperCase().trim(), width / 2, boxY + 28);
    }

    ctx.font = '600 20px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = data.textColor;
    ctx.textAlign = 'center';
    ctx.fillText(data.extraInfoValue.trim(), width / 2, boxY + 54);

    qrBottomY = boxY + boxH + 15;
  }

  // 10. Footer Instructions
  const footerText = data.footerText.trim() || 'Point smartphone camera at QR code to scan';
  ctx.font = '500 17px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = data.subtitleColor || '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText(footerText, width / 2, cardY + cardH - 28);
}

/**
 * Renders poster to an in-memory canvas and returns high-resolution PNG data URL
 */
export async function generatePosterDataUrl(data: PosterData): Promise<string> {
  const canvas = document.createElement('canvas');
  await renderPosterToCanvas(canvas, data);
  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Triggers browser download of the high-resolution PNG poster
 */
export async function downloadPoster(data: PosterData, customFilename?: string): Promise<void> {
  const dataUrl = await generatePosterDataUrl(data);
  const cleanTitle = (data.title || 'qr-poster')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const filename = customFilename || `quickqr-poster-${cleanTitle || 'print'}.png`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
