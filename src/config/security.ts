/**
 * =====================================================
 * SECURITY MODULE - MED-AID SAARTHI v2.0
 * =====================================================
 * Handles all cryptographic operations, token management,
 * and security-related utilities.
 * 
 * CRITICAL: This module uses HMAC-SHA256 with server-held keys
 * for all sensitive data hashing.
 * =====================================================
 */

import { createHmac, randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync } from 'crypto';

// =====================================================
// CONFIGURATION
// =====================================================

const CONFIG = {
  // Encryption settings
  ALGORITHM: 'aes-256-gcm' as const,
  KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 16,
  AUTH_TAG_LENGTH: 16,
  SALT_LENGTH: 32,
  
  // PBKDF2 iterations for key derivation
  PBKDF2_ITERATIONS: 100000,
  
  // JWT settings
  JWT_ACCESS_TOKEN_EXPIRY: parseInt(import.meta.env.VITE_JWT_ACCESS_TOKEN_EXPIRY || '900'), // 15 min
  JWT_REFRESH_TOKEN_EXPIRY: parseInt(import.meta.env.VITE_JWT_REFRESH_TOKEN_EXPIRY || '604800'), // 7 days
  
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5'),
  LOCKOUT_DURATION_MS: parseInt(import.meta.env.VITE_LOCKOUT_DURATION_MINUTES || '15') * 60 * 1000,
  
  // Secrets (MUST be loaded from environment)
  MASTER_KEY: import.meta.env.VITE_ENCRYPTION_MASTER_KEY || '',
  AADHAAR_HMAC_SECRET: import.meta.env.VITE_AADHAAR_HMAC_SECRET || '',
  JWT_SECRET: import.meta.env.VITE_JWT_SECRET || '',
  JWT_REFRESH_SECRET: import.meta.env.VITE_JWT_REFRESH_SECRET || '',
};

// Validate required secrets on module load
if (import.meta.env.PROD) {
  if (!CONFIG.MASTER_KEY || CONFIG.MASTER_KEY.length < 64) {
    throw new Error('CRITICAL: VITE_ENCRYPTION_MASTER_KEY must be set and at least 64 characters');
  }
  if (!CONFIG.AADHAAR_HMAC_SECRET || CONFIG.AADHAAR_HMAC_SECRET.length < 64) {
    throw new Error('CRITICAL: VITE_AADHAAR_HMAC_SECRET must be set and at least 64 characters');
  }
  if (!CONFIG.JWT_SECRET || CONFIG.JWT_SECRET.length < 64) {
    throw new Error('CRITICAL: VITE_JWT_SECRET must be set and at least 64 characters');
  }
}

// =====================================================
// HMAC-SHA256 HASHING (ONE-WAY)
// =====================================================

/**
 * Hash sensitive data using HMAC-SHA256 with server-held secret.
 * This is ONE-WAY and cannot be reversed.
 * 
 * Use for: Aadhaar numbers, Health IDs, PAN, Voter ID, etc.
 * 
 * @param data - Sensitive data to hash
 * @param secret - HMAC secret key (defaults to AADHAAR_HMAC_SECRET)
 * @returns Hex-encoded HMAC hash
 */
export function hmacHash(data: string, secret: string = CONFIG.AADHAAR_HMAC_SECRET): string {
  if (!data) throw new Error('Data to hash cannot be empty');
  if (!secret) throw new Error('HMAC secret not configured');
  
  const hmac = createHmac('sha256', secret);
  hmac.update(data);
  return hmac.digest('hex');
}

/**
 * Hash Aadhaar number (12 digits) using HMAC-SHA256.
 * Returns only the hash and last 4 digits for display.
 * 
 * @param aadhaarNumber - 12-digit Aadhaar number
 * @returns Object with hash and last4 digits
 */
export function hashAadhaar(aadhaarNumber: string): {
  hash: string;
  last4: string;
  masked: string;
} {
  // Validate Aadhaar format
  const cleaned = aadhaarNumber.replace(/\s/g, '');
  if (!/^\d{12}$/.test(cleaned)) {
    throw new Error('Invalid Aadhaar number format');
  }
  
  return {
    hash: hmacHash(cleaned),
    last4: cleaned.slice(-4),
    masked: `XXXX-XXXX-${cleaned.slice(-4)}`,
  };
}

/**
 * Hash Health ID using HMAC-SHA256.
 * 
 * @param healthId - 14-digit Health ID
 * @returns Object with hash and last4 digits
 */
export function hashHealthId(healthId: string): {
  hash: string;
  last4: string;
  masked: string;
} {
  const cleaned = healthId.replace(/[-\s]/g, '');
  if (!/^\d{14}$/.test(cleaned)) {
    throw new Error('Invalid Health ID format');
  }
  
  return {
    hash: hmacHash(cleaned),
    last4: cleaned.slice(-4),
    masked: `XXXX-XXXX-XXXX-${cleaned.slice(-2)}`,
  };
}

/**
 * Hash government document numbers (PAN, Voter ID, etc.)
 * 
 * @param docNumber - Document number
 * @param docType - Type of document
 * @returns Object with hash and masked version
 */
export function hashDocument(
  docNumber: string,
  docType: 'pan' | 'voter_id' | 'passport' | 'driving_license'
): {
  hash: string;
  masked: string;
} {
  const cleaned = docNumber.toUpperCase().replace(/\s/g, '');
  
  // Validate format based on type
  const formats: Record<string, RegExp> = {
    pan: /^[A-Z]{5}\d{4}[A-Z]$/,
    voter_id: /^[A-Z]{3}\d{7}$/,
    passport: /^[A-Z]\d{7}$/,
    driving_license: /^[A-Z]{2}\d{13}$/,
  };
  
  if (!formats[docType]?.test(cleaned)) {
    throw new Error(`Invalid ${docType} format`);
  }
  
  // Create masked version
  let masked: string;
  switch (docType) {
    case 'pan':
      masked = `${cleaned.slice(0, 2)}XXX${cleaned.slice(-2)}`;
      break;
    case 'voter_id':
      masked = `${cleaned.slice(0, 3)}XXXX${cleaned.slice(-3)}`;
      break;
    case 'passport':
      masked = `${cleaned[0]}XXXX${cleaned.slice(-2)}`;
      break;
    case 'driving_license':
      masked = `${cleaned.slice(0, 4)}XXXXX${cleaned.slice(-4)}`;
      break;
    default:
      masked = 'XXXX';
  }
  
  return {
    hash: hmacHash(cleaned),
    masked,
  };
}

// =====================================================
// ENVELOPE ENCRYPTION (TWO-WAY)
// =====================================================

/**
 * Envelope encryption: Encrypt data with a randomly generated data key,
 * then encrypt the data key with the master key.
 * 
 * This allows key rotation without re-encrypting all data.
 * 
 * Use for: PHI (Personal Health Information), medical records, prescriptions
 * 
 * @param plaintext - Data to encrypt
 * @returns Object with encrypted data and encrypted key
 */
export function encryptWithEnvelope(plaintext: string): {
  encryptedData: string;
  encryptedKey: string;
  iv: string;
  authTag: string;
} {
  if (!plaintext) throw new Error('Plaintext cannot be empty');
  if (!CONFIG.MASTER_KEY) throw new Error('Master key not configured');
  
  // Generate random data encryption key (DEK)
  const dataKey = randomBytes(CONFIG.KEY_LENGTH);
  
  // Generate random IV for data encryption
  const iv = randomBytes(CONFIG.IV_LENGTH);
  
  // Encrypt data with DEK
  const cipher = createCipheriv(CONFIG.ALGORITHM, dataKey, iv);
  let encryptedData = cipher.update(plaintext, 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  // Encrypt DEK with master key
  const masterKeyBuffer = Buffer.from(CONFIG.MASTER_KEY, 'hex');
  const keyIv = randomBytes(CONFIG.IV_LENGTH);
  const keyCipher = createCipheriv(CONFIG.ALGORITHM, masterKeyBuffer, keyIv);
  let encryptedKey = keyCipher.update(dataKey);
  encryptedKey = Buffer.concat([encryptedKey, keyCipher.final()]);
  const keyAuthTag = keyCipher.getAuthTag();
  
  return {
    encryptedData,
    encryptedKey: Buffer.concat([keyIv, encryptedKey, keyAuthTag]).toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt envelope-encrypted data.
 * 
 * @param encryptedData - Encrypted data (hex)
 * @param encryptedKey - Encrypted data key (hex)
 * @param iv - Initialization vector (hex)
 * @param authTag - Authentication tag (hex)
 * @returns Decrypted plaintext
 */
export function decryptWithEnvelope(
  encryptedData: string,
  encryptedKey: string,
  iv: string,
  authTag: string
): string {
  if (!CONFIG.MASTER_KEY) throw new Error('Master key not configured');
  
  // Parse encrypted key components
  const encryptedKeyBuffer = Buffer.from(encryptedKey, 'hex');
  const keyIv = encryptedKeyBuffer.subarray(0, CONFIG.IV_LENGTH);
  const keyAuthTag = encryptedKeyBuffer.subarray(-CONFIG.AUTH_TAG_LENGTH);
  const encryptedKeyData = encryptedKeyBuffer.subarray(CONFIG.IV_LENGTH, -CONFIG.AUTH_TAG_LENGTH);
  
  // Decrypt DEK with master key
  const masterKeyBuffer = Buffer.from(CONFIG.MASTER_KEY, 'hex');
  const keyDecipher = createDecipheriv(CONFIG.ALGORITHM, masterKeyBuffer, keyIv);
  keyDecipher.setAuthTag(keyAuthTag);
  let dataKey = keyDecipher.update(encryptedKeyData);
  dataKey = Buffer.concat([dataKey, keyDecipher.final()]);
  
  // Decrypt data with DEK
  const decipher = createDecipheriv(CONFIG.ALGORITHM, dataKey, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// =====================================================
// JWT TOKEN MANAGEMENT
// =====================================================

interface TokenPayload {
  userId: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'asha' | 'official';
  sessionId: string;
}

/**
 * Generate JWT access token (short-lived, 15 minutes).
 * 
 * @param payload - Token payload
 * @returns JWT token string
 */
export function generateAccessToken(payload: TokenPayload): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  
  const claims = {
    ...payload,
    iat: now,
    exp: now + CONFIG.JWT_ACCESS_TOKEN_EXPIRY,
    iss: 'medaid-saarthi',
  };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  
  const signature = createHmac('sha256', CONFIG.JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Generate JWT refresh token (long-lived, 7 days).
 * 
 * @param payload - Token payload
 * @returns JWT token string
 */
export function generateRefreshToken(payload: TokenPayload): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  
  const claims = {
    userId: payload.userId,
    sessionId: payload.sessionId,
    iat: now,
    exp: now + CONFIG.JWT_REFRESH_TOKEN_EXPIRY,
    iss: 'medaid-saarthi',
    type: 'refresh',
  };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  
  const signature = createHmac('sha256', CONFIG.JWT_REFRESH_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify JWT token and return payload.
 * 
 * @param token - JWT token string
 * @param isRefreshToken - Whether this is a refresh token
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string, isRefreshToken: boolean = false): TokenPayload | null {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    const secret = isRefreshToken ? CONFIG.JWT_REFRESH_SECRET : CONFIG.JWT_SECRET;
    const expectedSignature = createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    
    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

// =====================================================
// RATE LIMITING & BRUTE FORCE PROTECTION
// =====================================================

interface LoginAttempt {
  count: number;
  lockedUntil: number | null;
}

const loginAttempts = new Map<string, LoginAttempt>();

/**
 * Track failed login attempt.
 * 
 * @param identifier - Email or IP address
 * @returns Whether the account is locked
 */
export function trackFailedLogin(identifier: string): { locked: boolean; remainingAttempts: number } {
  const attempt = loginAttempts.get(identifier) || { count: 0, lockedUntil: null };
  
  // Check if currently locked
  if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
    return {
      locked: true,
      remainingAttempts: 0,
    };
  }
  
  // Increment count
  attempt.count += 1;
  
  // Lock if exceeded max attempts
  if (attempt.count >= CONFIG.MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = Date.now() + CONFIG.LOCKOUT_DURATION_MS;
    loginAttempts.set(identifier, attempt);
    return {
      locked: true,
      remainingAttempts: 0,
    };
  }
  
  loginAttempts.set(identifier, attempt);
  return {
    locked: false,
    remainingAttempts: CONFIG.MAX_LOGIN_ATTEMPTS - attempt.count,
  };
}

/**
 * Reset login attempts on successful login.
 * 
 * @param identifier - Email or IP address
 */
export function resetLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

/**
 * Check if identifier is currently locked.
 * 
 * @param identifier - Email or IP address
 * @returns Whether locked and minutes remaining
 */
export function isLocked(identifier: string): { locked: boolean; minutesRemaining: number } {
  const attempt = loginAttempts.get(identifier);
  
  if (!attempt?.lockedUntil || Date.now() >= attempt.lockedUntil) {
    return { locked: false, minutesRemaining: 0 };
  }
  
  const minutesRemaining = Math.ceil((attempt.lockedUntil - Date.now()) / 60000);
  return { locked: true, minutesRemaining };
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Generate cryptographically secure random string.
 * 
 * @param length - Length of string
 * @returns Random hex string
 */
export function generateSecureRandom(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate session ID.
 * 
 * @returns Session ID string
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${generateSecureRandom(16)}`;
}

/**
 * Sanitize input to prevent injection attacks.
 * 
 * @param input - User input
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .slice(0, 1000); // Limit length
}

/**
 * Validate password strength.
 * 
 * @param password - Password to validate
 * @returns Validation result
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain numbers');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain special characters');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// =====================================================
// EXPORTS
// =====================================================

export const Security = {
  // Hashing
  hmacHash,
  hashAadhaar,
  hashHealthId,
  hashDocument,
  
  // Encryption
  encryptWithEnvelope,
  decryptWithEnvelope,
  
  // JWT
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  
  // Rate limiting
  trackFailedLogin,
  resetLoginAttempts,
  isLocked,
  
  // Utilities
  generateSecureRandom,
  generateSessionId,
  sanitizeInput,
  validatePasswordStrength,
  
  // Constants
  CONFIG,
};

export default Security;
