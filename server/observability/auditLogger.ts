import crypto from 'crypto';
import { getDatabase } from '../database/connection';
import { SecurityAuditLog, AuditSeverity, AuditStatus } from './types';
import { sanitizeData } from './sanitizer';
import { logger } from './logger';

class SecurityAuditLogger {
  private inMemoryAuditLogs: SecurityAuditLog[] = [];
  private readonly maxBufferSize = 300;

  /**
   * Record a security or administrative audit event
   */
  public log(entry: {
    actorId: string;
    actorRole: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details?: Record<string, any>;
    ipAddress?: string;
    status?: AuditStatus;
    severity?: AuditSeverity;
  }): SecurityAuditLog {
    const id = `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const createdAt = new Date().toISOString();
    const status: AuditStatus = entry.status || 'success';
    const severity: AuditSeverity = entry.severity || 'medium';
    const sanitizedDetails = entry.details ? sanitizeData(entry.details) : {};

    const auditEntry: SecurityAuditLog = {
      id,
      actorId: entry.actorId,
      actorRole: entry.actorRole,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      details: sanitizedDetails,
      ipAddress: entry.ipAddress,
      status,
      severity,
      createdAt
    };

    // 1. Maintain in-memory ring buffer
    this.inMemoryAuditLogs.unshift(auditEntry);
    if (this.inMemoryAuditLogs.length > this.maxBufferSize) {
      this.inMemoryAuditLogs.pop();
    }

    // 2. Persist to SQLite
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        INSERT INTO security_audit_logs (
          id, actor_id, actor_role, action, resource_type,
          resource_id, details_json, ip_address, status,
          severity, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        auditEntry.id,
        auditEntry.actorId,
        auditEntry.actorRole,
        auditEntry.action,
        auditEntry.resourceType,
        auditEntry.resourceId,
        JSON.stringify(auditEntry.details),
        auditEntry.ipAddress || null,
        auditEntry.status,
        auditEntry.severity,
        auditEntry.createdAt
      );
    } catch (err) {
      // Fallback
    }

    // 3. Mirror to structured application log
    logger.info(`[SECURITY AUDIT] ${entry.action} on ${entry.resourceType}:${entry.resourceId} by ${entry.actorRole}:${entry.actorId}`, {
      service: 'security_audit',
      action: entry.action,
      userId: entry.actorId,
      userRole: entry.actorRole,
      metadata: {
        auditId: id,
        severity,
        status,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        details: sanitizedDetails
      }
    });

    return auditEntry;
  }

  /**
   * Query security audit trail
   */
  public getLogs(filter: {
    actorId?: string;
    action?: string;
    resourceType?: string;
    severity?: AuditSeverity;
    limit?: number;
  } = {}): SecurityAuditLog[] {
    const limit = Math.min(filter.limit || 50, 100);

    try {
      const db = getDatabase();
      let sql = 'SELECT * FROM security_audit_logs WHERE 1=1';
      const params: any[] = [];

      if (filter.actorId) {
        sql += ' AND actor_id = ?';
        params.push(filter.actorId);
      }
      if (filter.action) {
        sql += ' AND action = ?';
        params.push(filter.action);
      }
      if (filter.resourceType) {
        sql += ' AND resource_type = ?';
        params.push(filter.resourceType);
      }
      if (filter.severity) {
        sql += ' AND severity = ?';
        params.push(filter.severity);
      }

      sql += ' ORDER BY created_at DESC LIMIT ?';
      params.push(limit);

      const rows = db.prepare(sql).all(...params) as any[];

      return rows.map(r => ({
        id: r.id,
        actorId: r.actor_id,
        actorRole: r.actor_role,
        action: r.action,
        resourceType: r.resource_type,
        resourceId: r.resource_id,
        details: r.details_json ? JSON.parse(r.details_json) : {},
        ipAddress: r.ip_address || undefined,
        status: r.status as AuditStatus,
        severity: r.severity as AuditSeverity,
        createdAt: r.created_at
      }));
    } catch {
      return this.inMemoryAuditLogs
        .filter(l => !filter.actorId || l.actorId === filter.actorId)
        .filter(l => !filter.action || l.action === filter.action)
        .filter(l => !filter.resourceType || l.resourceType === filter.resourceType)
        .filter(l => !filter.severity || l.severity === filter.severity)
        .slice(0, limit);
    }
  }
}

export const auditLogger = new SecurityAuditLogger();
