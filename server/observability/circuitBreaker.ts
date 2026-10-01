import { CircuitBreakerError } from './errors';
import { CircuitBreakerInfo, CircuitBreakerState, CircuitBreakerStats } from './types';
import { logger } from './logger';
import { auditLogger } from './auditLogger';

export interface CircuitBreakerOptions {
  name: string;
  failureThreshold?: number; // Failures before opening breaker
  recoveryTimeoutMs?: number; // Time to wait in OPEN state before trying HALF_OPEN
  halfOpenSuccessThreshold?: number; // Successes required in HALF_OPEN to close
  fallback?: <T>(err: Error) => Promise<T> | T;
}

export class CircuitBreaker {
  public readonly name: string;
  private state: CircuitBreakerState = 'CLOSED';
  private failureThreshold: number;
  private recoveryTimeoutMs: number;
  private halfOpenSuccessThreshold: number;
  private consecutiveFailures = 0;
  private consecutiveSuccesses = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private lastStateChange: Date = new Date();
  private fallbackFn?: <T>(err: Error) => Promise<T> | T;

  private stats: CircuitBreakerStats = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    fallbackCalls: 0,
    consecutiveFailures: 0
  };

  constructor(options: CircuitBreakerOptions) {
    this.name = options.name;
    this.failureThreshold = options.failureThreshold ?? 3;
    this.recoveryTimeoutMs = options.recoveryTimeoutMs ?? 15000;
    this.halfOpenSuccessThreshold = options.halfOpenSuccessThreshold ?? 2;
    this.fallbackFn = options.fallback;
  }

  public getState(): CircuitBreakerState {
    if (this.state === 'OPEN') {
      const now = Date.now();
      const timeSinceFailure = now - this.lastStateChange.getTime();
      if (timeSinceFailure > this.recoveryTimeoutMs) {
        this.transitionTo('HALF_OPEN', 'Recovery timeout elapsed; probing downstream service.');
      }
    }
    return this.state;
  }

  private transitionTo(newState: CircuitBreakerState, reason: string): void {
    const previousState = this.state;
    this.state = newState;
    this.lastStateChange = new Date();

    if (newState === 'CLOSED') {
      this.consecutiveFailures = 0;
      this.consecutiveSuccesses = 0;
    } else if (newState === 'HALF_OPEN') {
      this.consecutiveSuccesses = 0;
    }

    logger.warn(`[CIRCUIT BREAKER] ${this.name} transitioned from ${previousState} to ${newState}: ${reason}`, {
      service: 'circuit_breaker',
      action: 'state_transition',
      metadata: {
        breakerName: this.name,
        previousState,
        newState,
        reason
      }
    });

    auditLogger.log({
      actorId: 'system-circuit-breaker',
      actorRole: 'admin',
      action: 'CIRCUIT_BREAKER_STATE_CHANGE',
      resourceType: 'circuit_breaker',
      resourceId: this.name,
      status: 'success',
      severity: newState === 'OPEN' ? 'high' : 'medium',
      details: { previousState, newState, reason }
    });
  }

  /**
   * Execute an operation wrapped in the circuit breaker
   */
  public async execute<T>(action: () => Promise<T>): Promise<T> {
    const currentState = this.getState();
    this.stats.totalCalls++;

    if (currentState === 'OPEN') {
      this.stats.failedCalls++;
      if (this.fallbackFn) {
        this.stats.fallbackCalls++;
        return await this.fallbackFn(new CircuitBreakerError(this.name));
      }
      throw new CircuitBreakerError(this.name);
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (err: any) {
      this.onFailure(err);
      if (this.fallbackFn) {
        this.stats.fallbackCalls++;
        return await this.fallbackFn(err);
      }
      throw err;
    }
  }

  private onSuccess(): void {
    this.stats.successfulCalls++;
    this.lastSuccessTime = new Date();
    this.consecutiveFailures = 0;

    if (this.state === 'HALF_OPEN') {
      this.consecutiveSuccesses++;
      if (this.consecutiveSuccesses >= this.halfOpenSuccessThreshold) {
        this.transitionTo('CLOSED', `Consecutive successful probes (${this.consecutiveSuccesses}) met threshold.`);
      }
    }
  }

  private onFailure(err: Error): void {
    this.stats.failedCalls++;
    this.lastFailureTime = new Date();
    this.consecutiveFailures++;
    this.stats.consecutiveFailures = this.consecutiveFailures;

    if (this.state === 'HALF_OPEN') {
      this.transitionTo('OPEN', `Probe failed during HALF_OPEN state: ${err.message}`);
    } else if (this.state === 'CLOSED' && this.consecutiveFailures >= this.failureThreshold) {
      this.transitionTo('OPEN', `Consecutive failures (${this.consecutiveFailures}) reached threshold (${this.failureThreshold}): ${err.message}`);
    }
  }

  public trip(reason = 'Manual trip triggered for reliability testing'): void {
    this.transitionTo('OPEN', reason);
  }

  public reset(reason = 'Manual reset triggered by administrator'): void {
    this.transitionTo('CLOSED', reason);
  }

  public getInfo(): CircuitBreakerInfo {
    const currentState = this.getState();
    const nextAttempt = currentState === 'OPEN'
      ? new Date(this.lastStateChange.getTime() + this.recoveryTimeoutMs).toISOString()
      : undefined;

    return {
      name: this.name,
      state: currentState,
      failureThreshold: this.failureThreshold,
      recoveryTimeoutMs: this.recoveryTimeoutMs,
      failureCount: this.stats.failedCalls,
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime?.toISOString(),
      lastSuccessTime: this.lastSuccessTime?.toISOString(),
      lastStateChange: this.lastStateChange.toISOString(),
      nextAttemptTime: nextAttempt,
      stats: { ...this.stats }
    };
  }
}

/**
 * Registry of circuit breakers for all critical external services in Souq Desoq
 */
class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();

  constructor() {
    this.register(new CircuitBreaker({
      name: 'FawryPaymentGateway',
      failureThreshold: 3,
      recoveryTimeoutMs: 15000
    }));

    this.register(new CircuitBreaker({
      name: 'EgyptianPostShippingCarrier',
      failureThreshold: 3,
      recoveryTimeoutMs: 15000
    }));

    this.register(new CircuitBreaker({
      name: 'VodafoneCashGateway',
      failureThreshold: 3,
      recoveryTimeoutMs: 15000
    }));

    this.register(new CircuitBreaker({
      name: 'EgyptianSmsGateway',
      failureThreshold: 4,
      recoveryTimeoutMs: 20000
    }));
  }

  public register(breaker: CircuitBreaker): void {
    this.breakers.set(breaker.name, breaker);
  }

  public get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  public getAll(): CircuitBreakerInfo[] {
    return Array.from(this.breakers.values()).map(b => b.getInfo());
  }

  public resetAll(): void {
    this.breakers.forEach(b => b.reset());
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();
