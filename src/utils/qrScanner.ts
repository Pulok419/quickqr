import jsQR from 'jsqr';

export type DecodedPayloadKind = 'url' | 'wifi' | 'email' | 'phone' | 'sms' | 'text';

export interface ParsedQRPayload {
  kind: DecodedPayloadKind;
  raw: string;
  urlDetails?: {
    href: string;
    protocol: string;
    hostname: string;
    pathname: string;
    search: string;
    isHttps: boolean;
  };
  wifiDetails?: {
    ssid: string;
    encryption: string;
    password: string;
    hidden: boolean;
  };
  emailDetails?: {
    to: string;
    subject?: string;
    body?: string;
  };
  phoneDetails?: {
    number: string;
  };
  smsDetails?: {
    number: string;
    message?: string;
  };
  isPotentiallyUnsafeScheme?: boolean;
}

/**
 * Unescapes ZXing Wi-Fi escaped characters
 */
function unescapeWifiValue(val: string): string {
  return val.replace(/\\([\\;,:"])/g, '$1');
}

/**
 * Parses a raw QR decoded string into structured preview data
 */
export function parseDecodedPayload(raw: string): ParsedQRPayload {
  const trimmed = raw.trim();

  // Check for unsafe URI schemes (never allow clickable execution)
  if (/^(javascript|vbscript|data):/i.test(trimmed)) {
    return {
      kind: 'text',
      raw,
      isPotentiallyUnsafeScheme: true,
    };
  }

  // HTTP / HTTPS URL check
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return {
          kind: 'url',
          raw,
          urlDetails: {
            href: parsed.href,
            protocol: parsed.protocol,
            hostname: parsed.hostname,
            pathname: parsed.pathname,
            search: parsed.search,
            isHttps: parsed.protocol === 'https:',
          },
        };
      }
    } catch {
      // Fallback to plain text if invalid URL syntax
    }
  }

  // Wi-Fi QR format (WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<PASS>;H:<true|false>;;)
  if (/^WIFI:/i.test(trimmed)) {
    const body = trimmed.slice(5);
    const getField = (key: string) => {
      const regex = new RegExp(`(?:^|;)${key}:((?:\\\\.|[^;])*)`, 'i');
      const match = body.match(regex);
      return match ? unescapeWifiValue(match[1]) : '';
    };

    const ssid = getField('S');
    const encryption = getField('T') || 'nopass';
    const password = getField('P');
    const hidden = getField('H').toLowerCase() === 'true';

    if (ssid) {
      return {
        kind: 'wifi',
        raw,
        wifiDetails: {
          ssid,
          encryption,
          password,
          hidden,
        },
      };
    }
  }

  // Email format (mailto:...)
  if (/^mailto:/i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const to = decodeURIComponent(url.pathname);
      const subject = url.searchParams.get('subject') || undefined;
      const body = url.searchParams.get('body') || undefined;
      return {
        kind: 'email',
        raw,
        emailDetails: { to, subject, body },
      };
    } catch {
      const to = trimmed.slice(7).split('?')[0];
      return {
        kind: 'email',
        raw,
        emailDetails: { to },
      };
    }
  }

  // Phone format (tel:...)
  if (/^tel:/i.test(trimmed)) {
    return {
      kind: 'phone',
      raw,
      phoneDetails: {
        number: trimmed.slice(4),
      },
    };
  }

  // SMS format (sms:... or smsto:...)
  if (/^smsto?:/i.test(trimmed)) {
    const withoutScheme = trimmed.replace(/^smsto?:/i, '');
    const [addrPart, queryPart] = withoutScheme.split('?');
    let number = addrPart;
    let message = '';

    if (addrPart.includes(':')) {
      const idx = addrPart.indexOf(':');
      number = addrPart.slice(0, idx);
      message = addrPart.slice(idx + 1);
    } else if (queryPart) {
      const params = new URLSearchParams(queryPart);
      message = params.get('body') || '';
    }

    return {
      kind: 'sms',
      raw,
      smsDetails: {
        number,
        message: message || undefined,
      },
    };
  }

  return {
    kind: 'text',
    raw,
  };
}

/**
 * Loads an image element from a Data URL
 */
function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode the selected image file. Please try a PNG, JPG, or WebP image.'));
    img.src = dataUrl;
  });
}

/**
 * Attempts jsQR detection on an image drawn onto an offscreen canvas at a given scale
 */
function tryDecodeAtDimensions(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  paddingPx: number = 0
): string | null {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth + paddingPx * 2;
  canvas.height = targetHeight + paddingPx * 2;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  // Fill white quiet-zone padding in case image QR touches the edge or has transparency
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, paddingPx, paddingPx, targetWidth, targetHeight);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });

  return result?.data ?? null;
}

/**
 * Reads an uploaded image File strictly locally and decodes any QR code inside it.
 */
export async function decodeQRFromImageFile(file: File): Promise<{
  decodedText: string;
  previewDataUrl: string;
}> {
  const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg'];
  const lowerName = file.name.toLowerCase();
  const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));
  const hasValidMime = file.type.startsWith('image/');

  if (!hasValidExt && !hasValidMime) {
    throw new Error('Unsupported file format. Please upload a PNG, JPG, JPEG, WebP, GIF, or SVG image.');
  }

  const maxSizeBytes = 10 * 1024 * 1024; // 10 MB limit for photos/posters
  if (file.size > maxSizeBytes) {
    throw new Error(`Image file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select an image under 10 MB.`);
  }

  const previewDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result;
      if (typeof res === 'string') resolve(res);
      else reject(new Error('Failed to read image data locally.'));
    };
    reader.onerror = () => reject(new Error('Unable to read the selected file.'));
    reader.readAsDataURL(file);
  });

  const img = await loadImageFromDataUrl(previewDataUrl);
  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;

  if (!naturalW || !naturalH) {
    throw new Error('Image dimensions could not be read.');
  }

  // Try multiple resolutions + quiet-zone padding for maximum detection reliability
  const maxDims = [naturalW, 1200, 800, 500];
  const triedSizes = new Set<number>();

  for (const maxDim of maxDims) {
    const scale = Math.min(1, maxDim / Math.max(naturalW, naturalH));
    const w = Math.max(64, Math.round(naturalW * scale));
    const h = Math.max(64, Math.round(naturalH * scale));
    if (triedSizes.has(w)) continue;
    triedSizes.add(w);

    const decoded = tryDecodeAtDimensions(img, w, h, 24);
    if (decoded !== null) {
      return { decodedText: decoded, previewDataUrl };
    }
  }

  throw new Error('No QR code was detected in this image. Ensure the QR code is sharp, unobstructed, and has enough contrast.');
}

/**
 * Decodes a single frame from an active HTMLVideoElement onto a reusable canvas.
 */
export function decodeQRFromVideoFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): string | null {
  if (video.readyState < video.HAVE_ENOUGH_DATA || !video.videoWidth || !video.videoHeight) {
    return null;
  }

  // Scale down very high-res webcam streams for fast, low-CPU real-time scanning
  const maxScanWidth = 720;
  const scale = Math.min(1, maxScanWidth / video.videoWidth);
  const w = Math.round(video.videoWidth * scale);
  const h = Math.round(video.videoHeight * scale);

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const code = jsQR(imageData.data, w, h, {
    inversionAttempts: 'attemptBoth',
  });

  return code?.data ?? null;
}
