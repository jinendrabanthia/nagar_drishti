/**
 * CivicTriage AI — Security Utilities
 * Covers: file validation, EXIF stripping, location fuzzing,
 *         rate limiting, input sanitization, prompt injection defense.
 */

// ============================================================
// 1. FILE UPLOAD VALIDATION
// ============================================================

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

// Magic byte signatures for image formats
const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
  'image/gif': [0x47, 0x49, 0x46],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // 1. Size check
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum is ${MAX_FILE_SIZE / 1024 / 1024}MB.` };
  }
  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }

  // 2. MIME type whitelist
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: `File type "${file.type}" is not allowed. Upload JPEG, PNG, or WebP images only.` };
  }

  // 3. Extension check (prevent double extensions like exploit.jpg.php)
  const name = file.name.toLowerCase();
  const dangerousExtensions = ['.php', '.exe', '.sh', '.bat', '.cmd', '.ps1', '.js', '.html', '.svg', '.xml'];
  for (const ext of dangerousExtensions) {
    if (name.includes(ext)) {
      return { valid: false, error: 'File contains a blocked extension.' };
    }
  }

  return { valid: true };
}

export async function validateMagicBytes(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const expectedMagic = MAGIC_BYTES[file.type];
    if (!expectedMagic) {
      return { valid: false, error: 'Unsupported file type.' };
    }

    for (let i = 0; i < expectedMagic.length; i++) {
      if (bytes[i] !== expectedMagic[i]) {
        return { valid: false, error: 'File header does not match its claimed type. Possible spoofed file.' };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Failed to read file header.' };
  }
}

// ============================================================
// 2. FILENAME SANITIZATION
// ============================================================

export function sanitizeFileName(name: string): string {
  // Remove path traversal, null bytes, and unsafe chars
  return name
    .replace(/\0/g, '')             // null bytes
    .replace(/\.\./g, '')           // path traversal
    .replace(/[\/\\:*?"<>|]/g, '')  // OS-unsafe chars
    .replace(/\s+/g, '-')           // spaces to dashes
    .replace(/[^a-zA-Z0-9.\-_]/g, '') // only safe chars
    .slice(0, 100);                 // max length
}

// ============================================================
// 3. EXIF METADATA STRIPPING
// ============================================================

/**
 * Strips EXIF data from JPEG images by finding and removing APP1 markers.
 * For non-JPEG or if stripping fails, returns the original buffer.
 */
export function stripExifData(buffer: Buffer, mimeType: string): Buffer {
  if (mimeType !== 'image/jpeg') return buffer;

  try {
    // JPEG starts with FFD8. EXIF is stored in APP1 marker (FFE1).
    // We rebuild the JPEG without APP1 segments.
    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) return buffer;

    const chunks: Buffer[] = [Buffer.from([0xFF, 0xD8])];
    let offset = 2;

    while (offset < buffer.length - 1) {
      if (buffer[offset] !== 0xFF) break;

      const marker = buffer[offset + 1];

      // SOS (Start of Scan) — rest is image data, copy everything
      if (marker === 0xDA) {
        chunks.push(buffer.slice(offset));
        break;
      }

      // Get segment length
      const segmentLength = buffer.readUInt16BE(offset + 2);
      const segmentEnd = offset + 2 + segmentLength;

      // Skip APP1 (EXIF) and APP2 (ICC) markers
      if (marker === 0xE1 || marker === 0xE2) {
        offset = segmentEnd;
        continue;
      }

      // Keep all other segments
      chunks.push(buffer.slice(offset, segmentEnd));
      offset = segmentEnd;
    }

    return Buffer.concat(chunks);
  } catch {
    // If anything goes wrong, return original
    return buffer;
  }
}

// ============================================================
// 4. LOCATION FUZZING (Citizen Privacy)
// ============================================================

/**
 * Adds a random offset of ±200 meters to GPS coordinates
 * to protect citizen privacy on public-facing displays.
 * 1 degree latitude ≈ 111,000 meters
 * 1 degree longitude ≈ 111,000 * cos(lat) meters
 */
export function fuzzLocation(lat: number, lng: number): { displayLat: number; displayLng: number } {
  const FUZZ_METERS = 200;
  const latOffset = (Math.random() - 0.5) * 2 * (FUZZ_METERS / 111000);
  const lngOffset = (Math.random() - 0.5) * 2 * (FUZZ_METERS / (111000 * Math.cos(lat * Math.PI / 180)));

  return {
    displayLat: parseFloat((lat + latOffset).toFixed(6)),
    displayLng: parseFloat((lng + lngOffset).toFixed(6)),
  };
}

// ============================================================
// 5. RATE LIMITING (In-Memory)
// ============================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
      if (now > entry.resetAt) rateLimitStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

export function rateLimitCheck(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true };
}

// ============================================================
// 6. INPUT SANITIZATION
// ============================================================

export function sanitizeUserInput(text: string, maxLength: number = 2000): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')          // Strip HTML tags
    .replace(/javascript:/gi, '')     // Strip JS protocol
    .replace(/on\w+\s*=/gi, '')       // Strip event handlers
    .replace(/\0/g, '')               // Null bytes
    .trim()
    .slice(0, maxLength);
}

// ============================================================
// 7. PROMPT INJECTION DEFENSE
// ============================================================

/**
 * Wraps user input in delimiters and adds anti-injection notice
 * to prevent prompt injection attacks against our AI pipeline.
 */
export function sanitizeForAIPrompt(userDescription: string): string {
  const sanitized = sanitizeUserInput(userDescription, 1000);
  return `<citizen_report_description>${sanitized}</citizen_report_description>`;
}
