/**
 * Aadhaar Card Validation Utilities
 * For Government Healthcare Integration
 */

/**
 * Validates Aadhaar number format (12 digits)
 * @param aadhaar - The Aadhaar number to validate
 * @returns boolean - Whether the Aadhaar number is valid
 */
export const validateAadhaar = (aadhaar: string): boolean => {
  // Remove spaces and hyphens
  const cleaned = aadhaar.replace(/[\s-]/g, '');
  
  // Check if it's exactly 12 digits
  if (!/^\d{12}$/.test(cleaned)) {
    return false;
  }
  
  // Aadhaar cannot start with 0 or 1
  if (cleaned[0] === '0' || cleaned[1] === '1') {
    return false;
  }
  
  return true;
};

/**
 * Formats Aadhaar number with spaces (XXXX XXXX XXXX)
 * @param aadhaar - The Aadhaar number to format
 * @returns string - Formatted Aadhaar number
 */
export const formatAadhaar = (aadhaar: string): string => {
  const cleaned = aadhaar.replace(/[\s-]/g, '');
  
  if (cleaned.length <= 4) {
    return cleaned;
  } else if (cleaned.length <= 8) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  } else {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)}`;
  }
};

/**
 * Masks Aadhaar number for display (XXXX XXXX 1234)
 * @param aadhaar - The Aadhaar number to mask
 * @returns string - Masked Aadhaar number
 */
export const maskAadhaar = (aadhaar: string): string => {
  const cleaned = aadhaar.replace(/[\s-]/g, '');
  
  if (cleaned.length !== 12) {
    return aadhaar;
  }
  
  return `XXXX XXXX ${cleaned.slice(8)}`;
};

/**
 * Validates and returns error message if invalid
 * @param aadhaar - The Aadhaar number to validate
 * @returns string | null - Error message or null if valid
 */
export const getAadhaarError = (aadhaar: string): string | null => {
  if (!aadhaar || aadhaar.trim() === '') {
    return 'Aadhaar number is required';
  }
  
  const cleaned = aadhaar.replace(/[\s-]/g, '');
  
  if (!/^\d+$/.test(cleaned)) {
    return 'Aadhaar must contain only numbers';
  }
  
  if (cleaned.length !== 12) {
    return 'Aadhaar must be exactly 12 digits';
  }
  
  if (cleaned[0] === '0' || cleaned[0] === '1') {
    return 'Invalid Aadhaar number format';
  }
  
  return null;
};
