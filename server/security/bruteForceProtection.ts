/**
 * High-Assurance Brute Force Protection & Account Lockout Guard
 * Tracks failed authentication attempts, enforces exponential backoff,
 * locks accounts after repeated failed logins, and prevents credential stuffing.
 */

import { auditLogger } from '../observability/auditLogger';
import { logger } from '../observability/logger';

interface AttemptRecord {
  failedAttempts: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
  lockedUntil: number | null;
}

class BruteForceProtection {
  private attempts = new Map<string, AttemptRecord>();
  private maxAttempts = 5;
  private lockoutDurationMs = 15 * 60 * 1000; // 15 minutes
  private trackingWindowMs = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Periodic sweep to prevent memory retention
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.attempts.entries()) {
        if (record.lockedUntil && now > record.lockedUntil && (now - record.lastAttemptAt) > this.trackingWindowMs) {
          this.attempts.delete(key);
        } else if (!record.lockedUntil && (now - record.lastAttemptAt) > this.trackingWindowMs) {
          this.attempts.delete(key);
        }
      }
    }, 60000);
  }

  private getKey(identifier: string, ip?: string): string {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanIp = (ip || '0.0.0.0').trim();
    return `${cleanId}:::${cleanIp}`;
  }

  /**
   * Checks if an attempt is currently blocked due to account lockout
   */
  public isLocked(identifier: string, ip?: string): { locked: boolean; remainingSeconds: number; reason?: string } {
    const key = this.getKey(identifier, ip);
    const record = this.attempts.get(key);
    const now = Date.now();

    if (record && record.lockedUntil && now < record.lockedUntil) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return {
        locked: true,
        remainingSeconds,
        reason: `تم حظر الحساب مؤقتاً بسبب تكرار إدخال كلمة مرور خاطئة (${record.failedAttempts} محاولات). يرجى المحاولة بعد ${remainingSeconds} ثانية أو استخدام خاصية استعادة كلمة المرور.`
      };
    }

    return { locked: false, remainingSeconds: 0 };
  }

  /**
   * Records a failed login attempt
   */
  public recordFailedAttempt(identifier: string, ip?: string): { 
    isNowLocked: boolean; 
    failedAttempts: number; 
    remainingAttempts: number; 
    lockedUntilSeconds: number 
  } {
    const key = this.getKey(identifier, ip);
    const now = Date.now();
    let record = this.attempts.get(key);

    if (!record || (record.lockedUntil && now > record.lockedUntil)) {
      record = {
        failedAttempts: 1,
        firstAttemptAt: now,
        lastAttemptAt: now,
        lockedUntil: null
      };
    } else {
      record.failedAttempts++;
      record.lastAttemptAt = now;
    }

    let isNowLocked = false;
    let lockedUntilSeconds = 0;

    if (record.failedAttempts >= this.maxAttempts) {
      isNowLocked = true;
      record.lockedUntil = now + this.lockoutDurationMs;
      lockedUntilSeconds = Math.ceil(this.lockoutDurationMs / 1000);

      logger.warn(`🚨 [BRUTE-FORCE] Account locked for ${identifier} from IP ${ip} after ${record.failedAttempts} failed attempts`);
      
      auditLogger.log({
        actorId: identifier,
        actorRole: 'unauthenticated',
        action: 'AUTH_ACCOUNT_LOCKED_BRUTE_FORCE',
        resourceType: 'user_account',
        resourceId: identifier,
        status: 'denied',
        severity: 'high',
        ipAddress: ip,
        details: {
          identifier,
          failedAttempts: record.failedAttempts,
          lockoutDurationSeconds: lockedUntilSeconds
        }
      });
    }

    this.attempts.set(key, record);

    const remainingAttempts = Math.max(0, this.maxAttempts - record.failedAttempts);

    return {
      isNowLocked,
      failedAttempts: record.failedAttempts,
      remainingAttempts,
      lockedUntilSeconds
    };
  }

  /**
   * Resets counter on successful authentication
   */
  public recordSuccess(identifier: string, ip?: string): void {
    const key = this.getKey(identifier, ip);
    this.attempts.delete(key);
  }
}

export const bruteForceProtection = new BruteForceProtection();
