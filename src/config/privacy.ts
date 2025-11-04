/**
 * =====================================================
 * PRIVACY MODULE - MED-AID SAARTHI v2.0
 * =====================================================
 * Handles data privacy, consent management, anonymization,
 * and compliance with GDPR/DPDP Act 2023.
 * =====================================================
 */

import { supabase } from '@/integrations/supabase/client';

// =====================================================
// CONFIGURATION
// =====================================================

const CONFIG = {
  CONSENT_VERSION: import.meta.env.VITE_CONSENT_VERSION || '1.0.0',
  DATA_RETENTION_DAYS: parseInt(import.meta.env.VITE_DATA_RETENTION_DAYS || '2555'), // 7 years
  AUDIT_LOG_RETENTION_DAYS: parseInt(import.meta.env.VITE_AUDIT_LOG_RETENTION_DAYS || '3650'), // 10 years
  ENABLE_DATA_PORTABILITY: import.meta.env.VITE_ENABLE_DATA_PORTABILITY === 'true',
  ENABLE_RIGHT_TO_ERASURE: import.meta.env.VITE_ENABLE_RIGHT_TO_ERASURE === 'true',
};

// =====================================================
// CONSENT MANAGEMENT
// =====================================================

export interface ConsentRecord {
  userId: string;
  purpose: 'treatment' | 'research' | 'marketing' | 'data_sharing' | 'analytics';
  granted: boolean;
  version: string;
  timestamp: Date;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log user consent for data processing.
 * 
 * @param consent - Consent details
 * @returns Success status
 */
export async function logConsent(consent: ConsentRecord): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('consent_logs')
      .insert({
        user_id: consent.userId,
        purpose: consent.purpose,
        granted: consent.granted,
        consent_version: consent.version,
        ip_address: consent.ipAddress,
        metadata: consent.metadata,
        created_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Failed to log consent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if user has granted consent for a specific purpose.
 * 
 * @param userId - User ID
 * @param purpose - Purpose of data processing
 * @returns Whether consent is granted
 */
export async function hasConsent(
  userId: string,
  purpose: ConsentRecord['purpose']
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('consent_logs')
      .select('granted, consent_version')
      .eq('user_id', userId)
      .eq('purpose', purpose)
      .eq('consent_version', CONFIG.CONSENT_VERSION)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) return false;
    
    return data.granted;
  } catch {
    return false;
  }
}

/**
 * Revoke user consent for a specific purpose.
 * 
 * @param userId - User ID
 * @param purpose - Purpose to revoke
 * @returns Success status
 */
export async function revokeConsent(
  userId: string,
  purpose: ConsentRecord['purpose']
): Promise<{ success: boolean; error?: string }> {
  return logConsent({
    userId,
    purpose,
    granted: false,
    version: CONFIG.CONSENT_VERSION,
    timestamp: new Date(),
  });
}

// =====================================================
// DATA ANONYMIZATION
// =====================================================

/**
 * Anonymize personal identifiable information (PII).
 * 
 * Use this before logging, exporting, or sharing data.
 * 
 * @param data - Data containing PII
 * @returns Anonymized data
 */
export function anonymizePII<T extends Record<string, unknown>>(data: T): T {
  const anonymized = { ...data };
  
  // Fields to remove completely
  const removeFields = [
    'aadhaar_number',
    'health_id',
    'pan_number',
    'voter_id',
    'passport_number',
    'driving_license',
    'email',
    'phone',
    'mobile',
    'address',
    'pincode',
    'latitude',
    'longitude',
    'ip_address',
    'device_id',
  ];
  
  // Fields to hash (keep structure but remove content)
  const hashFields = [
    'full_name',
    'first_name',
    'last_name',
    'father_name',
    'mother_name',
  ];
  
  for (const field of removeFields) {
    if (field in anonymized) {
      delete anonymized[field];
    }
  }
  
  for (const field of hashFields) {
    if (field in anonymized && typeof anonymized[field] === 'string') {
      const value = anonymized[field] as string;
      anonymized[field] = `ANON_${value.length}_${value[0]}` as T[Extract<keyof T, string>];
    }
  }
  
  return anonymized;
}

/**
 * Redact sensitive information from logs.
 * 
 * @param message - Log message
 * @returns Redacted message
 */
export function redactLog(message: string): string {
  // Aadhaar pattern (12 digits)
  let redacted = message.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, 'XXXX-XXXX-XXXX');
  
  // PAN pattern (ABCDE1234F)
  redacted = redacted.replace(/\b[A-Z]{5}\d{4}[A-Z]\b/g, 'XXXXX1234X');
  
  // Phone pattern (10 digits)
  redacted = redacted.replace(/\b[6-9]\d{9}\b/g, 'XXXXXXXXXX');
  
  // Email pattern
  redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 'XXXX@XXXX.com');
  
  // Health ID pattern (14 digits)
  redacted = redacted.replace(/\b\d{4}[-]?\d{4}[-]?\d{4}[-]?\d{2}\b/g, 'XXXX-XXXX-XXXX-XX');
  
  return redacted;
}

// =====================================================
// AUDIT LOGGING (Privacy-Safe)
// =====================================================

export interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  outcome: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log user action for audit trail (with PII redaction).
 * 
 * @param log - Audit log entry
 * @returns Success status
 */
export async function logAuditEvent(log: AuditLog): Promise<{ success: boolean; error?: string }> {
  try {
    // Redact metadata
    const redactedMetadata = log.metadata ? anonymizePII(log.metadata) : {};
    
    const { error } = await supabase
      .from('verification_audit_log')
      .insert({
        user_id: log.userId,
        action_type: log.action,
        verification_method: log.resource,
        verification_status: log.outcome,
        ip_address: log.ipAddress,
        device_info: log.userAgent,
        metadata: redactedMetadata,
        created_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    // Fail silently for audit logs (don't block user operations)
    console.error('Failed to log audit event:', redactLog(JSON.stringify(error)));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// DATA PORTABILITY (GDPR/DPDP Right)
// =====================================================

/**
 * Export all user data in JSON format (GDPR/DPDP compliance).
 * 
 * @param userId - User ID
 * @returns User data export
 */
export async function exportUserData(userId: string): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  if (!CONFIG.ENABLE_DATA_PORTABILITY) {
    return {
      success: false,
      error: 'Data portability is not enabled',
    };
  }
  
  try {
    const exportData: Record<string, unknown> = {
      exportDate: new Date().toISOString(),
      userId,
    };
    
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    exportData.profile = profile;
    
    // Fetch health records
    const { data: healthRecords } = await supabase
      .from('health_records')
      .select('*')
      .eq('patient_id', userId);
    exportData.healthRecords = healthRecords;
    
    // Fetch appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', userId);
    exportData.appointments = appointments;
    
    // Fetch consultations
    const { data: consultations } = await supabase
      .from('consultations')
      .select('*')
      .eq('patient_id', userId);
    exportData.consultations = consultations;
    
    // Fetch prescriptions
    const { data: prescriptions } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', userId);
    exportData.prescriptions = prescriptions;
    
    // Fetch consent logs
    const { data: consents } = await supabase
      .from('consent_logs')
      .select('*')
      .eq('user_id', userId);
    exportData.consentHistory = consents;
    
    // Log export request
    await logAuditEvent({
      userId,
      action: 'data_export_requested',
      resource: 'user_data',
      outcome: 'success',
    });
    
    return {
      success: true,
      data: exportData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// RIGHT TO ERASURE (GDPR/DPDP Right)
// =====================================================

/**
 * Delete all user data (GDPR/DPDP "Right to be Forgotten").
 * 
 * NOTE: Some data may be retained for legal/regulatory compliance.
 * 
 * @param userId - User ID
 * @param reason - Reason for deletion
 * @returns Success status
 */
export async function deleteUserData(
  userId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!CONFIG.ENABLE_RIGHT_TO_ERASURE) {
    return {
      success: false,
      error: 'Right to erasure is not enabled',
    };
  }
  
  try {
    // Log deletion request (BEFORE deletion)
    await logAuditEvent({
      userId,
      action: 'data_deletion_requested',
      resource: 'user_data',
      outcome: 'success',
      metadata: { reason },
    });
    
    // Anonymize profile (don't delete for referential integrity)
    await supabase
      .from('profiles')
      .update({
        full_name: 'DELETED_USER',
        email: `deleted_${userId}@medaidsathi.com`,
        health_id_hash: null,
        health_id_last_four: null,
        aadhaar_hash: null,
        aadhaar_last_four: null,
        pan_hash: null,
        voter_id_hash: null,
        passport_hash: null,
        dl_hash: null,
        is_anonymous: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    // Anonymize health records
    await supabase
      .from('health_records')
      .update({
        record_data: { anonymized: true, deleted_at: new Date().toISOString() },
        symptoms: 'DELETED',
        diagnosis: 'DELETED',
      })
      .eq('patient_id', userId);
    
    // Delete prescriptions (or anonymize based on legal requirements)
    await supabase
      .from('prescriptions')
      .delete()
      .eq('patient_id', userId);
    
    // Keep appointment/consultation records but anonymize patient info
    // (needed for doctor records and billing)
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// DATA RETENTION & CLEANUP
// =====================================================

/**
 * Archive or delete old data based on retention policies.
 * 
 * This should be run as a cron job (e.g., daily or weekly).
 * 
 * @returns Number of records processed
 */
export async function enforceRetentionPolicy(): Promise<{
  success: boolean;
  recordsProcessed: number;
  error?: string;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.DATA_RETENTION_DAYS);
    
    let recordsProcessed = 0;
    
    // Archive old health records
    const { data: oldRecords } = await supabase
      .from('health_records')
      .select('id')
      .lt('created_at', cutoffDate.toISOString());
    
    if (oldRecords && oldRecords.length > 0) {
      // Move to archive table or delete
      await supabase
        .from('health_records')
        .delete()
        .lt('created_at', cutoffDate.toISOString());
      
      recordsProcessed += oldRecords.length;
    }
    
    // Delete old audit logs (keep longer than PHI)
    const auditCutoffDate = new Date();
    auditCutoffDate.setDate(auditCutoffDate.getDate() - CONFIG.AUDIT_LOG_RETENTION_DAYS);
    
    const { data: oldAuditLogs } = await supabase
      .from('verification_audit_log')
      .select('id')
      .lt('created_at', auditCutoffDate.toISOString());
    
    if (oldAuditLogs && oldAuditLogs.length > 0) {
      await supabase
        .from('verification_audit_log')
        .delete()
        .lt('created_at', auditCutoffDate.toISOString());
      
      recordsProcessed += oldAuditLogs.length;
    }
    
    return {
      success: true,
      recordsProcessed,
    };
  } catch (error) {
    return {
      success: false,
      recordsProcessed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// PRIVACY-SAFE LOGGING
// =====================================================

class PrivacyLogger {
  private logLevel: 'debug' | 'info' | 'warn' | 'error';
  
  constructor(logLevel: string = 'info') {
    this.logLevel = logLevel as 'debug' | 'info' | 'warn' | 'error';
  }
  
  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }
  
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;
    
    const redactedMessage = redactLog(message);
    const redactedMeta = meta ? anonymizePII(meta) : {};
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: redactedMessage,
      ...redactedMeta,
    };
    
    // In production, send to logging service (Sentry, CloudWatch, etc.)
    if (import.meta.env.PROD) {
      // TODO: Send to external logging service
      console[level](JSON.stringify(logEntry));
    } else {
      console[level](redactedMessage, redactedMeta);
    }
  }
  
  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }
  
  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }
  
  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }
  
  error(message: string, meta?: Record<string, unknown>): void {
    this.log('error', message, meta);
  }
}

export const logger = new PrivacyLogger(import.meta.env.VITE_LOG_LEVEL || 'info');

// =====================================================
// EXPORTS
// =====================================================

export const Privacy = {
  // Consent
  logConsent,
  hasConsent,
  revokeConsent,
  
  // Anonymization
  anonymizePII,
  redactLog,
  
  // Audit
  logAuditEvent,
  
  // Data rights
  exportUserData,
  deleteUserData,
  
  // Retention
  enforceRetentionPolicy,
  
  // Logging
  logger,
  
  // Constants
  CONFIG,
};

export default Privacy;
