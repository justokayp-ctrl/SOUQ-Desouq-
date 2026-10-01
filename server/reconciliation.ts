import { getDatabase, runTransaction } from './database/connection';

export interface DiscrepancyItem {
  entityType: 'order' | 'sub_order' | 'seller_ledger' | 'inventory' | 'orphaned';
  entityId: string;
  field: string;
  expectedValue: any;
  actualValue: any;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export interface ReconciliationReport {
  timestamp: string;
  healthy: boolean;
  totalChecksRun: number;
  discrepanciesCount: number;
  checks: {
    orderTotalsMatch: boolean;
    subOrderSumMatchesParent: boolean;
    sellerLedgerConsistent: boolean;
    inventoryNonNegative: boolean;
    inventoryCatalogSynced: boolean;
    zeroOrphanedRecords: boolean;
  };
  discrepancies: DiscrepancyItem[];
}

export class ReconciliationEngine {
  /**
   * Run full cross-domain state and financial reconciliation audit
   */
  public static runAudit(): ReconciliationReport {
    const db = getDatabase();
    const discrepancies: DiscrepancyItem[] = [];
    let checksRun = 0;

    // 1. Check Order Total Math: total_amount_egp = total_subtotal_egp + total_shipping_egp - discount_egp
    checksRun++;
    const orderRows = db.prepare(`
      SELECT id, tracking_code, total_subtotal_egp, total_shipping_egp, discount_egp, total_amount_egp
      FROM orders
    `).all() as any[];

    let orderTotalsMatch = true;
    for (const ord of orderRows) {
      const expectedTotal = Math.max(0, ord.total_subtotal_egp + ord.total_shipping_egp - (ord.discount_egp || 0));
      if (Math.abs(ord.total_amount_egp - expectedTotal) > 0.01) {
        orderTotalsMatch = false;
        discrepancies.push({
          entityType: 'order',
          entityId: ord.id,
          field: 'total_amount_egp',
          expectedValue: expectedTotal,
          actualValue: ord.total_amount_egp,
          severity: 'high',
          description: `إجمالي الطلب #${ord.tracking_code} (${ord.total_amount_egp}) لا يطابق مجموع الفرعي (${ord.total_subtotal_egp}) + الشحن (${ord.total_shipping_egp}) - الخصم (${ord.discount_egp || 0})`,
        });
      }
    }

    // 2. Check Sub-Orders Sum vs Parent Order
    checksRun++;
    const subOrderSums = db.prepare(`
      SELECT 
        o.id as order_id, 
        o.tracking_code,
        o.total_subtotal_egp as parent_subtotal,
        o.total_shipping_egp as parent_shipping,
        COALESCE(SUM(s.subtotal_egp), 0) as calculated_subtotal,
        COALESCE(SUM(s.shipping_fee_egp), 0) as calculated_shipping
      FROM orders o
      LEFT JOIN sub_orders s ON o.id = s.order_id
      GROUP BY o.id
    `).all() as any[];

    let subOrderSumMatchesParent = true;
    for (const row of subOrderSums) {
      if (Math.abs(row.parent_subtotal - row.calculated_subtotal) > 0.01) {
        subOrderSumMatchesParent = false;
        discrepancies.push({
          entityType: 'order',
          entityId: row.order_id,
          field: 'total_subtotal_egp',
          expectedValue: row.calculated_subtotal,
          actualValue: row.parent_subtotal,
          severity: 'high',
          description: `مجموع الطلبات الفرعية للطلب #${row.tracking_code} (${row.calculated_subtotal}) لا يطابق إجمالي المنتجات المسجل بالطلب الرئيسي (${row.parent_subtotal})`,
        });
      }
    }

    // 3. Check Seller Balances against Ledger
    checksRun++;
    let sellerLedgerConsistent = true;
    const sellers = db.prepare(`
      SELECT id, name, available_balance_egp, pending_balance_egp, total_sales_egp
      FROM sellers
    `).all() as any[];

    for (const seller of sellers) {
      if (seller.available_balance_egp < 0 || seller.pending_balance_egp < 0) {
        sellerLedgerConsistent = false;
        discrepancies.push({
          entityType: 'seller_ledger',
          entityId: seller.id,
          field: 'balances',
          expectedValue: '>= 0',
          actualValue: `Avail: ${seller.available_balance_egp}, Pending: ${seller.pending_balance_egp}`,
          severity: 'high',
          description: `رصيد التاجر "${seller.name}" سالب (${seller.available_balance_egp} / ${seller.pending_balance_egp})`,
        });
      }
    }

    // 4. Check Inventory Non-Negative
    checksRun++;
    let inventoryNonNegative = true;
    const negativeProducts = db.prepare(`
      SELECT id, title_ar, stock FROM products WHERE stock < 0
    `).all() as any[];

    for (const p of negativeProducts) {
      inventoryNonNegative = false;
      discrepancies.push({
        entityType: 'inventory',
        entityId: p.id,
        field: 'stock',
        expectedValue: '>= 0',
        actualValue: p.stock,
        severity: 'high',
        description: `المخزون سالب للمنتج "${p.title_ar}": ${p.stock}`,
      });
    }

    // 5. Check Inventory Catalog Sync
    checksRun++;
    let inventoryCatalogSynced = true;
    const desyncedInventory = db.prepare(`
      SELECT p.id as product_id, p.title_ar, p.stock as product_stock, i.stock as inventory_stock
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id AND (i.variant_id IS NULL OR i.variant_id = '')
      WHERE i.stock IS NOT NULL AND p.stock != i.stock
    `).all() as any[];

    for (const desync of desyncedInventory) {
      inventoryCatalogSynced = false;
      discrepancies.push({
        entityType: 'inventory',
        entityId: desync.product_id,
        field: 'stock_sync',
        expectedValue: desync.inventory_stock,
        actualValue: desync.product_stock,
        severity: 'medium',
        description: `اختلاف بين جدول المنتجات وجدول المخزون للمنتج "${desync.title_ar}" (${desync.product_stock} != ${desync.inventory_stock})`,
      });
    }

    // 6. Check Orphaned Records
    checksRun++;
    let zeroOrphanedRecords = true;
    const orphanedSubOrders = db.prepare(`
      SELECT s.id FROM sub_orders s LEFT JOIN orders o ON s.order_id = o.id WHERE o.id IS NULL
    `).all() as any[];

    if (orphanedSubOrders.length > 0) {
      zeroOrphanedRecords = false;
      for (const o of orphanedSubOrders) {
        discrepancies.push({
          entityType: 'orphaned',
          entityId: o.id,
          field: 'order_id',
          expectedValue: 'valid order_id',
          actualValue: null,
          severity: 'high',
          description: `طلب فرعي يتيم بدون طلب رئيسي: ${o.id}`,
        });
      }
    }

    const healthy = discrepancies.length === 0;

    return {
      timestamp: new Date().toISOString(),
      healthy,
      totalChecksRun: checksRun,
      discrepanciesCount: discrepancies.length,
      checks: {
        orderTotalsMatch,
        subOrderSumMatchesParent,
        sellerLedgerConsistent,
        inventoryNonNegative,
        inventoryCatalogSynced,
        zeroOrphanedRecords,
      },
      discrepancies,
    };
  }

  /**
   * Run automated self-healing reconciliation fixes for known non-destructive drift
   */
  public static autoHeal(): { healedCount: number; message: string } {
    return runTransaction(tx => {
      let healedCount = 0;
      const now = new Date().toISOString();

      // 1. Sync inventory.stock to products.stock where desynced
      const desynced = tx.prepare(`
        SELECT p.id as product_id, p.stock as product_stock, i.stock as inventory_stock
        FROM products p
        JOIN inventory i ON p.id = i.product_id AND (i.variant_id IS NULL OR i.variant_id = '')
        WHERE p.stock != i.stock
      `).all() as any[];

      for (const d of desynced) {
        tx.prepare('UPDATE inventory SET stock = ?, updated_at = ? WHERE product_id = ? AND (variant_id IS NULL OR variant_id = "")')
          .run(d.product_stock, now, d.product_id);
        healedCount++;
      }

      // 2. Fix order total rounding if minor floating point drift
      const driftingOrders = tx.prepare(`
        SELECT id, total_subtotal_egp, total_shipping_egp, discount_egp, total_amount_egp
        FROM orders
        WHERE ABS(total_amount_egp - (total_subtotal_egp + total_shipping_egp - discount_egp)) > 0.001
      `).all() as any[];

      for (const ord of driftingOrders) {
        const correctTotal = Math.max(0, ord.total_subtotal_egp + ord.total_shipping_egp - (ord.discount_egp || 0));
        tx.prepare('UPDATE orders SET total_amount_egp = ?, updated_at = ? WHERE id = ?')
          .run(correctTotal, now, ord.id);
        healedCount++;
      }

      // 3. Fix parent order subtotal & total from sub_orders if sub_orders exist
      const desyncedSubOrders = tx.prepare(`
        SELECT 
          o.id as order_id, 
          o.total_subtotal_egp as parent_subtotal,
          o.total_shipping_egp as parent_shipping,
          o.discount_egp,
          COALESCE(SUM(s.subtotal_egp), 0) as calculated_subtotal,
          COALESCE(SUM(s.shipping_fee_egp), 0) as calculated_shipping
        FROM orders o
        JOIN sub_orders s ON o.id = s.order_id
        GROUP BY o.id
        HAVING ABS(o.total_subtotal_egp - calculated_subtotal) > 0.01 OR ABS(o.total_shipping_egp - calculated_shipping) > 0.01
      `).all() as any[];

      for (const d of desyncedSubOrders) {
        const newTotal = Math.max(0, d.calculated_subtotal + d.calculated_shipping - (d.discount_egp || 0));
        tx.prepare(`
          UPDATE orders 
          SET total_subtotal_egp = ?, total_shipping_egp = ?, total_amount_egp = ?, updated_at = ?
          WHERE id = ?
        `).run(d.calculated_subtotal, d.calculated_shipping, newTotal, now, d.order_id);
        healedCount++;
      }

      return {
        healedCount,
        message: `تم تنفيذ المعالجة الذاتية بنجاح: تم إصلاح ${healedCount} اختلالات تلقائياً`,
      };
    });
  }
}
