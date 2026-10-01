export type DomainEventName =
  | 'order.created'
  | 'order.status_updated'
  | 'order.workflow_updated'
  | 'order.delivery_exception'
  | 'courier.shift_settled'
  | 'payment.confirmed'
  | 'payment.failed'
  | 'shipment.updated'
  | 'order.delivered'
  | 'refund.completed'
  | 'dispute.created'
  | 'dispute.resolved'
  | 'payout.requested'
  | 'payout.completed'
  | 'ledger.updated'
  | 'kyc.submitted'
  | 'kyc.reviewed'
  | 'seller.created'
  | 'seller.verified'
  | 'announcement.created'
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'product.stock_low';

export type JobQueueName = 
  | 'notifications' 
  | 'search_indexing' 
  | 'analytics' 
  | 'integrations' 
  | 'communication';

export type BackgroundJobType =
  | 'send_order_notification'
  | 'send_payment_receipt_sms'
  | 'send_shipment_tracking_sms'
  | 'send_kyc_status_notification'
  | 'send_dispute_update_alert'
  | 'reindex_product'
  | 'reindex_all_catalog'
  | 'aggregate_daily_gmv'
  | 'sync_carrier_status'
  | 'process_payout_disbursement'
  | 'audit_compliance_log';

export interface DomainEvent<T = any> {
  id: string;
  eventName: DomainEventName;
  aggregateType: string;
  aggregateId: string;
  payload: T;
  metadata?: {
    userId?: string;
    role?: string;
    correlationId?: string;
    source?: string;
    [key: string]: any;
  };
  idempotencyKey: string;
  status: 'pending' | 'published' | 'failed';
  createdAt: string;
  publishedAt: string;
}

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'dead_letter';

export interface BackgroundJob<T = any> {
  id: string;
  queueName: JobQueueName;
  jobType: BackgroundJobType;
  payload: T;
  idempotencyKey: string;
  status: JobStatus;
  priority: number; // 1 = high, 10 = default, 20 = low
  attempts: number;
  maxAttempts: number;
  backoffMs: number;
  scheduledAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  errorMessage?: string | null;
  stackTrace?: string | null;
  eventId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobExecutionLog {
  id: string;
  jobId: string;
  attemptNumber: number;
  status: 'success' | 'failed' | 'retry';
  durationMs: number;
  errorMessage?: string | null;
  executedAt: string;
}

export interface QueueStats {
  queued: number;
  running: number;
  completed: number;
  failed: number;
  deadLetter: number;
  totalEventsPublished: number;
  avgDurationMs: number;
  activeWorkersCount: number;
  queues: Record<JobQueueName, {
    queued: number;
    running: number;
    completed: number;
    deadLetter: number;
  }>;
}
