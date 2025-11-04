/**
 * Health ID (ABHA) Validation Utilities
 * Provides validation, formatting, and security functions for ABHA Health IDs
 */

/**
 * Validates Health ID format (14 digits)
 * @param healthId - The Health ID string to validate
 * @returns boolean indicating if the format is valid
 */
export const validateHealthId = (healthId: string): boolean => {
  const cleaned = healthId.replace(/\D/g, '');
  return cleaned.length === 14 && /^\d{14}$/.test(cleaned);
};

/**
 * Formats Health ID with dashes (XXXX-XXXX-XXXX-XX)
 * @param healthId - The Health ID string to format
 * @returns Formatted Health ID string
 */
export const formatHealthId = (healthId: string): string => {
  const cleaned = healthId.replace(/\D/g, '');
  const limited = cleaned.substring(0, 14);
  
  const parts = [];
  for (let i = 0; i < limited.length; i += 4) {
    parts.push(limited.substring(i, i + 4));
  }
  
  return parts.join('-');
};

/**
 * Masks Health ID for secure display (shows only last 4 digits)
 * @param healthId - The Health ID to mask
 * @returns Masked string like "XXXX-XXXX-XXXX-1234"
 */
export const maskHealthId = (healthId: string): string => {
  const cleaned = healthId.replace(/\D/g, '');
  if (cleaned.length !== 14) {
    return "XXXX-XXXX-XXXX-XXXX";
  }
  
  return `XXXX-XXXX-XXXX-${cleaned.slice(-4)}`;
};

/**
 * Gets validation error message for Health ID
 * @param healthId - The Health ID to validate
 * @returns Error message or null if valid
 */
export const getHealthIdError = (healthId: string): string | null => {
  const cleaned = healthId.replace(/\D/g, '');
  
  if (!cleaned) {
    return null; // Empty is ok for optional fields
  }
  
  if (cleaned.length < 14) {
    return "Health ID must be 14 digits";
  }
  
  if (!/^\d{14}$/.test(cleaned)) {
    return "Health ID must contain only numbers";
  }
  
  return null;
};

/**
 * Validates PAN Card format
 * @param pan - PAN number string
 * @returns boolean indicating validity
 */
export const validatePAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

/**
 * Formats PAN with uppercase
 * @param pan - PAN to format
 * @returns Formatted PAN
 */
export const formatPAN = (pan: string): string => {
  return pan.toUpperCase().substring(0, 10);
};

/**
 * Masks PAN for display (e.g., ABXXX1234F)
 * @param pan - PAN to mask
 * @returns Masked PAN
 */
export const maskPAN = (pan: string): string => {
  if (pan.length !== 10) return "XXXXX9999X";
  return `${pan.slice(0, 2)}XXX${pan.slice(-4)}`;
};

/**
 * Validates Voter ID format
 * @param voterId - Voter ID string
 * @returns boolean indicating validity
 */
export const validateVoterId = (voterId: string): boolean => {
  const voterIdRegex = /^[A-Z]{3}[0-9]{7}$/;
  return voterIdRegex.test(voterId.toUpperCase());
};

/**
 * Formats Voter ID with uppercase
 * @param voterId - Voter ID to format
 * @returns Formatted Voter ID
 */
export const formatVoterId = (voterId: string): string => {
  return voterId.toUpperCase().substring(0, 10);
};

/**
 * Masks Voter ID for display
 * @param voterId - Voter ID to mask
 * @returns Masked Voter ID
 */
export const maskVoterId = (voterId: string): string => {
  if (voterId.length !== 10) return "ABCXXXX567";
  return `${voterId.slice(0, 3)}XXXX${voterId.slice(-3)}`;
};

/**
 * Hash data using SHA-256
 * @param data - String to hash
 * @returns Promise resolving to hex string hash
 */
export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
