import crypto from 'crypto';
import { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'kenny_admin_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Configurable admin password (falls back to secure default)
function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'KennyPalmOil2026!';
}

// Configurable secret salt for HMAC token signing
function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'kenny_palm_oil_secure_admin_session_secret_2026';
}

/**
 * Validates the admin password in constant time to prevent timing attacks.
 */
export function verifyAdminPassword(inputPassword: string): boolean {
  if (!inputPassword || typeof inputPassword !== 'string') {
    return false;
  }

  const expectedPassword = getAdminPassword();
  const inputHash = crypto.createHash('sha256').update(inputPassword).digest();
  const expectedHash = crypto.createHash('sha256').update(expectedPassword).digest();

  return crypto.timingSafeEqual(inputHash, expectedHash);
}

/**
 * Creates an HMAC-signed session token.
 * Token format: timestamp:expiresAt:signature
 */
export function createSessionToken(): { token: string; expiresAt: Date } {
  const now = Date.now();
  const expiresAtMs = now + SESSION_DURATION_MS;
  const payload = `${now}:${expiresAtMs}`;

  const hmac = crypto.createHmac('sha256', getSessionSecret());
  hmac.update(payload);
  const signature = hmac.digest('hex');

  const token = `${payload}:${signature}`;
  return {
    token,
    expiresAt: new Date(expiresAtMs),
  };
}

/**
 * Verifies the validity and expiration of an HMAC-signed session token.
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split(':');
  if (parts.length !== 3) {
    return false;
  }

  const [createdAtStr, expiresAtStr, providedSignature] = parts;
  const createdAt = Number(createdAtStr);
  const expiresAt = Number(expiresAtStr);

  if (Number.isNaN(createdAt) || Number.isNaN(expiresAt)) {
    return false;
  }

  // Check if expired
  if (Date.now() > expiresAt) {
    return false;
  }

  const payload = `${createdAt}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', getSessionSecret());
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');

  try {
    const providedBuffer = Buffer.from(providedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Checks if the request contains a valid admin session cookie.
 */
export function isRequestAdminAuthenticated(req: NextRequest): boolean {
  const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(sessionCookie);
}
