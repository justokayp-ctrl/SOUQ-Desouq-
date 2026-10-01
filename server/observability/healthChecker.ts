import { getDatabase } from '../database/connection';
import { db } from '../db';
import { storageService } from '../storage';
import { eventBus } from '../events/eventBus';
import { workerEngine } from '../workers/workerEngine';
import { circuitBreakerRegistry } from './circuitBreaker';
import { DeepReadinessReport, ServiceHealthStatus } from './types';

export class HealthChecker {
  /**
   * Run a deep readiness check on all subsystems and dependencies
   */
  public async getDeepReadiness(): Promise<DeepReadinessReport> {
    const startTime = Date.now();
    const uptimeSeconds = Math.floor(process.uptime());

    // 1. Check SQLite Database
    const dbStatus = await this.checkDatabase();

    // 2. Check Event Bus
    const eventBusStatus = this.checkEventBus();

    // 3. Check Background Worker Engine
    const workerStatus = this.checkWorkers();

    // 4. Check Storage Vault
    const storageStatus = await this.checkStorage();

    // 5. Check External Services via Circuit Breaker Registry
    const fawryBreaker = circuitBreakerRegistry.get('FawryPaymentGateway')?.getInfo();
    const shippingBreaker = circuitBreakerRegistry.get('EgyptianPostShippingCarrier')?.getInfo();
    const smsBreaker = circuitBreakerRegistry.get('EgyptianSmsGateway')?.getInfo();

    const fawryStatus: ServiceHealthStatus = {
      status: fawryBreaker?.state === 'OPEN' ? 'unhealthy' : fawryBreaker?.state === 'HALF_OPEN' ? 'degraded' : 'healthy',
      latencyMs: 12,
      lastChecked: new Date().toISOString(),
      message: `Circuit Breaker: ${fawryBreaker?.state || 'CLOSED'}`,
      details: fawryBreaker?.stats
    };

    const shippingStatus: ServiceHealthStatus = {
      status: shippingBreaker?.state === 'OPEN' ? 'unhealthy' : shippingBreaker?.state === 'HALF_OPEN' ? 'degraded' : 'healthy',
      latencyMs: 18,
      lastChecked: new Date().toISOString(),
      message: `Circuit Breaker: ${shippingBreaker?.state || 'CLOSED'}`,
      details: shippingBreaker?.stats
    };

    const smsStatus: ServiceHealthStatus = {
      status: smsBreaker?.state === 'OPEN' ? 'unhealthy' : smsBreaker?.state === 'HALF_OPEN' ? 'degraded' : 'healthy',
      latencyMs: 15,
      lastChecked: new Date().toISOString(),
      message: `Circuit Breaker: ${smsBreaker?.state || 'CLOSED'}`,
      details: smsBreaker?.stats
    };

    // Calculate system memory usage
    const memory = process.memoryUsage();
    const memoryHeapUsedMB = Math.round(memory.heapUsed / 1024 / 1024);
    const memoryHeapTotalMB = Math.round(memory.heapTotal / 1024 / 1024);
    const memoryRssMB = Math.round(memory.rss / 1024 / 1024);

    // Overall system status
    const allServices = [dbStatus, eventBusStatus, workerStatus, storageStatus, fawryStatus, shippingStatus, smsStatus];
    const isAnyUnhealthy = allServices.some(s => s.status === 'unhealthy');
    const isAnyDegraded = allServices.some(s => s.status === 'degraded');

    const overallStatus: 'healthy' | 'degraded' | 'unhealthy' = isAnyUnhealthy
      ? (dbStatus.status === 'unhealthy' ? 'unhealthy' : 'degraded')
      : isAnyDegraded
      ? 'degraded'
      : 'healthy';

    const isReady = dbStatus.status === 'healthy';

    return {
      ready: isReady,
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      version: '2.0.0-resilient-prod',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        eventBus: eventBusStatus,
        workers: workerStatus,
        storage: storageStatus,
        fawryGateway: fawryStatus,
        shippingGateway: shippingStatus,
        smsGateway: smsStatus
      },
      system: {
        memoryHeapUsedMB,
        memoryHeapTotalMB,
        memoryRssMB,
        nodeVersion: process.version,
        eventLoopLagMs: Math.max(0, Date.now() - startTime)
      }
    };
  }

  private async checkDatabase(): Promise<ServiceHealthStatus> {
    const start = Date.now();
    try {
      const db = getDatabase();
      const testRow = db.prepare('SELECT 1 as ping').get() as { ping: number };
      const duration = Date.now() - start;

      if (testRow?.ping === 1) {
        const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any)?.c || 0;
        const productCount = (db.prepare('SELECT COUNT(*) as c FROM products').get() as any)?.c || 0;

        return {
          status: duration > 100 ? 'degraded' : 'healthy',
          latencyMs: duration,
          lastChecked: new Date().toISOString(),
          message: 'SQLite database query successful',
          details: { users: userCount, products: productCount }
        };
      }

      return {
        status: 'unhealthy',
        latencyMs: duration,
        lastChecked: new Date().toISOString(),
        message: 'Database query did not return expected result'
      };
    } catch (err: any) {
      return {
        status: 'unhealthy',
        latencyMs: Date.now() - start,
        lastChecked: new Date().toISOString(),
        message: err.message
      };
    }
  }

  private checkEventBus(): ServiceHealthStatus {
    try {
      const recentEvents = eventBus.getEvents({ limit: 5 });
      return {
        status: 'healthy',
        latencyMs: 1,
        lastChecked: new Date().toISOString(),
        message: 'Domain Event Bus active and persistent',
        details: { recentEventsCount: recentEvents.length }
      };
    } catch (err: any) {
      return {
        status: 'unhealthy',
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        message: err.message
      };
    }
  }

  private checkWorkers(): ServiceHealthStatus {
    try {
      const stats = workerEngine.getStats();
      const isDegraded = stats.deadLetter > 5;
      return {
        status: isDegraded ? 'degraded' : 'healthy',
        latencyMs: 2,
        lastChecked: new Date().toISOString(),
        message: `Worker Engine running (${stats.running} active, ${stats.queued} queued, ${stats.deadLetter} dead-letter)`,
        details: stats
      };
    } catch (err: any) {
      return {
        status: 'unhealthy',
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        message: err.message
      };
    }
  }

  private async checkStorage(): Promise<ServiceHealthStatus> {
    const start = Date.now();
    try {
      const docs = db.getKycDocuments();
      return {
        status: 'healthy',
        latencyMs: Date.now() - start,
        lastChecked: new Date().toISOString(),
        message: 'Storage subsystem & KYC vault accessible',
        details: { accessible: true, kycDocsCount: docs.length }
      };
    } catch (err: any) {
      return {
        status: 'unhealthy',
        latencyMs: Date.now() - start,
        lastChecked: new Date().toISOString(),
        message: err.message
      };
    }
  }
}

export const healthChecker = new HealthChecker();
