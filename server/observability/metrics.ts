import { getDatabase } from '../database/connection';
import { ReliabilityMetrics } from './types';
import { circuitBreakerRegistry } from './circuitBreaker';
import { rateLimiter } from './rateLimiter';
import { workerEngine } from '../workers/workerEngine';

class MetricsCollector {
  private latencySamples: number[] = [];
  private readonly maxLatencySamples = 1000;
  
  private totalRequests = 0;
  private status2xx = 0;
  private status4xx = 0;
  private status5xx = 0;

  private paymentAttempts = 0;
  private paymentSuccesses = 0;
  private paymentFailures = 0;

  private dbQueryDurations: number[] = [];
  private readonly maxDbSamples = 500;
  private slowDbQueriesCount = 0;

  private requestTimestamps: number[] = [];

  constructor() {
    // Prune request timestamps older than 60s every 10s
    setInterval(() => {
      const oneMinuteAgo = Date.now() - 60000;
      this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);
    }, 10000);
  }

  /**
   * Record HTTP request completion
   */
  public recordHttpRequest(durationMs: number, statusCode: number): void {
    this.totalRequests++;
    this.requestTimestamps.push(Date.now());

    this.latencySamples.push(durationMs);
    if (this.latencySamples.length > this.maxLatencySamples) {
      this.latencySamples.shift();
    }

    if (statusCode >= 200 && statusCode < 300) {
      this.status2xx++;
    } else if (statusCode >= 400 && statusCode < 500) {
      this.status4xx++;
    } else if (statusCode >= 500) {
      this.status5xx++;
    }
  }

  /**
   * Record Database Query
   */
  public recordDbQuery(durationMs: number): void {
    this.dbQueryDurations.push(durationMs);
    if (this.dbQueryDurations.length > this.maxDbSamples) {
      this.dbQueryDurations.shift();
    }
    if (durationMs > 50) {
      this.slowDbQueriesCount++;
    }
  }

  /**
   * Record Payment Transaction Attempt
   */
  public recordPayment(success: boolean): void {
    this.paymentAttempts++;
    if (success) {
      this.paymentSuccesses++;
    } else {
      this.paymentFailures++;
    }
  }

  private calculatePercentile(samples: number[], p: number): number {
    if (samples.length === 0) return 0;
    const sorted = [...samples].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return Math.round(sorted[Math.max(0, index)] * 10) / 10;
  }

  /**
   * Get real-time comprehensive reliability metrics snapshot
   */
  public getMetrics(): ReliabilityMetrics {
    const sortedLatencies = [...this.latencySamples];
    const avgLatency = sortedLatencies.length > 0
      ? Math.round((sortedLatencies.reduce((a, b) => a + b, 0) / sortedLatencies.length) * 10) / 10
      : 0;

    const p50 = this.calculatePercentile(sortedLatencies, 50);
    const p95 = this.calculatePercentile(sortedLatencies, 95);
    const p99 = this.calculatePercentile(sortedLatencies, 99);

    const totalErrors = this.status4xx + this.status5xx;
    const errorRate = this.totalRequests > 0
      ? Math.round((totalErrors / this.totalRequests) * 1000) / 10
      : 0;

    // Database stats
    let tableCount = 0;
    let dbIntegrity: 'ok' | 'corrupt' | 'unknown' = 'unknown';
    try {
      const db = getDatabase();
      const tables = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table'").get() as any;
      tableCount = tables?.count || 0;
      const integrityCheck = db.prepare('PRAGMA integrity_check').get() as any;
      dbIntegrity = integrityCheck?.integrity_check === 'ok' ? 'ok' : 'corrupt';
    } catch {
      dbIntegrity = 'unknown';
    }

    const avgDbDuration = this.dbQueryDurations.length > 0
      ? Math.round((this.dbQueryDurations.reduce((a, b) => a + b, 0) / this.dbQueryDurations.length) * 10) / 10
      : 0;

    // Worker queue stats
    const workerStats = workerEngine.getStats();

    // Payment stats
    const paymentSuccessRate = this.paymentAttempts > 0
      ? Math.round((this.paymentSuccesses / this.paymentAttempts) * 1000) / 10
      : 100;

    return {
      http: {
        totalRequests: this.totalRequests,
        requestsPerMinute: this.requestTimestamps.length,
        latencyP50Ms: p50,
        latencyP95Ms: p95,
        latencyP99Ms: p99,
        avgLatencyMs: avgLatency,
        status2xx: this.status2xx,
        status4xx: this.status4xx,
        status5xx: this.status5xx,
        errorRatePercent: errorRate
      },
      database: {
        queryCount: this.dbQueryDurations.length,
        avgQueryDurationMs: avgDbDuration,
        slowQueriesCount: this.slowDbQueriesCount,
        tablesCount: tableCount,
        integrity: dbIntegrity
      },
      queues: {
        totalQueued: workerStats.queued,
        totalRunning: workerStats.running,
        totalCompleted: workerStats.completed,
        totalFailed: workerStats.failed,
        deadLetterCount: workerStats.deadLetter
      },
      payments: {
        totalAttempts: this.paymentAttempts,
        successfulPayments: this.paymentSuccesses,
        failedPayments: this.paymentFailures,
        successRatePercent: paymentSuccessRate
      },
      rateLimiter: rateLimiter.getStats(),
      circuitBreakers: circuitBreakerRegistry.getAll()
    };
  }

  /**
   * Reset metric counters (for tests)
   */
  public reset(): void {
    this.latencySamples = [];
    this.totalRequests = 0;
    this.status2xx = 0;
    this.status4xx = 0;
    this.status5xx = 0;
    this.paymentAttempts = 0;
    this.paymentSuccesses = 0;
    this.paymentFailures = 0;
    this.dbQueryDurations = [];
    this.slowDbQueriesCount = 0;
    this.requestTimestamps = [];
  }
}

export const metricsCollector = new MetricsCollector();
