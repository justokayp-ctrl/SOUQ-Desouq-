import { eventBus } from './eventBus';
import { DomainEvent } from './types';

/**
 * Registers domain event listeners to decouple core transactional state
 * from non-critical side effects (notifications, search indexing, SMS, analytics, third-party sync).
 */
export function registerDomainEventListeners(): void {
  console.log('⚡ [EventBus] Registering domain event subscribers and background job mappings...');

  // 1. Order Created
  eventBus.subscribe('order.created', async (event: DomainEvent) => {
    const { order, subOrders } = event.payload;

    // Enqueue Customer & Merchant notifications
    eventBus.enqueueJob(
      'notifications',
      'send_order_notification',
      {
        orderId: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalAmountEGP: order.totalAmountEGP,
        subOrderCount: subOrders?.length || 1,
        paymentMethod: order.paymentMethod
      },
      {
        idempotencyKey: `job_notif_ord_${order.id}`,
        priority: 5,
        eventId: event.id
      }
    );

    // Enqueue GMV Analytics aggregation
    eventBus.enqueueJob(
      'analytics',
      'aggregate_daily_gmv',
      {
        orderId: order.id,
        amountEGP: order.totalAmountEGP,
        commissionEGP: subOrders?.reduce((sum: number, s: any) => sum + (s.commissionEGP || 0), 0) || 0,
        district: order.shippingAddress?.district || 'دسوق'
      },
      {
        idempotencyKey: `job_gmv_ord_${order.id}`,
        priority: 15,
        eventId: event.id
      }
    );

    // Enqueue Search & Inventory reindexing for ordered items
    if (subOrders) {
      for (const sub of subOrders) {
        if (sub.items) {
          for (const item of sub.items) {
            eventBus.enqueueJob(
              'search_indexing',
              'reindex_product',
              {
                productId: item.product?.id || item.productId,
                titleAr: item.product?.titleAr || item.productTitleAr,
                stock: item.product?.stock ?? 10
              },
              {
                idempotencyKey: `job_reindex_item_${item.product?.id || item.productId}_${Date.now()}`,
                priority: 20,
                eventId: event.id
              }
            );
          }
        }
      }
    }
  });

  // 2. Payment Confirmed
  eventBus.subscribe('payment.confirmed', async (event: DomainEvent) => {
    const { orderId, amountEGP, paymentMethod, referenceCode, customerPhone } = event.payload;

    eventBus.enqueueJob(
      'communication',
      'send_payment_receipt_sms',
      {
        orderId,
        amountEGP,
        paymentMethod,
        referenceCode: referenceCode || 'EPAY-REF',
        customerPhone: customerPhone || '01012345678'
      },
      {
        idempotencyKey: `job_pay_sms_${orderId}_${referenceCode}`,
        priority: 5,
        eventId: event.id
      }
    );
  });

  // 3. Shipment Updated & Delivered
  eventBus.subscribe('shipment.updated', async (event: DomainEvent) => {
    const { subOrderId, trackingNumber, carrier, customerPhone, status } = event.payload;

    eventBus.enqueueJob(
      'notifications',
      'send_shipment_tracking_sms',
      {
        subOrderId,
        trackingNumber: trackingNumber || 'TRK-DESOQ',
        carrier: carrier || 'DesoqExpress',
        customerPhone: customerPhone || '01012345678',
        status
      },
      {
        idempotencyKey: `job_ship_track_${subOrderId}_${status}`,
        priority: 8,
        eventId: event.id
      }
    );

    eventBus.enqueueJob(
      'integrations',
      'sync_carrier_status',
      {
        subOrderId,
        trackingNumber,
        provider: carrier || 'DesoqExpress'
      },
      {
        idempotencyKey: `job_carrier_sync_${subOrderId}_${status}`,
        priority: 12,
        eventId: event.id
      }
    );
  });

  // 4. Dispute Created & Resolved
  eventBus.subscribe('dispute.resolved', async (event: DomainEvent) => {
    const { disputeId, orderId, status, resolution, refundAmountEGP } = event.payload;

    eventBus.enqueueJob(
      'notifications',
      'send_dispute_update_alert',
      {
        disputeId,
        orderId,
        status,
        resolution
      },
      {
        idempotencyKey: `job_disp_res_${disputeId}_${status}`,
        priority: 5,
        eventId: event.id
      }
    );

    eventBus.enqueueJob(
      'integrations',
      'audit_compliance_log',
      {
        eventType: 'dispute_resolution',
        entityId: disputeId,
        details: { orderId, refundAmountEGP, status }
      },
      {
        idempotencyKey: `job_audit_disp_${disputeId}`,
        priority: 15,
        eventId: event.id
      }
    );
  });

  // 5. KYC Reviewed
  eventBus.subscribe('kyc.reviewed', async (event: DomainEvent) => {
    const { documentId, sellerId, titleAr, status, reviewNotes } = event.payload;

    eventBus.enqueueJob(
      'notifications',
      'send_kyc_status_notification',
      {
        documentId,
        sellerId,
        documentTitle: titleAr,
        status,
        reviewNotes
      },
      {
        idempotencyKey: `job_kyc_notif_${documentId}_${status}`,
        priority: 5,
        eventId: event.id
      }
    );

    eventBus.enqueueJob(
      'integrations',
      'audit_compliance_log',
      {
        eventType: 'kyc_verification_decision',
        entityId: documentId,
        details: { sellerId, status, reviewNotes }
      },
      {
        idempotencyKey: `job_audit_kyc_${documentId}`,
        priority: 15,
        eventId: event.id
      }
    );
  });

  // 6. Payout Requested & Completed
  eventBus.subscribe('payout.requested', async (event: DomainEvent) => {
    const { sellerId, amountEGP, payoutMethod, accountDetails } = event.payload;

    eventBus.enqueueJob(
      'integrations',
      'process_payout_disbursement',
      {
        sellerId,
        amountEGP,
        payoutMethod: payoutMethod || 'InstaPay IPN',
        accountDetails: accountDetails || 'Wallet/IBAN'
      },
      {
        idempotencyKey: `job_payout_proc_${sellerId}_${Date.now()}`,
        priority: 8,
        eventId: event.id
      }
    );
  });

  // 7. Product Created, Updated, Deleted (Search Index Sync)
  eventBus.subscribe('product.created', async (event: DomainEvent) => {
    const { product } = event.payload;

    eventBus.enqueueJob(
      'search_indexing',
      'reindex_product',
      {
        productId: product.id,
        titleAr: product.titleAr,
        category: product.category,
        stock: product.stock
      },
      {
        idempotencyKey: `job_reindex_prod_${product.id}_${Date.now()}`,
        priority: 10,
        eventId: event.id
      }
    );
  });

  eventBus.subscribe('product.updated', async (event: DomainEvent) => {
    const { product } = event.payload;

    eventBus.enqueueJob(
      'search_indexing',
      'reindex_product',
      {
        productId: product.id,
        titleAr: product.titleAr,
        category: product.category,
        stock: product.stock
      },
      {
        idempotencyKey: `job_reindex_prod_${product.id}_${Date.now()}`,
        priority: 9,
        eventId: event.id
      }
    );
  });

  eventBus.subscribe('product.deleted', async (event: DomainEvent) => {
    const { productId } = event.payload;

    eventBus.enqueueJob(
      'search_indexing',
      'reindex_product',
      {
        productId,
        titleAr: 'Deleted Product',
        category: 'deleted',
        stock: 0
      },
      {
        idempotencyKey: `job_del_prod_${productId}_${Date.now()}`,
        priority: 10,
        eventId: event.id
      }
    );
  });
}
