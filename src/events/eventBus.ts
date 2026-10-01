import { OrderStatus, MarketplaceOrder, CartItem } from '../types';

export type MarketplaceEventType =
  | 'order:status_updated'
  | 'order:created'
  | 'order:delivered'
  | 'order:refunded'
  | 'cart:updated'
  | 'inventory:updated'
  | 'notification:broadcast'
  | 'connection:state_changed'
  | string;

export interface OrderStatusUpdatedPayload {
  orderId: string;
  subOrderId?: string;
  status: OrderStatus;
  noteAr?: string;
  updatedOrder?: MarketplaceOrder;
  updatedBy?: string;
  timestamp: string;
  source?: 'local' | 'broadcast' | 'sse';
}

export interface OrderCreatedPayload {
  order: MarketplaceOrder;
  timestamp: string;
  source?: 'local' | 'broadcast' | 'sse';
}

export interface OrderRefundedPayload {
  orderId: string;
  subOrderId: string;
  refundId?: string;
  amountEGP?: number;
  reason?: string;
  timestamp: string;
  source?: 'local' | 'broadcast' | 'sse';
}

type EventCallback<T = any> = (data: T) => void;

/**
 * Client-Side Real-Time Event Bus for Souq Desoq
 * Provides:
 * 1. In-memory publish/subscribe for React components
 * 2. Cross-tab real-time synchronization via BroadcastChannel
 * 3. Server-Sent Events (SSE) connector for multi-user & cross-device instant sync
 */
export class ClientEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;
  private isConnected = false;
  private channelName = 'souq_desoq_realtime_bus';

  constructor() {
    this.initBroadcastChannel();
    this.initServerStream();
  }

  /**
   * Initialize browser BroadcastChannel for instant cross-tab order synchronization
   */
  private initBroadcastChannel() {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
      return;
    }

    try {
      this.broadcastChannel = new BroadcastChannel(this.channelName);
      this.broadcastChannel.onmessage = (event) => {
        if (event && event.data && event.data.type) {
          const { type, payload } = event.data;
          this.emitLocal(type, { ...payload, source: 'broadcast' });
        }
      };
    } catch (e) {
      console.warn('[EventBus] BroadcastChannel not supported or blocked in this environment', e);
    }
  }

  /**
   * Connect to server SSE endpoint for cross-session and cross-device events
   */
  public initServerStream() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return;
    }

    // Close any previous stream
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    try {
      this.eventSource = new EventSource('/api/events/live');

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.emitLocal('connection:state_changed', { connected: true, timestamp: new Date().toISOString() });
      };

      this.eventSource.onmessage = (event) => {
        try {
          if (!event.data) return;
          const data = JSON.parse(event.data);

          if (data.type === 'connected') {
            return;
          }

          // Handle domain events from server event bus
          if (data.eventName) {
            this.handleServerDomainEvent(data);
          }
        } catch (err) {
          // Ignore parse errors from heartbeat pings
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.emitLocal('connection:state_changed', { connected: false, timestamp: new Date().toISOString() });
        // EventSource auto-reconnects natively
      };
    } catch (err) {
      // Fallback silently if SSE endpoint is unavailable
    }
  }

  /**
   * Translate server domain events to client marketplace events
   */
  private handleServerDomainEvent(domainEvent: any) {
    const { eventName, payload } = domainEvent;

    if (eventName === 'shipment.updated' || eventName === 'order.status_updated') {
      this.emitLocal('order:status_updated', {
        orderId: payload.orderId,
        subOrderId: payload.subOrderId,
        status: payload.status,
        noteAr: payload.noteAr,
        timestamp: domainEvent.timestamp || new Date().toISOString(),
        source: 'sse'
      });
    } else if (eventName === 'order.created') {
      this.emitLocal('order:created', {
        order: payload.order,
        timestamp: domainEvent.timestamp || new Date().toISOString(),
        source: 'sse'
      });
    } else if (eventName === 'order.delivered') {
      this.emitLocal('order:delivered', {
        orderId: payload.orderId,
        subOrderId: payload.subOrderId,
        timestamp: domainEvent.timestamp || new Date().toISOString(),
        source: 'sse'
      });
    }
  }

  /**
   * Subscribe a listener to an event
   * @returns Unsubscribe function
   */
  public subscribe<T = any>(event: MarketplaceEventType, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback as EventCallback);
        if (set.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Alias for subscribe
   */
  public on<T = any>(event: MarketplaceEventType, callback: EventCallback<T>): () => void {
    return this.subscribe(event, callback);
  }

  /**
   * Unsubscribe a specific listener
   */
  public off<T = any>(event: MarketplaceEventType, callback: EventCallback<T>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback as EventCallback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Publish an event locally and broadcast across tabs
   */
  public publish<T = any>(event: MarketplaceEventType, payload: T): void {
    const enrichedPayload = {
      ...(typeof payload === 'object' && payload !== null ? payload : { data: payload }),
      source: 'local',
      timestamp: (payload as any)?.timestamp || new Date().toISOString()
    };

    // 1. Emit locally to active React components in current tab
    this.emitLocal(event, enrichedPayload);

    // 2. Broadcast to other open tabs / windows
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: event,
          payload: enrichedPayload
        });
      } catch (err) {
        console.warn('[EventBus] Failed to post message to BroadcastChannel', err);
      }
    }
  }

  /**
   * Alias for publish
   */
  public emit<T = any>(event: MarketplaceEventType, payload: T): void {
    this.publish(event, payload);
  }

  /**
   * Emit locally to subscribed listeners
   */
  private emitLocal(event: string, payload: any) {
    // Exact event match
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`[EventBus] Error in listener for event "${event}":`, e);
        }
      });
    }

    // Wildcard listeners ('*')
    const allSet = this.listeners.get('*');
    if (allSet) {
      allSet.forEach((cb) => {
        try {
          cb({ event, payload });
        } catch (e) {
          console.error(`[EventBus] Error in wildcard listener:`, e);
        }
      });
    }
  }

  /**
   * Returns current connection state
   */
  public getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Clean up connections on unmount
   */
  public destroy() {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.listeners.clear();
  }
}

// Global Singleton Instance
export const clientEventBus = new ClientEventBus();
