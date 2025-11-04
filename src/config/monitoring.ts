/**
 * =====================================================
 * MONITORING MODULE - MED-AID SAARTHI v2.0
 * =====================================================
 * Centralized monitoring, metrics collection, and alerting.
 * 
 * Features:
 * - Performance metrics (API latency, DB connections)
 * - Business metrics (appointments, consultations)
 * - Security metrics (auth failures, rate limits)
 * - Health checks
 * =====================================================
 */

import { logger } from '@/config/privacy';

// =====================================================
// CONFIGURATION
// =====================================================

const CONFIG = {
  METRICS_ENDPOINT: import.meta.env.VITE_METRICS_ENDPOINT || '',
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
  ENVIRONMENT: import.meta.env.NODE_ENV || 'development',
  ENABLE_METRICS: import.meta.env.VITE_DEBUG !== 'true',
};

// =====================================================
// METRICS COLLECTION
// =====================================================

interface Metric {
  name: string;
  value: number;
  unit: 'ms' | 'count' | 'bytes' | 'percent';
  tags?: Record<string, string>;
  timestamp: number;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private flushInterval: number = 60000; // 1 minute
  private intervalId: NodeJS.Timeout | null = null;
  
  constructor() {
    if (CONFIG.ENABLE_METRICS) {
      this.startAutoFlush();
    }
  }
  
  /**
   * Record a metric.
   */
  record(
    name: string,
    value: number,
    unit: Metric['unit'] = 'count',
    tags?: Record<string, string>
  ): void {
    this.metrics.push({
      name,
      value,
      unit,
      tags,
      timestamp: Date.now(),
    });
    
    // Auto-flush if buffer is large
    if (this.metrics.length >= 100) {
      this.flush();
    }
  }
  
  /**
   * Flush metrics to external service.
   */
  async flush(): Promise<void> {
    if (this.metrics.length === 0) return;
    
    const metricsToSend = [...this.metrics];
    this.metrics = [];
    
    try {
      if (CONFIG.METRICS_ENDPOINT) {
        await fetch(CONFIG.METRICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metrics: metricsToSend,
            environment: CONFIG.ENVIRONMENT,
          }),
        });
      }
      
      // Log to console in development
      if (!import.meta.env.PROD) {
        console.log('[Metrics]', metricsToSend);
      }
    } catch (error) {
      logger.error('Failed to flush metrics', { error });
    }
  }
  
  /**
   * Start auto-flushing metrics.
   */
  private startAutoFlush(): void {
    this.intervalId = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }
  
  /**
   * Stop auto-flushing.
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.flush();
  }
}

export const metrics = new MetricsCollector();

// =====================================================
// PERFORMANCE TRACKING
// =====================================================

class PerformanceMonitor {
  private timers: Map<string, number> = new Map();
  
  /**
   * Start timing an operation.
   */
  start(operationName: string): void {
    this.timers.set(operationName, Date.now());
  }
  
  /**
   * End timing and record metric.
   */
  end(operationName: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(operationName);
    if (!startTime) {
      logger.warn(`Performance timer not started: ${operationName}`);
      return 0;
    }
    
    const duration = Date.now() - startTime;
    this.timers.delete(operationName);
    
    metrics.record(`${operationName}_duration`, duration, 'ms', tags);
    
    return duration;
  }
  
  /**
   * Measure async operation.
   */
  async measure<T>(
    operationName: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    this.start(operationName);
    try {
      const result = await fn();
      this.end(operationName, { ...tags, status: 'success' });
      return result;
    } catch (error) {
      this.end(operationName, { ...tags, status: 'error' });
      throw error;
    }
  }
}

export const performance = new PerformanceMonitor();

// =====================================================
// BUSINESS METRICS
// =====================================================

export const BusinessMetrics = {
  /**
   * Track appointment booking.
   */
  recordAppointment(status: 'created' | 'confirmed' | 'cancelled' | 'completed'): void {
    metrics.record('appointments_total', 1, 'count', { status });
  },
  
  /**
   * Track consultation.
   */
  recordConsultation(type: 'video' | 'in_person' | 'chat'): void {
    metrics.record('consultations_total', 1, 'count', { type });
  },
  
  /**
   * Track prescription issued.
   */
  recordPrescription(): void {
    metrics.record('prescriptions_issued', 1, 'count');
  },
  
  /**
   * Track health record created.
   */
  recordHealthRecord(): void {
    metrics.record('health_records_created', 1, 'count');
  },
  
  /**
   * Track user registration.
   */
  recordRegistration(role: 'patient' | 'doctor' | 'asha'): void {
    metrics.record('user_registrations', 1, 'count', { role });
  },
};

// =====================================================
// SECURITY METRICS
// =====================================================

export const SecurityMetrics = {
  /**
   * Track authentication attempt.
   */
  recordAuthAttempt(outcome: 'success' | 'failure', method: 'password' | 'otp' | 'social'): void {
    metrics.record('auth_attempts', 1, 'count', { outcome, method });
  },
  
  /**
   * Track rate limit hit.
   */
  recordRateLimit(endpoint: string): void {
    metrics.record('rate_limit_hits', 1, 'count', { endpoint });
  },
  
  /**
   * Track suspicious activity.
   */
  recordSuspiciousActivity(type: 'brute_force' | 'sql_injection' | 'xss' | 'csrf'): void {
    metrics.record('suspicious_activity', 1, 'count', { type });
    
    // Alert immediately
    if (CONFIG.SENTRY_DSN) {
      logger.error('Suspicious activity detected', { type });
    }
  },
  
  /**
   * Track data access.
   */
  recordDataAccess(resource: 'health_record' | 'prescription' | 'appointment'): void {
    metrics.record('data_access_total', 1, 'count', { resource });
  },
};

// =====================================================
// SYSTEM HEALTH
// =====================================================

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  error?: string;
}

export class HealthMonitor {
  private checks: Map<string, HealthCheck> = new Map();
  
  /**
   * Register a health check.
   */
  async checkService(
    service: string,
    checkFn: () => Promise<boolean>
  ): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const isHealthy = await Promise.race([
        checkFn(),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), 5000)
        ),
      ]);
      
      const latency = Date.now() - startTime;
      const status = isHealthy ? 'healthy' : 'unhealthy';
      
      const check: HealthCheck = { service, status, latency };
      this.checks.set(service, check);
      
      metrics.record('health_check_latency', latency, 'ms', { service, status });
      
      return check;
    } catch (error) {
      const check: HealthCheck = {
        service,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      this.checks.set(service, check);
      
      return check;
    }
  }
  
  /**
   * Get overall system health.
   */
  getOverallHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: HealthCheck[];
  } {
    const checks = Array.from(this.checks.values());
    
    const unhealthy = checks.filter((c) => c.status === 'unhealthy').length;
    const degraded = checks.filter((c) => c.status === 'degraded').length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthy > 0) {
      status = 'unhealthy';
    } else if (degraded > 0) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }
    
    return { status, checks };
  }
  
  /**
   * Run all health checks.
   */
  async runAll(): Promise<void> {
    // Database
    await this.checkService('database', async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { error } = await supabase.from('profiles').select('id').limit(1);
        return !error;
      } catch {
        return false;
      }
    });
    
    // NDHM gateway
    await this.checkService('ndhm', async () => {
      try {
        const { checkABDMStatus } = await import('@/lib/ndhmAdapter');
        const { available } = await checkABDMStatus();
        return available;
      } catch {
        return false;
      }
    });
  }
}

export const health = new HealthMonitor();

// =====================================================
// ERROR TRACKING (Sentry Integration)
// =====================================================

export function initErrorTracking(): void {
  if (!CONFIG.SENTRY_DSN || !import.meta.env.PROD) {
    return;
  }
  
  // Initialize Sentry or similar error tracking
  // This would require @sentry/browser package
  logger.info('Error tracking initialized', {
    environment: CONFIG.ENVIRONMENT,
  });
}

/**
 * Capture exception for error tracking.
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  logger.error('Exception captured', { error, context });
  
  // In production, send to Sentry
  if (CONFIG.SENTRY_DSN && import.meta.env.PROD) {
    // Sentry.captureException(error, { extra: context });
  }
}

// =====================================================
// API LATENCY TRACKING
// =====================================================

/**
 * Middleware to track API call latency.
 */
export function trackAPICall<T>(
  endpoint: string,
  method: string,
  fn: () => Promise<T>
): Promise<T> {
  return performance.measure(`api_${method}_${endpoint}`, fn, {
    endpoint,
    method,
  });
}

// =====================================================
// DATABASE CONNECTION MONITORING
// =====================================================

export function monitorDatabaseConnections(): void {
  // This would integrate with Supabase monitoring
  // or PostgreSQL connection pooling stats
  
  setInterval(() => {
    // Mock: In production, get real connection count
    const activeConnections = Math.floor(Math.random() * 50);
    metrics.record('db_connections_active', activeConnections, 'count');
  }, 30000); // Every 30 seconds
}

// =====================================================
// EXPORTS
// =====================================================

export const Monitoring = {
  metrics,
  performance,
  health,
  BusinessMetrics,
  SecurityMetrics,
  initErrorTracking,
  captureException,
  trackAPICall,
  monitorDatabaseConnections,
};

export default Monitoring;
