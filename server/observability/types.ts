export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface StructuredLog {
  id: string;
  level: LogLevel;
  message: string;
  service: string;
  traceId: string;
  spanId?: string;
  action?: string;
  userId?: string;
  userRole?: string;
  durationMs?: number;
  statusCode?: number;
  clientIp?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    code?: string;
    stack?: string;
  };
  timestamp: string;
}

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AuditStatus = 'success' | 'failure' | 'denied';

export interface SecurityAuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  status: AuditStatus;
  severity: AuditSeverity;
  createdAt: string;
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  fallbackCalls: number;
  consecutiveFailures: number;
}

export interface CircuitBreakerInfo {
  name: string;
  state: CircuitBreakerState;
  failureThreshold: number;
  recoveryTimeoutMs: number;
  failureCount: number;
  consecutiveFailures: number;
  lastFailureTime?: string;
  lastSuccessTime?: string;
  lastStateChange: string;
  nextAttemptTime?: string;
  stats: CircuitBreakerStats;
}

export interface ServiceHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  lastChecked: string;
  message?: string;
  details?: Record<string, any>;
}

export interface DeepReadinessReport {
  ready: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptimeSeconds: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealthStatus;
    eventBus: ServiceHealthStatus;
    workers: ServiceHealthStatus;
    storage: ServiceHealthStatus;
    fawryGateway: ServiceHealthStatus;
    shippingGateway: ServiceHealthStatus;
    smsGateway: ServiceHealthStatus;
  };
  system: {
    memoryHeapUsedMB: number;
    memoryHeapTotalMB: number;
    memoryRssMB: number;
    nodeVersion: string;
    eventLoopLagMs: number;
  };
}

export interface ReliabilityMetrics {
  http: {
    totalRequests: number;
    requestsPerMinute: number;
    latencyP50Ms: number;
    latencyP95Ms: number;
    latencyP99Ms: number;
    avgLatencyMs: number;
    status2xx: number;
    status4xx: number;
    status5xx: number;
    errorRatePercent: number;
  };
  database: {
    queryCount: number;
    avgQueryDurationMs: number;
    slowQueriesCount: number;
    tablesCount: number;
    integrity: 'ok' | 'corrupt' | 'unknown';
  };
  queues: {
    totalQueued: number;
    totalRunning: number;
    totalCompleted: number;
    totalFailed: number;
    deadLetterCount: number;
  };
  payments: {
    totalAttempts: number;
    successfulPayments: number;
    failedPayments: number;
    successRatePercent: number;
  };
  rateLimiter: {
    totalBlocked: number;
    activeTrackedIps: number;
  };
  circuitBreakers: CircuitBreakerInfo[];
}
