/**
 * =====================================================
 * SECURITY MODULE TESTS - MED-AID SAARTHI v2.0
 * =====================================================
 * Test suite for cryptographic operations, token management,
 * and security utilities.
 * =====================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Security } from '@/config/security';

describe('Security Module', () => {
  describe('HMAC Hashing', () => {
    it('should hash data with HMAC-SHA256', () => {
      const data = 'sensitive-data-12345';
      const secret = 'test-secret-key-minimum-64-characters-long-for-security-purposes';
      
      const hash = Security.hmacHash(data, secret);
      
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64); // SHA256 hex = 64 characters
      expect(hash).toMatch(/^[a-f0-9]{64}$/); // Hex format
    });
    
    it('should produce different hashes for different data', () => {
      const secret = 'test-secret-key-minimum-64-characters-long-for-security-purposes';
      const hash1 = Security.hmacHash('data1', secret);
      const hash2 = Security.hmacHash('data2', secret);
      
      expect(hash1).not.toBe(hash2);
    });
    
    it('should produce same hash for same data and secret', () => {
      const secret = 'test-secret-key-minimum-64-characters-long-for-security-purposes';
      const hash1 = Security.hmacHash('data', secret);
      const hash2 = Security.hmacHash('data', secret);
      
      expect(hash1).toBe(hash2);
    });
    
    it('should throw error for empty data', () => {
      expect(() => Security.hmacHash('', 'secret')).toThrow('Data to hash cannot be empty');
    });
    
    it('should throw error for missing secret', () => {
      expect(() => Security.hmacHash('data', '')).toThrow('HMAC secret not configured');
    });
  });
  
  describe('Aadhaar Hashing', () => {
    it('should hash valid Aadhaar number', () => {
      const result = Security.hashAadhaar('123456789012');
      
      expect(result.hash).toBeDefined();
      expect(result.hash).toHaveLength(64);
      expect(result.last4).toBe('9012');
      expect(result.masked).toBe('XXXX-XXXX-9012');
    });
    
    it('should handle Aadhaar with spaces', () => {
      const result = Security.hashAadhaar('1234 5678 9012');
      
      expect(result.last4).toBe('9012');
      expect(result.masked).toBe('XXXX-XXXX-9012');
    });
    
    it('should throw error for invalid Aadhaar format', () => {
      expect(() => Security.hashAadhaar('12345')).toThrow('Invalid Aadhaar number format');
      expect(() => Security.hashAadhaar('abcd5678901')).toThrow('Invalid Aadhaar number format');
    });
  });
  
  describe('Health ID Hashing', () => {
    it('should hash valid Health ID', () => {
      const result = Security.hashHealthId('12345678901234');
      
      expect(result.hash).toBeDefined();
      expect(result.hash).toHaveLength(64);
      expect(result.last4).toBe('1234');
      expect(result.masked).toBe('XXXX-XXXX-XXXX-34');
    });
    
    it('should handle Health ID with hyphens', () => {
      const result = Security.hashHealthId('1234-5678-9012-34');
      
      expect(result.last4).toBe('1234');
    });
    
    it('should throw error for invalid Health ID format', () => {
      expect(() => Security.hashHealthId('12345')).toThrow('Invalid Health ID format');
    });
  });
  
  describe('Document Hashing', () => {
    it('should hash valid PAN number', () => {
      const result = Security.hashDocument('ABCDE1234F', 'pan');
      
      expect(result.hash).toBeDefined();
      expect(result.masked).toBe('ABXXX4F');
    });
    
    it('should hash valid Voter ID', () => {
      const result = Security.hashDocument('ABC1234567', 'voter_id');
      
      expect(result.hash).toBeDefined();
      expect(result.masked).toBe('ABCXXXX567');
    });
    
    it('should throw error for invalid PAN format', () => {
      expect(() => Security.hashDocument('INVALID', 'pan')).toThrow('Invalid pan format');
    });
  });
  
  describe('Envelope Encryption', () => {
    it('should encrypt and decrypt data successfully', () => {
      // Mock environment variable for testing
      const originalKey = process.env.VITE_ENCRYPTION_MASTER_KEY;
      process.env.VITE_ENCRYPTION_MASTER_KEY = 'a'.repeat(64);
      
      const plaintext = 'Sensitive health data: Patient has diabetes';
      const encrypted = Security.encryptWithEnvelope(plaintext);
      
      expect(encrypted.encryptedData).toBeDefined();
      expect(encrypted.encryptedKey).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.authTag).toBeDefined();
      
      const decrypted = Security.decryptWithEnvelope(
        encrypted.encryptedData,
        encrypted.encryptedKey,
        encrypted.iv,
        encrypted.authTag
      );
      
      expect(decrypted).toBe(plaintext);
      
      // Restore original key
      process.env.VITE_ENCRYPTION_MASTER_KEY = originalKey;
    });
    
    it('should throw error for empty plaintext', () => {
      expect(() => Security.encryptWithEnvelope('')).toThrow('Plaintext cannot be empty');
    });
  });
  
  describe('JWT Token Management', () => {
    beforeEach(() => {
      // Mock JWT secrets
      process.env.VITE_JWT_SECRET = 'a'.repeat(64);
      process.env.VITE_JWT_REFRESH_SECRET = 'b'.repeat(64);
    });
    
    it('should generate valid access token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'patient' as const,
        sessionId: 'sess-123',
      };
      
      const token = Security.generateAccessToken(payload);
      
      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });
    
    it('should verify valid token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'patient' as const,
        sessionId: 'sess-123',
      };
      
      const token = Security.generateAccessToken(payload);
      const verified = Security.verifyToken(token);
      
      expect(verified).toBeDefined();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
    });
    
    it('should reject expired token', async () => {
      // Generate token with very short expiry
      process.env.VITE_JWT_ACCESS_TOKEN_EXPIRY = '1'; // 1 second
      
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'patient' as const,
        sessionId: 'sess-123',
      };
      
      const token = Security.generateAccessToken(payload);
      
      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const verified = Security.verifyToken(token);
      expect(verified).toBeNull();
    });
    
    it('should reject tampered token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'patient' as const,
        sessionId: 'sess-123',
      };
      
      const token = Security.generateAccessToken(payload);
      const tamperedToken = token.slice(0, -10) + 'tamperedXX';
      
      const verified = Security.verifyToken(tamperedToken);
      expect(verified).toBeNull();
    });
  });
  
  describe('Rate Limiting', () => {
    it('should track failed login attempts', () => {
      const identifier = 'test@example.com';
      
      const result1 = Security.trackFailedLogin(identifier);
      expect(result1.locked).toBe(false);
      expect(result1.remainingAttempts).toBe(4); // 5 - 1
      
      // Exhaust remaining attempts
      Security.trackFailedLogin(identifier);
      Security.trackFailedLogin(identifier);
      Security.trackFailedLogin(identifier);
      
      const result5 = Security.trackFailedLogin(identifier);
      expect(result5.locked).toBe(true);
      expect(result5.remainingAttempts).toBe(0);
    });
    
    it('should reset login attempts on success', () => {
      const identifier = 'test@example.com';
      
      Security.trackFailedLogin(identifier);
      Security.trackFailedLogin(identifier);
      
      Security.resetLoginAttempts(identifier);
      
      const { locked } = Security.isLocked(identifier);
      expect(locked).toBe(false);
    });
  });
  
  describe('Password Validation', () => {
    it('should validate strong password', () => {
      const result = Security.validatePasswordStrength('MyStr0ng!Pass@2024');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject weak passwords', () => {
      const result = Security.validatePasswordStrength('weak');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should require minimum 12 characters', () => {
      const result = Security.validatePasswordStrength('Short1!');
      
      expect(result.errors).toContain('Password must be at least 12 characters');
    });
    
    it('should require special characters', () => {
      const result = Security.validatePasswordStrength('NoSpecialChars123');
      
      expect(result.errors).toContain('Password must contain special characters');
    });
  });
  
  describe('Utility Functions', () => {
    it('should generate secure random string', () => {
      const random1 = Security.generateSecureRandom(32);
      const random2 = Security.generateSecureRandom(32);
      
      expect(random1).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(random2).toHaveLength(64);
      expect(random1).not.toBe(random2);
    });
    
    it('should generate session ID', () => {
      const sessionId = Security.generateSessionId();
      
      expect(sessionId).toMatch(/^sess_\d+_[a-f0-9]{32}$/);
    });
    
    it('should sanitize input', () => {
      const dirty = '<script>alert("XSS")</script>';
      const clean = Security.sanitizeInput(dirty);
      
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
    });
  });
});
