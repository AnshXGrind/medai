/**
 * Universal Health ID Utilities
 * Generates and validates 14-digit Health IDs in format: XX-XXXX-XXXX-XXXX
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a unique 14-digit Health ID
 * Format: XX-XXXX-XXXX-XXXX
 * First 2 digits: State code
 * Next 4 digits: District code
 * Next 8 digits: Unique number
 */
export async function generateHealthId(stateCode: string = '01'):
  Promise<{ healthId: string; timedOut?: boolean }>
{
  const districtCode = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Generate unique 8-digit number
  let uniqueNumber: string;
  let healthId: string;
  let isUnique = false;
  
  // Try up to 10 times to generate a unique ID. Use a configurable timeout for DB
  // checks so the UI doesn't freeze if the network or Supabase is slow/unavailable.
  const queryWithTimeout = async (healthIdToCheck: string, ms = 3000) => {
    const queryPromise = supabase
      .from('health_ids')
      .select('health_id_number')
      .eq('health_id_number', healthIdToCheck)
      .maybeSingle();

    const timeoutPromise = new Promise<{ data: unknown; error: unknown }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: { timeout: true } }), ms),
    );

    try {
      // Promise.race ensures we don't wait indefinitely for the DB.
      const result = (await Promise.race([queryPromise, timeoutPromise])) as { data: unknown; error: unknown };
      return result;
    } catch (err) {
      return { data: null, error: err };
    }
  };

  let timedOut = false;

  for (let attempt = 0; attempt < 10; attempt++) {
    uniqueNumber = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Format: XX-XXXX-XXXX-XXXX
    const part1 = uniqueNumber.slice(0, 4);
    const part2 = uniqueNumber.slice(4, 8);
    healthId = `${stateCode}-${districtCode}-${part1}-${part2}`;

    // Check if ID already exists (with timeout)
    const { data, error } = await queryWithTimeout(healthId, 3000);

    // If timeout or other DB error, mark timedOut and proceed optimistically
    if (error) {
      const errRec = error as unknown as Record<string, unknown>;
      if ('timeout' in errRec && errRec['timeout'] === true) {
        console.warn('Supabase check timed out, proceeding optimistically');
        timedOut = true;
        isUnique = true;
        break;
      }

      if ('code' in errRec) {
        console.warn('Supabase returned an error, proceeding optimistically', errRec);
        isUnique = true;
        break;
      }
    }

    // If data is null, the ID does not exist and is unique
    if (!data) {
      isUnique = true;
      break;
    }
    // otherwise loop and try another ID
  }
  
  if (!isUnique) {
    throw new Error('Failed to generate unique Health ID after 10 attempts');
  }

  return { healthId: healthId!, timedOut };
}

/**
 * Validate Health ID format
 */
export function isValidHealthId(healthId: string): boolean {
  // Pattern: XX-XXXX-XXXX-XXXX (2-4-4-4 digits)
  const pattern = /^[0-9]{2}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/;
  return pattern.test(healthId);
}

/**
 * Normalize Health ID (remove dashes)
 */
export function normalizeHealthId(healthId: string): string {
  return healthId.replace(/-/g, '');
}

/**
 * Format Health ID (add dashes)
 */
export function formatHealthId(rawId: string): string {
  const normalized = normalizeHealthId(rawId);
  
  if (normalized.length !== 14) {
    throw new Error('Health ID must be exactly 14 digits');
  }
  
  return `${normalized.slice(0, 2)}-${normalized.slice(2, 6)}-${normalized.slice(6, 10)}-${normalized.slice(10, 14)}`;
}

/**
 * Generate QR code data for Health ID
 */
export function generateHealthIdQRData(healthId: string, fullName: string, dob: string): string {
  const data = {
    healthId,
    name: fullName,
    dob,
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  
  return JSON.stringify(data);
}

/**
 * Parse QR code data
 */
export function parseHealthIdQRData(qrData: string): {
  healthId: string;
  name: string;
  dob: string;
  timestamp: string;
  version: string;
} | null {
  try {
    const data = JSON.parse(qrData);
    
    if (!data.healthId || !data.name || !data.dob) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to parse QR code data:', error);
    return null;
  }
}

/**
 * Verify Health ID exists and is active
 */
export async function verifyHealthId(healthId: string): Promise<{
  valid: boolean;
  exists: boolean;
  active: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  if (!isValidHealthId(healthId)) {
    return {
      valid: false,
      exists: false,
      active: false,
      error: 'Invalid Health ID format'
    };
  }
  
  const { data, error } = await supabase
    .from('health_ids')
    .select('*')
    .eq('health_id_number', healthId)
    .single();
  
  if (error) {
    return {
      valid: true,
      exists: false,
      active: false,
      error: 'Health ID not found'
    };
  }
  
  return {
    valid: true,
    exists: true,
    active: data.is_active,
    data: data
  };
}

/**
 * State codes mapping
 */
export const STATE_CODES: Record<string, string> = {
  'Andhra Pradesh': '28',
  'Arunachal Pradesh': '12',
  'Assam': '18',
  'Bihar': '10',
  'Chhattisgarh': '22',
  'Goa': '30',
  'Gujarat': '24',
  'Haryana': '06',
  'Himachal Pradesh': '02',
  'Jharkhand': '20',
  'Karnataka': '29',
  'Kerala': '32',
  'Madhya Pradesh': '23',
  'Maharashtra': '27',
  'Manipur': '14',
  'Meghalaya': '17',
  'Mizoram': '15',
  'Nagaland': '13',
  'Odisha': '21',
  'Punjab': '03',
  'Rajasthan': '08',
  'Sikkim': '11',
  'Tamil Nadu': '33',
  'Telangana': '36',
  'Tripura': '16',
  'Uttar Pradesh': '09',
  'Uttarakhand': '05',
  'West Bengal': '19',
  'Andaman and Nicobar Islands': '35',
  'Chandigarh': '04',
  'Dadra and Nagar Haveli and Daman and Diu': '26',
  'Delhi': '07',
  'Jammu and Kashmir': '01',
  'Ladakh': '37',
  'Lakshadweep': '31',
  'Puducherry': '34'
};

/**
 * Get state code by name
 */
export function getStateCode(stateName: string): string {
  return STATE_CODES[stateName] || '01';
}

/**
 * Get state name by code
 */
export function getStateName(stateCode: string): string {
  const entry = Object.entries(STATE_CODES).find(([_, code]) => code === stateCode);
  return entry ? entry[0] : 'Unknown';
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Validate Aadhaar number format (12 digits)
 */
export function isValidAadhaar(aadhaar: string): boolean {
  const normalized = aadhaar.replace(/\s/g, '');
  return /^[0-9]{12}$/.test(normalized);
}

/**
 * Format Aadhaar number with spaces (XXXX XXXX XXXX)
 */
export function formatAadhaar(aadhaar: string): string {
  const normalized = aadhaar.replace(/\s/g, '');
  
  if (normalized.length !== 12) {
    throw new Error('Aadhaar must be exactly 12 digits');
  }
  
  return `${normalized.slice(0, 4)} ${normalized.slice(4, 8)} ${normalized.slice(8, 12)}`;
}

/**
 * Mask Aadhaar number (show only last 4 digits)
 */
export function maskAadhaar(aadhaar: string): string {
  const normalized = aadhaar.replace(/\s/g, '');
  
  if (normalized.length !== 12) {
    return 'XXXX XXXX XXXX';
  }
  
  return `XXXX XXXX ${normalized.slice(8, 12)}`;
}

/**
 * Blood group validation
 */
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function isValidBloodGroup(bloodGroup: string): boolean {
  return BLOOD_GROUPS.includes(bloodGroup);
}

/**
 * Relationship types for family linking
 */
export const RELATIONSHIP_TYPES = [
  'spouse',
  'child',
  'parent',
  'sibling',
  'grandparent',
  'grandchild',
  'guardian',
  'ward'
];

export function isValidRelationship(relationship: string): boolean {
  return RELATIONSHIP_TYPES.includes(relationship.toLowerCase());
}
