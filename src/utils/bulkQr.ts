import QRCode from 'qrcode';
import JSZip from 'jszip';
import { ErrorCorrectionLevel } from '../types/qr';

export type BulkValidationMode = 'mixed' | 'urls';

export interface BulkStyleConfig {
  size: number;
  fgColor: string;
  bgColor: string;
  errorCorrection: ErrorCorrectionLevel;
  margin: number;
  filenamePrefix: string;
}

export interface BulkParsedLine {
  lineNumber: number;
  rawLine: string;
  content: string;
  suggestedFilename: string;
  isValid: boolean;
  isEmpty?: boolean;
  error?: string;
}

export interface BulkGeneratedItem {
  id: string;
  lineNumber: number;
  content: string;
  filename: string;
  pngDataUrl: string;
}

/**
 * Sanitizes a string into a safe filename slug (without .png extension)
 */
export function sanitizeFilename(input: string, fallback: string = 'qr-code'): string {
  const withoutExt = input.replace(/\.png$/i, '').trim();
  const cleaned = withoutExt
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  return cleaned || fallback;
}

/**
 * Generates a readable default filename from QR content (URL domain/path or text snippet)
 */
export function suggestFilenameFromContent(
  content: string,
  index: number,
  prefix: string = ''
): string {
  const paddedIndex = String(index).padStart(2, '0');
  let slug = '';

  try {
    if (/^https?:\/\//i.test(content)) {
      const parsed = new URL(content);
      const host = parsed.hostname.replace(/^www\./i, '');
      const pathPart = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '';
      slug = `${host}${pathPart}`;
    } else {
      slug = content.slice(0, 32);
    }
  } catch {
    slug = content.slice(0, 32);
  }

  const safeSlug = sanitizeFilename(slug, `item-${paddedIndex}`);
  const safePrefix = prefix.trim() ? `${sanitizeFilename(prefix, 'qr')}-` : '';
  return `${safePrefix}${paddedIndex}-${safeSlug}`;
}

/**
 * Validates and parses raw multiline input (supports optional "content | custom_filename" syntax)
 */
export function parseAndValidateBulkLines(
  rawInput: string,
  mode: BulkValidationMode,
  filenamePrefix: string,
  allowPipeFilenames: boolean = true
): {
  validEntries: BulkParsedLine[];
  invalidEntries: BulkParsedLine[];
  emptyLineCount: number;
  totalNonEmptyLines: number;
} {
  const lines = rawInput.split(/\r?\n/);
  const validEntries: BulkParsedLine[] = [];
  const invalidEntries: BulkParsedLine[] = [];
  let emptyLineCount = 0;
  let validCounter = 0;

  lines.forEach((rawLine, idx) => {
    const lineNumber = idx + 1;
    const trimmed = rawLine.trim();

    if (!trimmed) {
      emptyLineCount += 1;
      return;
    }

    let content = trimmed;
    let customFilename: string | null = null;

    if (allowPipeFilenames && trimmed.includes('|')) {
      const pipeIndex = trimmed.lastIndexOf('|');
      const left = trimmed.slice(0, pipeIndex).trim();
      const right = trimmed.slice(pipeIndex + 1).trim();
      if (left) {
        content = left;
        if (right) {
          customFilename = sanitizeFilename(right, `qr-${lineNumber}`);
        }
      } else {
        invalidEntries.push({
          lineNumber,
          rawLine,
          content: '',
          suggestedFilename: '',
          isValid: false,
          error: 'Empty QR content before "|" separator.',
        });
        return;
      }
    }

    // Check QR byte length capacity (ISO/IEC 18004 conservative safe limit)
    const byteLength = new TextEncoder().encode(content).length;
    if (byteLength > 1800) {
      invalidEntries.push({
        lineNumber,
        rawLine,
        content,
        suggestedFilename: '',
        isValid: false,
        error: `Entry is too long (${byteLength} bytes). Keep entries under 1,800 bytes.`,
      });
      return;
    }

    // URL validation
    if (mode === 'urls') {
      if (/\s/.test(content)) {
        invalidEntries.push({
          lineNumber,
          rawLine,
          content,
          suggestedFilename: '',
          isValid: false,
          error: 'Invalid URL: web addresses cannot contain spaces.',
        });
        return;
      }

      let candidateUrl = content;
      if (!/^https?:\/\//i.test(candidateUrl)) {
        if (/^[a-zA-Z0-9+-.]+:\/\//.test(candidateUrl)) {
          invalidEntries.push({
            lineNumber,
            rawLine,
            content,
            suggestedFilename: '',
            isValid: false,
            error: 'Unsupported URL protocol. Use http:// or https://.',
          });
          return;
        }
        candidateUrl = `https://${candidateUrl}`;
      }

      try {
        const parsed = new URL(candidateUrl);
        const host = parsed.hostname;
        const hasValidHost =
          host === 'localhost' || (host.includes('.') && !host.startsWith('.') && !host.endsWith('.'));
        if (!hasValidHost) {
          invalidEntries.push({
            lineNumber,
            rawLine,
            content,
            suggestedFilename: '',
            isValid: false,
            error: 'Invalid domain name (expected e.g. example.com).',
          });
          return;
        }
        content = parsed.href;
      } catch {
        invalidEntries.push({
          lineNumber,
          rawLine,
          content,
          suggestedFilename: '',
          isValid: false,
          error: 'Malformed URL syntax.',
        });
        return;
      }
    } else if (/^https?:\/\//i.test(content)) {
      // In mixed mode, still catch broken explicit http(s) URLs
      try {
        new URL(content);
      } catch {
        invalidEntries.push({
          lineNumber,
          rawLine,
          content,
          suggestedFilename: '',
          isValid: false,
          error: 'Malformed URL starting with http(s)://.',
        });
        return;
      }
    }

    validCounter += 1;
    const suggestedFilename =
      customFilename || suggestFilenameFromContent(content, validCounter, filenamePrefix);

    validEntries.push({
      lineNumber,
      rawLine,
      content,
      suggestedFilename,
      isValid: true,
    });
  });

  return {
    validEntries,
    invalidEntries,
    emptyLineCount,
    totalNonEmptyLines: validEntries.length + invalidEntries.length,
  };
}

/**
 * Generates an individual QR code PNG Data URL for a single entry locally
 */
export async function generateSingleBulkQR(
  content: string,
  style: BulkStyleConfig
): Promise<string> {
  return QRCode.toDataURL(content, {
    errorCorrectionLevel: style.errorCorrection,
    width: style.size,
    margin: style.margin,
    color: {
      dark: style.fgColor,
      light: style.bgColor,
    },
  });
}

/**
 * Downloads a single generated PNG item
 */
export function downloadSingleBulkPng(item: BulkGeneratedItem): void {
  const safeName = sanitizeFilename(item.filename, `qr-line-${item.lineNumber}`);
  const link = document.createElement('a');
  link.href = item.pngDataUrl;
  link.download = `${safeName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Packages all generated QR PNGs into a single ZIP file in-browser and triggers download
 */
export async function downloadBulkQrZip(
  items: BulkGeneratedItem[],
  zipBaseName: string = 'quickqr-bulk-codes'
): Promise<void> {
  if (items.length === 0) {
    throw new Error('No QR codes available to bundle.');
  }

  const zip = new JSZip();
  const usedNames = new Map<string, number>();

  for (const item of items) {
    const baseName = sanitizeFilename(item.filename, `qr-line-${item.lineNumber}`);
    const count = usedNames.get(baseName) || 0;
    usedNames.set(baseName, count + 1);

    const uniqueName = count === 0 ? baseName : `${baseName}-${count + 1}`;
    const base64Index = item.pngDataUrl.indexOf('base64,');
    if (base64Index === -1) continue;
    const base64Data = item.pngDataUrl.slice(base64Index + 7);

    zip.file(`${uniqueName}.png`, base64Data, { base64: true });
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(blob);
  const safeZipName = sanitizeFilename(zipBaseName, 'quickqr-bulk-codes');
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeZipName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1500);
}
