/**
 * =====================================================
 * NDHM/ABDM ADAPTER - MED-AID SAARTHI v2.0
 * =====================================================
 * Integration with National Digital Health Mission (NDHM)
 * now known as Ayushman Bharat Digital Mission (ABDM).
 * 
 * Features:
 * - ABHA number generation
 * - Health record linking
 * - Consent management
 * - Data exchange with healthcare providers
 * 
 * Documentation: https://abdm.gov.in/
 * Sandbox: https://sandbox.abdm.gov.in/
 * =====================================================
 */

import { createHmac } from 'crypto';
import { logger } from '@/config/privacy';

// =====================================================
// CONFIGURATION
// =====================================================

const CONFIG = {
  BASE_URL: import.meta.env.VITE_NDHM_BASE_URL || 'https://dev.abdm.gov.in',
  CLIENT_ID: import.meta.env.VITE_NDHM_CLIENT_ID || '',
  CLIENT_SECRET: import.meta.env.VITE_NDHM_CLIENT_SECRET || '',
  FACILITY_ID: import.meta.env.VITE_NDHM_FACILITY_ID || '',
  HIP_ID: import.meta.env.VITE_NDHM_HIP_ID || '', // Health Information Provider ID
  
  // API endpoints
  ENDPOINTS: {
    AUTH: '/v1/auth/init',
    ABHA_CREATE: '/v1/registration/aadhaar/createHealthId',
    ABHA_LINK: '/v1/registration/aadhaar/linkHealthId',
    CONSENT_REQUEST: '/v1/consent-requests/init',
    HEALTH_INFO_TRANSFER: '/v1/health-information/transfer',
  },
  
  // Rate limiting
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  TIMEOUT_MS: 30000,
};

// =====================================================
// AUTHENTICATION
// =====================================================

let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Generate signed request headers for ABDM API.
 * 
 * @param requestBody - Request payload
 * @returns Signed headers
 */
function generateSignedHeaders(requestBody: string): Record<string, string> {
  const timestamp = new Date().toISOString();
  const signature = createHmac('sha256', CONFIG.CLIENT_SECRET)
    .update(`${timestamp}${requestBody}`)
    .digest('base64');
  
  return {
    'Content-Type': 'application/json',
    'X-CM-ID': CONFIG.CLIENT_ID,
    'X-Timestamp': timestamp,
    'X-Signature': signature,
    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
  };
}

/**
 * Authenticate with ABDM gateway.
 * 
 * @returns Access token
 */
async function authenticate(): Promise<string> {
  // Check if token is still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }
  
  try {
    const requestBody = JSON.stringify({
      clientId: CONFIG.CLIENT_ID,
      clientSecret: CONFIG.CLIENT_SECRET,
    });
    
    const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.AUTH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    
    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    accessToken = data.accessToken;
    tokenExpiry = Date.now() + (data.expiresIn * 1000) - 60000; // Refresh 1 min early
    
    logger.info('ABDM authentication successful');
    return accessToken;
  } catch (error) {
    logger.error('ABDM authentication failed', { error });
    throw new Error('Failed to authenticate with ABDM gateway');
  }
}

// =====================================================
// ABHA NUMBER GENERATION
// =====================================================

export interface ABHACreateRequest {
  aadhaarNumber: string;
  otp?: string;
  transactionId?: string;
}

export interface ABHAResponse {
  success: boolean;
  abhaNumber?: string;
  abhaAddress?: string;
  transactionId?: string;
  error?: string;
}

/**
 * Initiate ABHA number creation using Aadhaar.
 * 
 * Step 1: Send Aadhaar number to get OTP
 * 
 * @param aadhaarNumber - 12-digit Aadhaar number
 * @returns Transaction ID for OTP verification
 */
export async function initiateABHACreation(aadhaarNumber: string): Promise<ABHAResponse> {
  // Validate Aadhaar format
  const cleaned = aadhaarNumber.replace(/\s/g, '');
  if (!/^\d{12}$/.test(cleaned)) {
    return {
      success: false,
      error: 'Invalid Aadhaar number format',
    };
  }
  
  try {
    await authenticate();
    
    const requestBody = JSON.stringify({
      aadhaar: cleaned,
    });
    
    const headers = generateSignedHeaders(requestBody);
    
    const response = await fetch(
      `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.ABHA_CREATE}`,
      {
        method: 'POST',
        headers,
        body: requestBody,
        signal: AbortSignal.timeout(CONFIG.TIMEOUT_MS),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || response.statusText);
    }
    
    const data = await response.json();
    
    logger.info('ABHA creation initiated', { transactionId: data.txnId });
    
    return {
      success: true,
      transactionId: data.txnId,
    };
  } catch (error) {
    logger.error('ABHA creation initiation failed', { error });
    
    // Handle rate limiting
    if (error instanceof Error && error.message.includes('429')) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Complete ABHA number creation using OTP.
 * 
 * Step 2: Verify OTP and create ABHA number
 * 
 * @param transactionId - Transaction ID from step 1
 * @param otp - 6-digit OTP
 * @returns ABHA number and address
 */
export async function completeABHACreation(
  transactionId: string,
  otp: string
): Promise<ABHAResponse> {
  try {
    await authenticate();
    
    const requestBody = JSON.stringify({
      txnId: transactionId,
      otp,
    });
    
    const headers = generateSignedHeaders(requestBody);
    
    const response = await fetch(
      `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.ABHA_CREATE}/verifyOTP`,
      {
        method: 'POST',
        headers,
        body: requestBody,
        signal: AbortSignal.timeout(CONFIG.TIMEOUT_MS),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || response.statusText);
    }
    
    const data = await response.json();
    
    logger.info('ABHA creation completed', { abhaNumber: data.healthIdNumber });
    
    return {
      success: true,
      abhaNumber: data.healthIdNumber,
      abhaAddress: data.healthId,
    };
  } catch (error) {
    logger.error('ABHA creation completion failed', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// HEALTH RECORD LINKING
// =====================================================

export interface HealthRecordLinkRequest {
  abhaNumber: string;
  abhaAddress: string;
  patientId: string;
  consentId: string;
}

/**
 * Link health records to ABHA number.
 * 
 * @param request - Link request details
 * @returns Success status
 */
export async function linkHealthRecords(
  request: HealthRecordLinkRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    await authenticate();
    
    const requestBody = JSON.stringify({
      healthId: request.abhaAddress,
      healthIdNumber: request.abhaNumber,
      patientReference: request.patientId,
      consentId: request.consentId,
    });
    
    const headers = generateSignedHeaders(requestBody);
    
    const response = await fetch(
      `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.ABHA_LINK}`,
      {
        method: 'POST',
        headers,
        body: requestBody,
        signal: AbortSignal.timeout(CONFIG.TIMEOUT_MS),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || response.statusText);
    }
    
    logger.info('Health records linked successfully', { abhaNumber: request.abhaNumber });
    
    return { success: true };
  } catch (error) {
    logger.error('Health record linking failed', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// CONSENT MANAGEMENT
// =====================================================

export interface ConsentRequest {
  patientAbhaNumber: string;
  providerHipId: string;
  purpose: 'CAREMGT' | 'RESEARCH' | 'PATRQT';
  hiTypes: string[]; // ['Prescription', 'DiagnosticReport', 'OPConsultation']
  dateRange: {
    from: string; // ISO date
    to: string;
  };
  expiryDate: string;
}

/**
 * Request patient consent for health data access.
 * 
 * @param request - Consent request details
 * @returns Consent request ID
 */
export async function requestHealthDataConsent(
  request: ConsentRequest
): Promise<{ success: boolean; consentRequestId?: string; error?: string }> {
  try {
    await authenticate();
    
    const requestBody = JSON.stringify({
      requestId: `REQ_${Date.now()}`,
      timestamp: new Date().toISOString(),
      consent: {
        purpose: {
          code: request.purpose,
        },
        patient: {
          id: request.patientAbhaNumber,
        },
        hiu: {
          id: CONFIG.FACILITY_ID,
        },
        requester: {
          name: 'MED-AID SAARTHI',
          identifier: {
            type: 'REGNO',
            value: CONFIG.FACILITY_ID,
          },
        },
        hiTypes: request.hiTypes,
        permission: {
          accessMode: 'VIEW',
          dateRange: request.dateRange,
          dataEraseAt: request.expiryDate,
          frequency: {
            unit: 'HOUR',
            value: 1,
            repeats: 0,
          },
        },
      },
    });
    
    const headers = generateSignedHeaders(requestBody);
    
    const response = await fetch(
      `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.CONSENT_REQUEST}`,
      {
        method: 'POST',
        headers,
        body: requestBody,
        signal: AbortSignal.timeout(CONFIG.TIMEOUT_MS),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || response.statusText);
    }
    
    const data = await response.json();
    
    logger.info('Consent request created', { consentRequestId: data.consentRequestId });
    
    return {
      success: true,
      consentRequestId: data.consentRequestId,
    };
  } catch (error) {
    logger.error('Consent request failed', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// MOCK/SANDBOX MODE
// =====================================================

/**
 * Mock ABHA creation for testing (sandbox mode).
 * 
 * @param aadhaarNumber - Aadhaar number
 * @returns Mock ABHA response
 */
export function mockABHACreation(aadhaarNumber: string): ABHAResponse {
  const cleaned = aadhaarNumber.replace(/\s/g, '');
  
  if (!/^\d{12}$/.test(cleaned)) {
    return {
      success: false,
      error: 'Invalid Aadhaar number format',
    };
  }
  
  // Generate mock ABHA number (14 digits)
  const mockABHA = `${Date.now()}`.slice(-14);
  const mockAddress = `user${cleaned.slice(-4)}@abdm`;
  
  logger.info('Mock ABHA creation', { abhaNumber: mockABHA });
  
  return {
    success: true,
    abhaNumber: mockABHA,
    abhaAddress: mockAddress,
  };
}

// =====================================================
// ERROR HANDLING & RETRY LOGIC
// =====================================================

/**
 * Retry failed API calls with exponential backoff.
 * 
 * @param fn - Function to retry
 * @param maxRetries - Maximum retry attempts
 * @returns Function result
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = CONFIG.MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on client errors (4xx)
      if (lastError.message.includes('400') || lastError.message.includes('401')) {
        throw lastError;
      }
      
      // Exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt);
        logger.warn(`Retrying API call (attempt ${attempt + 1}/${maxRetries})`, { delay });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

// =====================================================
// HEALTH CHECK
// =====================================================

/**
 * Check ABDM gateway connectivity.
 * 
 * @returns Gateway status
 */
export async function checkABDMStatus(): Promise<{
  available: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    
    const latency = Date.now() - startTime;
    
    if (response.ok) {
      return { available: true, latency };
    }
    
    return {
      available: false,
      error: `Gateway returned ${response.status}`,
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// EXPORTS
// =====================================================

export const NDHM = {
  // ABHA creation
  initiateABHACreation,
  completeABHACreation,
  mockABHACreation,
  
  // Health records
  linkHealthRecords,
  
  // Consent
  requestHealthDataConsent,
  
  // Utilities
  checkABDMStatus,
  authenticate,
  
  // Config
  CONFIG,
};

export default NDHM;
