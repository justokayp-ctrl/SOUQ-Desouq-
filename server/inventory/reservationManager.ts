import crypto from 'crypto';
import { getDatabase, runTransaction } from '../database/connection';

export interface ReservationItem {
  id: string;
  productId: string;
  variantId?: string;
  size?: string;
  sessionId: string;
  userId?: string;
  quantity: number;
  status: 'active' | 'converted' | 'expired' | 'released';
  createdAt: string;
  expiresAt: string;
  remainingSeconds: number;
  orderId?: string;
}

export interface ItemAvailabilityReport {
  productId: string;
  variantId?: string;
  totalStock: number;
  reservedByOthers: number;
  reservedByCaller: number;
  availableNow: number;
  isScarce: boolean;
  hasCompetitorHold: boolean;
  callerReservationId?: string;
  callerExpiresAt?: string;
  callerRemainingSeconds?: number;
}

export class InventoryReservationManager {
  private static instance: InventoryReservationManager;
  private defaultTtlMinutes = 10;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Background timer to clean up expired reservations every 30 seconds
    this.cleanupInterval = setInterval(() => {
      try {
        this.cleanupExpiredReservations();
      } catch (err) {
        // silent catch
      }
    }, 30000);
  }

  public static getInstance(): InventoryReservationManager {
    if (!InventoryReservationManager.instance) {
      InventoryReservationManager.instance = new InventoryReservationManager();
    }
    return InventoryReservationManager.instance;
  }

  /**
   * Lazily expire overdue reservations
   */
  public cleanupExpiredReservations(): number {
    const db = getDatabase();
    const now = new Date().toISOString();
    const result = db.prepare(`
      UPDATE inventory_reservations 
      SET status = 'expired' 
      WHERE status = 'active' AND expires_at <= ?
    `).run(now);
    return Number(result.changes);
  }

  /**
   * Reserve an item / size variant for checkout with TTL lock
   */
  public reserveItem(params: {
    productId: string;
    variantId?: string;
    size?: string;
    quantity: number;
    sessionId: string;
    userId?: string;
    durationMinutes?: number;
    idempotencyKey?: string;
  }): {
    success: boolean;
    reservation?: ReservationItem;
    availableStock?: number;
    reservedByOthers?: number;
    isIdempotentReplay?: boolean;
    error?: string;
  } {
    const { productId, variantId, size, quantity, sessionId, userId, idempotencyKey } = params;
    const durationMinutes = params.durationMinutes || this.defaultTtlMinutes;

    if (!productId || !sessionId || quantity <= 0) {
      return { success: false, error: 'بيانات الحجز غير صالحة' };
    }

    // Always clean up expired entries first
    this.cleanupExpiredReservations();

    const now = new Date();
    const nowIso = now.toISOString();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();

    try {
      return runTransaction((tx) => {
        // Idempotency check: if reservation already exists with this idempotency key and is active
        if (idempotencyKey) {
          const existingByIdem = tx.prepare(`
            SELECT id, product_id, variant_id, size, session_id, user_id, quantity, status, created_at, expires_at
            FROM inventory_reservations
            WHERE idempotency_key = ? AND status = 'active' AND expires_at > ?
          `).get(idempotencyKey, nowIso) as any;

          if (existingByIdem) {
            const remainingSeconds = Math.max(0, Math.floor((new Date(existingByIdem.expires_at).getTime() - now.getTime()) / 1000));
            return {
              success: true,
              availableStock: 0,
              reservedByOthers: 0,
              isIdempotentReplay: true,
              reservation: {
                id: existingByIdem.id,
                productId: existingByIdem.product_id,
                variantId: existingByIdem.variant_id,
                size: existingByIdem.size,
                sessionId: existingByIdem.session_id,
                userId: existingByIdem.user_id,
                quantity: existingByIdem.quantity,
                status: existingByIdem.status,
                createdAt: existingByIdem.created_at,
                expiresAt: existingByIdem.expires_at,
                remainingSeconds
              }
            };
          }
        }

        // 1. Check physical stock in database
        let totalStock = 0;
        let productTitle = 'المنتج';

        const prodRow = tx.prepare('SELECT id, stock, title_ar, status FROM products WHERE id = ?').get(productId) as any;
        if (!prodRow || prodRow.status === 'suspended') {
          return { success: false, error: 'المنتج غير متاح حالياً' };
        }
        productTitle = prodRow.title_ar;
        totalStock = prodRow.stock || 0;

        if (variantId) {
          const varRow = tx.prepare('SELECT id, stock, name FROM product_variants WHERE id = ? AND product_id = ?')
            .get(variantId, productId) as any;
          if (!varRow) {
            return { success: false, error: 'المقاس / المتغير المطلوب غير متوفر' };
          }
          totalStock = varRow.stock || 0;
        }

        // 2. Query active unexpired reservations by others for this exact item / variant
        let reservedByOthersQuery: any;
        if (variantId) {
          reservedByOthersQuery = tx.prepare(`
            SELECT COALESCE(SUM(quantity), 0) as reserved_qty
            FROM inventory_reservations
            WHERE product_id = ? AND variant_id = ? AND status = 'active' AND expires_at > ? AND session_id != ?
          `).get(productId, variantId, nowIso, sessionId);
        } else {
          reservedByOthersQuery = tx.prepare(`
            SELECT COALESCE(SUM(quantity), 0) as reserved_qty
            FROM inventory_reservations
            WHERE product_id = ? AND (variant_id IS NULL OR variant_id = '') AND status = 'active' AND expires_at > ? AND session_id != ?
          `).get(productId, nowIso, sessionId);
        }

        const reservedByOthers = Number(reservedByOthersQuery?.reserved_qty || 0);
        const availableStock = Math.max(0, totalStock - reservedByOthers);

        if (availableStock < quantity) {
          if (reservedByOthers > 0) {
            return {
              success: false,
              availableStock,
              reservedByOthers,
              error: `هذا المقاس محجوز مؤقتاً في سلة عميل آخر لمدة دقائق. الكمية المتاحة حالياً: ${availableStock}`
            };
          }
          return {
            success: false,
            availableStock,
            reservedByOthers,
            error: `عفواً، الكمية المتوفرة من "${productTitle}" هي ${availableStock} فقط`
          };
        }

        // 3. Look for caller's existing active reservation for the same item/variant to update or reuse
        let existingRes: any;
        if (variantId) {
          existingRes = tx.prepare(`
            SELECT id FROM inventory_reservations
            WHERE product_id = ? AND variant_id = ? AND session_id = ? AND status = 'active' AND expires_at > ?
          `).get(productId, variantId, sessionId, nowIso);
        } else {
          existingRes = tx.prepare(`
            SELECT id FROM inventory_reservations
            WHERE product_id = ? AND (variant_id IS NULL OR variant_id = '') AND session_id = ? AND status = 'active' AND expires_at > ?
          `).get(productId, sessionId, nowIso);
        }

        let reservationId: string;
        if (existingRes) {
          reservationId = existingRes.id;
          tx.prepare(`
            UPDATE inventory_reservations
            SET quantity = ?, expires_at = ?, size = ?, user_id = COALESCE(?, user_id),
                idempotency_key = COALESCE(?, idempotency_key)
            WHERE id = ?
          `).run(quantity, expiresAt, size || null, userId || null, idempotencyKey || null, reservationId);
        } else {
          reservationId = `res_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
          tx.prepare(`
            INSERT INTO inventory_reservations (
              id, idempotency_key, product_id, variant_id, size, session_id, user_id, quantity, status, created_at, expires_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
          `).run(
            reservationId,
            idempotencyKey || null,
            productId,
            variantId || null,
            size || null,
            sessionId,
            userId || null,
            quantity,
            nowIso,
            expiresAt
          );
        }

        const remainingSeconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now.getTime()) / 1000));

        return {
          success: true,
          availableStock,
          reservedByOthers,
          reservation: {
            id: reservationId,
            productId,
            variantId,
            size,
            sessionId,
            userId,
            quantity,
            status: 'active',
            createdAt: nowIso,
            expiresAt,
            remainingSeconds
          }
        };
      });
    } catch (err: any) {
      return { success: false, error: err.message || 'فشل تسجيل حجز المقاس' };
    }
  }

  /**
   * Release specific reservation (e.g. user removed from cart or cancelled)
   */
  public releaseReservation(reservationId: string, sessionId?: string): boolean {
    const db = getDatabase();
    let stmt: any;
    if (sessionId) {
      stmt = db.prepare(`
        UPDATE inventory_reservations
        SET status = 'released'
        WHERE id = ? AND session_id = ? AND status = 'active'
      `).run(reservationId, sessionId);
    } else {
      stmt = db.prepare(`
        UPDATE inventory_reservations
        SET status = 'released'
        WHERE id = ? AND status = 'active'
      `).run(reservationId);
    }
    return stmt.changes > 0;
  }

  /**
   * Release all active reservations for a session
   */
  public releaseSessionReservations(sessionId: string): number {
    if (!sessionId) return 0;
    const db = getDatabase();
    const result = db.prepare(`
      UPDATE inventory_reservations
      SET status = 'released'
      WHERE session_id = ? AND status = 'active'
    `).run(sessionId);
    return Number(result.changes);
  }

  /**
   * Get all active reservations for a given session with remaining seconds
   */
  public getActiveReservations(sessionId: string): ReservationItem[] {
    if (!sessionId) return [];
    this.cleanupExpiredReservations();

    const db = getDatabase();
    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    const rows = db.prepare(`
      SELECT id, product_id, variant_id, size, session_id, user_id, quantity, status, created_at, expires_at, order_id
      FROM inventory_reservations
      WHERE session_id = ? AND status = 'active' AND expires_at > ?
      ORDER BY expires_at ASC
    `).all(sessionId, nowIso) as any[];

    return rows.map((r) => ({
      id: r.id,
      productId: r.product_id,
      variantId: r.variant_id || undefined,
      size: r.size || undefined,
      sessionId: r.session_id,
      userId: r.user_id || undefined,
      quantity: r.quantity,
      status: r.status,
      createdAt: r.created_at,
      expiresAt: r.expires_at,
      remainingSeconds: Math.max(0, Math.floor((new Date(r.expires_at).getTime() - nowMs) / 1000)),
      orderId: r.order_id || undefined
    }));
  }

  /**
   * Check availability and reservation holds on a product or variant
   */
  public getItemAvailability(productId: string, variantId?: string, sessionId?: string): ItemAvailabilityReport {
    this.cleanupExpiredReservations();
    const db = getDatabase();
    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    let totalStock = 0;
    const prod = db.prepare('SELECT stock FROM products WHERE id = ?').get(productId) as any;
    totalStock = prod?.stock || 0;

    if (variantId) {
      const v = db.prepare('SELECT stock FROM product_variants WHERE id = ? AND product_id = ?').get(variantId, productId) as any;
      if (v) totalStock = v.stock || 0;
    }

    let reservedByOthers = 0;
    let reservedByCaller = 0;
    let callerReservationId: string | undefined = undefined;
    let callerExpiresAt: string | undefined = undefined;
    let callerRemainingSeconds: number | undefined = undefined;

    let rows: any[];
    if (variantId) {
      rows = db.prepare(`
        SELECT id, session_id, quantity, expires_at
        FROM inventory_reservations
        WHERE product_id = ? AND variant_id = ? AND status = 'active' AND expires_at > ?
      `).all(productId, variantId, nowIso) as any[];
    } else {
      rows = db.prepare(`
        SELECT id, session_id, quantity, expires_at
        FROM inventory_reservations
        WHERE product_id = ? AND (variant_id IS NULL OR variant_id = '') AND status = 'active' AND expires_at > ?
      `).all(productId, nowIso) as any[];
    }

    for (const r of rows) {
      if (sessionId && r.session_id === sessionId) {
        reservedByCaller += r.quantity;
        callerReservationId = r.id;
        callerExpiresAt = r.expires_at;
        callerRemainingSeconds = Math.max(0, Math.floor((new Date(r.expires_at).getTime() - nowMs) / 1000));
      } else {
        reservedByOthers += r.quantity;
      }
    }

    const availableNow = Math.max(0, totalStock - reservedByOthers);

    return {
      productId,
      variantId,
      totalStock,
      reservedByOthers,
      reservedByCaller,
      availableNow,
      isScarce: totalStock <= 3,
      hasCompetitorHold: reservedByOthers > 0,
      callerReservationId,
      callerExpiresAt,
      callerRemainingSeconds
    };
  }

  /**
   * Convert session reservations to an order atomically within an existing transaction
   */
  public convertReservationsForOrder(
    tx: any,
    sessionId: string,
    orderId: string,
    items: { productId: string; variantId?: string }[]
  ): void {
    if (!sessionId || !orderId || items.length === 0) return;

    for (const item of items) {
      if (item.variantId) {
        tx.prepare(`
          UPDATE inventory_reservations
          SET status = 'converted', order_id = ?
          WHERE session_id = ? AND product_id = ? AND variant_id = ? AND status = 'active'
        `).run(orderId, sessionId, item.productId, item.variantId);
      } else {
        tx.prepare(`
          UPDATE inventory_reservations
          SET status = 'converted', order_id = ?
          WHERE session_id = ? AND product_id = ? AND (variant_id IS NULL OR variant_id = '') AND status = 'active'
        `).run(orderId, sessionId, item.productId);
      }
    }
  }
}

export const inventoryReservationManager = InventoryReservationManager.getInstance();
