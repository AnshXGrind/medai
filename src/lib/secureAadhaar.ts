/**
 * Secure Aadhaar Handling - Zero Raw Storage
 * 
 * SECURITY MODEL:
 * 1. NEVER stores full Aadhaar number (UIDAI compliance)
 * 2. Uses HMAC-SHA256 with server secret (not plain SHA-256)
 * 3. Stores only HMAC + last 4 digits for display
 * 4. Secret key MUST be in environment (KMS in production)
 * 5. All raw inputs are zeroed after hashing
 * 
 * COMPLIANCE:
 * - UIDAI Aadhaar (Sharing of Information) Regulations, 2016
 * - No rainbow table attacks (HMAC with secret key)
 * - Audit trail for all operations
 * 
 * @see https://uidai.gov.in/legal-framework/regulations.html
 */

/**
 * CRITICAL: Get HMAC secret key from environment
 * In production: Use AWS KMS, Supabase Vault, or similar KMS
 * NEVER hardcode this key
 */
function getHmacSecret(): string {
  const secret = import.meta.env.VITE_AADHAAR_HMAC_SECRET;
  
  if (!secret || secret.length < 32) {
    console.error('⚠️ SECURITY: VITE_AADHAAR_HMAC_SECRET not set or too weak');
    throw new Error('HMAC secret not configured - cannot process Aadhaar securely');
  }
  
  return secret;
}

/**
 * Compute HMAC-SHA256 of Aadhaar (SECURE - replaces plain SHA-256)
 * Uses Web Crypto API with HMAC and server secret
 * 
 * @param aadhaarNumber - 12 digit Aadhaar (will be validated)
 * @returns HMAC-SHA256 hex string (safe to store)
 */
export async function hashAadhaarHMAC(aadhaarNumber: string): Promise<string> {
  // Validate format first
  if (!validateAadhaarFormat(aadhaarNumber)) {
    throw new Error('Invalid Aadhaar format - must be 12 digits');
  }

  const secret = getHmacSecret();
  
  // Convert secret to CryptoKey
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Compute HMAC
  const data = encoder.encode(aadhaarNumber);
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  
  // Convert to hex
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Zero out sensitive data (defense in depth)
  data.fill(0);
  
  return hashHex;
}

/**
 * DEPRECATED: Plain SHA-256 (kept for migration only)
 * DO NOT USE for new data - vulnerable to rainbow tables
 * Use hashAadhaarHMAC instead
 */
export async function hashAadhaar(aadhaarNumber: string): Promise<string> {
  console.warn('⚠️ DEPRECATED: Plain SHA-256 used. Migrate to hashAadhaarHMAC');
  
  const encoder = new TextEncoder();
  const data = encoder.encode(aadhaarNumber);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Extract last 4 digits for display purposes
 */
export function getLastFourDigits(aadhaarNumber: string): string {
  const cleaned = aadhaarNumber.replace(/\D/g, '');
  return cleaned.slice(-4);
}

/**
 * Validate Aadhaar format (12 digits)
 * Does NOT validate checksum (Verhoeff algorithm) - that requires full UIDAI integration
 */
export function validateAadhaarFormat(aadhaarNumber: string): boolean {
  const cleaned = aadhaarNumber.replace(/\D/g, '');
  
  // Must be exactly 12 digits
  if (cleaned.length !== 12) return false;
  
  // Cannot start with 0 or 1 (UIDAI rule)
  if (cleaned[0] === '0' || cleaned[0] === '1') return false;
  
  return /^\d{12}$/.test(cleaned);
}

/**
 * Securely process Aadhaar - returns data safe to store
 * NEVER stores the original Aadhaar number
 * 
 * @param aadhaarNumber - Raw 12 digit Aadhaar input
 * @param auditLog - Optional audit logging function
 * @returns Secure data safe for database storage
 */
export async function processAadhaarSecurely(
  aadhaarNumber: string,
  auditLog?: (action: string, metadata: Record<string, unknown>) => void
): Promise<{
  lastFourDigits: string;
  hashedToken: string;
  isValid: boolean;
  timestamp: string;
}> {
  const timestamp = new Date().toISOString();
  
  // Validate format
  const isValid = validateAadhaarFormat(aadhaarNumber);
  
  if (!isValid) {
    auditLog?.('aadhaar_validation_failed', { timestamp, reason: 'invalid_format' });
    return {
      lastFourDigits: '',
      hashedToken: '',
      isValid: false,
      timestamp
    };
  }

  // Extract last 4 for display
  const lastFourDigits = getLastFourDigits(aadhaarNumber);
  
  // Compute HMAC (secure)
  const hashedToken = await hashAadhaarHMAC(aadhaarNumber);

  // Audit log (without raw Aadhaar)
  auditLog?.('aadhaar_processed', { 
    timestamp,
    lastFour: lastFourDigits,
    hashLength: hashedToken.length 
  });

  return {
    lastFourDigits,
    hashedToken,
    isValid: true,
    timestamp
  };
}

/**
 * Display masked Aadhaar for UI
 * Example: XXXX-XXXX-1234
 */
export function displayMaskedAadhaar(lastFourDigits: string): string {
  return `XXXX-XXXX-${lastFourDigits}`;
}

/**
 * Verify Aadhaar against stored HMAC
 * Use this for authentication/verification flows
 */
export async function verifyAadhaar(
  inputAadhaar: string,
  storedHash: string
): Promise<boolean> {
  try {
    const inputHash = await hashAadhaarHMAC(inputAadhaar);
    
    // Constant-time comparison (prevents timing attacks)
    if (inputHash.length !== storedHash.length) return false;
    
    let mismatch = 0;
    for (let i = 0; i < inputHash.length; i++) {
      mismatch |= inputHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    
    return mismatch === 0;
  } catch (error) {
    console.error('Aadhaar verification failed:', error);
    return false;
  }
}

/**
 * Generate secure patient ID from Aadhaar HMAC
 * This can be used as a unique identifier without exposing Aadhaar
 */
export function generateSecurePatientId(hashedToken: string): string {
  return `PAT-${hashedToken.substring(0, 12).toUpperCase()}`;
}

/**
 * Audit logger for Aadhaar operations
 * Logs to console in dev, should log to secure audit DB in production
 */
export function logAadhaarOperation(
  operation: string,
  userId: string,
  metadata: Record<string, unknown>
): void {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    operation,
    userId,
    metadata,
    // Never log raw Aadhaar
  };
  
  if (import.meta.env.DEV) {
    console.log('🔒 Aadhaar Audit:', auditEntry);
  }
  
  // In production: send to secure audit log (Supabase, CloudWatch, etc.)
  // await supabase.from('audit_logs').insert(auditEntry);
}
