import crypto from 'crypto';
import { getDatabase, runTransaction } from '../database/connection';
import { DomainEvent, DomainEventName, BackgroundJob, JobQueueName, BackgroundJobType } from './types';

type EventHandler = (event: DomainEvent) => Promise<void> | void;

export class EventBus {
  private static instance: EventBus;
  private subscribers: Map<DomainEventName | '*', Set<EventHandler>> = new Map();
  private isProcessing = false;

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe a handler to a specific domain event or '*' for all events
   */
  public subscribe(eventName: DomainEventName | '*', handler: EventHandler): () => void {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, new Set());
    }
    this.subscribers.get(eventName)!.add(handler);

    return () => {
      this.subscribers.get(eventName)?.delete(handler);
    };
  }

  /**
   * Atomically publish a domain event:
   * 1. Persists event to SQLite `domain_events`
   * 2. Triggers in-process event listeners to enqueue background jobs or handle side-effects
   */
  public async publish<T = any>(
    eventName: DomainEventName,
    aggregateType: string,
    aggregateId: string,
    payload: T,
    options?: {
      userId?: string;
      role?: string;
      idempotencyKey?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<DomainEvent<T>> {
    const db = getDatabase();
    const now = new Date().toISOString();
    const eventId = `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const idempotencyKey = options?.idempotencyKey || `idem_${eventName}_${aggregateId}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    const metadata = {
      userId: options?.userId,
      role: options?.role,
      correlationId: `corr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      source: 'souq_desoq_core',
      ...options?.metadata
    };

    const event: DomainEvent<T> = {
      id: eventId,
      eventName,
      aggregateType,
      aggregateId,
      payload,
      metadata,
      idempotencyKey,
      status: 'published',
      createdAt: now,
      publishedAt: now
    };

    // 1. Insert into domain_events table (Protected by DB transaction if one is active)
    try {
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO domain_events (
          id, event_name, aggregate_type, aggregate_id, payload_json,
          metadata_json, idempotency_key, status, created_at, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        event.id,
        event.eventName,
        event.aggregateType,
        event.aggregateId,
        JSON.stringify(event.payload),
        JSON.stringify(event.metadata || {}),
        event.idempotencyKey,
        event.status,
        event.createdAt,
        event.publishedAt
      );
    } catch (err: any) {
      console.error(`[EventBus] Failed to persist domain event ${eventName}:`, err);
      // Even if already existing due to idempotency key, we fetch existing
      const existing = this.getEventByIdempotencyKey(idempotencyKey);
      if (existing) return existing;
    }

    // 2. Dispatch to subscribers asynchronously without blocking caller
    setImmediate(async () => {
      await this.dispatchToSubscribers(event);
    });

    return event;
  }

  /**
   * Dispatches event to registered handlers
   */
  private async dispatchToSubscribers(event: DomainEvent): Promise<void> {
    const specificHandlers = this.subscribers.get(event.eventName) || new Set();
    const wildcardHandlers = this.subscribers.get('*') || new Set();
    const allHandlers = [...specificHandlers, ...wildcardHandlers];

    for (const handler of allHandlers) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[EventBus] Error in subscriber for event ${event.eventName}:`, err);
      }
    }
  }

  /**
   * Enqueue a Background Job into SQLite queue
   */
  public enqueueJob<T = any>(
    queueName: JobQueueName,
    jobType: BackgroundJobType,
    payload: T,
    options?: {
      idempotencyKey?: string;
      priority?: number;
      maxAttempts?: number;
      backoffMs?: number;
      delayMs?: number;
      eventId?: string;
    }
  ): BackgroundJob<T> {
    const db = getDatabase();
    const now = new Date();
    const scheduledAt = options?.delayMs ? new Date(now.getTime() + options.delayMs).toISOString() : now.toISOString();
    const jobId = `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const idempotencyKey = options?.idempotencyKey || `job_idem_${jobType}_${crypto.randomBytes(6).toString('hex')}`;

    const job: BackgroundJob<T> = {
      id: jobId,
      queueName,
      jobType,
      payload,
      idempotencyKey,
      status: 'queued',
      priority: options?.priority ?? 10,
      attempts: 0,
      maxAttempts: options?.maxAttempts ?? 5,
      backoffMs: options?.backoffMs ?? 1000,
      scheduledAt,
      eventId: options?.eventId || null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO background_jobs (
        id, queue_name, job_type, payload_json, idempotency_key, status,
        priority, attempts, max_attempts, backoff_ms, scheduled_at,
        event_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      job.id,
      job.queueName,
      job.jobType,
      JSON.stringify(job.payload),
      job.idempotencyKey,
      job.status,
      job.priority,
      job.attempts,
      job.maxAttempts,
      job.backoffMs,
      job.scheduledAt,
      job.eventId,
      job.createdAt,
      job.updatedAt
    );

    return job;
  }

  /**
   * Query domain events
   */
  public getEvents(options?: {
    eventName?: string;
    aggregateType?: string;
    aggregateId?: string;
    limit?: number;
    offset?: number;
  }): DomainEvent[] {
    const db = getDatabase();
    let query = `
      SELECT id, event_name as eventName, aggregate_type as aggregateType,
             aggregate_id as aggregateId, payload_json as payloadJson,
             metadata_json as metadataJson, idempotency_key as idempotencyKey,
             status, created_at as createdAt, published_at as publishedAt
      FROM domain_events
      WHERE 1=1
    `;
    const params: any[] = [];

    if (options?.eventName) {
      query += ' AND event_name = ?';
      params.push(options.eventName);
    }
    if (options?.aggregateType) {
      query += ' AND aggregate_type = ?';
      params.push(options.aggregateType);
    }
    if (options?.aggregateId) {
      query += ' AND aggregate_id = ?';
      params.push(options.aggregateId);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(options?.limit || 50, options?.offset || 0);

    const rows = db.prepare(query).all(...params) as any[];

    return rows.map(r => ({
      id: r.id,
      eventName: r.eventName,
      aggregateType: r.aggregateType,
      aggregateId: r.aggregateId,
      payload: JSON.parse(r.payloadJson || '{}'),
      metadata: JSON.parse(r.metadataJson || '{}'),
      idempotencyKey: r.idempotencyKey,
      status: r.status,
      createdAt: r.createdAt,
      publishedAt: r.publishedAt
    }));
  }

  public getEventById(id: string): DomainEvent | null {
    const db = getDatabase();
    const r = db.prepare(`
      SELECT id, event_name as eventName, aggregate_type as aggregateType,
             aggregate_id as aggregateId, payload_json as payloadJson,
             metadata_json as metadataJson, idempotency_key as idempotencyKey,
             status, created_at as createdAt, published_at as publishedAt
      FROM domain_events WHERE id = ?
    `).get(id) as any;

    if (!r) return null;
    return {
      id: r.id,
      eventName: r.eventName,
      aggregateType: r.aggregateType,
      aggregateId: r.aggregateId,
      payload: JSON.parse(r.payloadJson || '{}'),
      metadata: JSON.parse(r.metadataJson || '{}'),
      idempotencyKey: r.idempotencyKey,
      status: r.status,
      createdAt: r.createdAt,
      publishedAt: r.publishedAt
    };
  }

  public getEventByIdempotencyKey(key: string): DomainEvent | null {
    const db = getDatabase();
    const r = db.prepare(`
      SELECT id, event_name as eventName, aggregate_type as aggregateType,
             aggregate_id as aggregateId, payload_json as payloadJson,
             metadata_json as metadataJson, idempotency_key as idempotencyKey,
             status, created_at as createdAt, published_at as publishedAt
      FROM domain_events WHERE idempotency_key = ?
    `).get(key) as any;

    if (!r) return null;
    return {
      id: r.id,
      eventName: r.eventName,
      aggregateType: r.aggregateType,
      aggregateId: r.aggregateId,
      payload: JSON.parse(r.payloadJson || '{}'),
      metadata: JSON.parse(r.metadataJson || '{}'),
      idempotencyKey: r.idempotencyKey,
      status: r.status,
      createdAt: r.createdAt,
      publishedAt: r.publishedAt
    };
  }
}

export const eventBus = EventBus.getInstance();
