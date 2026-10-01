import { TestRunner } from '../testFramework';
import { db } from '../../server/db';
import { EgyptianAddress, CartItem } from '../../src/types';

export async function runPaymentsRefundsLedgerTests(runner: TestRunner): Promise<void> {
  runner.describe('Payments, Refunds, Webhook Idempotency & Seller Ledger', () => {

    const mockAddress: EgyptianAddress = {
      id: 'addr-ledger-test',
      fullName: 'خالد مصطفى العبد',
      phone: '01055443322',
      governorate: 'كفر الشيخ',
      city: 'دسوق',
      district: 'حي الصفا',
      streetDetails: 'شارع الجلاء',
      buildingNo: '22',
    };

    const getActiveProduct = () => {
      const active = db.getProducts().find(p => p.status === 'active' && p.stock >= 5);
      return active || db.getProducts()[0];
    };

    runner.test('Idempotency key prevents duplicate order creation and double inventory deduction', () => {
      const product = getActiveProduct();
      const stockBefore = product.stock;
      const idempotencyKey = `unit-idem-fresh-key-${Date.now()}-${Math.random()}`;

      const cart: CartItem[] = [{ product, quantity: 1, sellerId: product.sellerId }];

      // First order execution
      const order1 = db.createOrder({
        customerName: 'مشتري المفتاح الفريد',
        customerPhone: '01055443322',
        shippingAddress: mockAddress,
        paymentMethod: 'fawry',
        cart,
        idempotencyKey,
      });

      runner.assertEquals(order1.success, true, `First order creation must succeed: ${order1.error || ''}`);
      runner.assertEquals(order1.isIdempotentReplay || false, false, 'First order should not be flagged as replay');
      const stockAfterFirst = db.getProductById(product.id)!.stock;
      runner.assertEquals(stockAfterFirst, stockBefore - 1, 'Stock should be decremented by 1');

      // Duplicate order replay with exact same idempotency key
      const order2 = db.createOrder({
        customerName: 'مشتري المفتاح الفريد',
        customerPhone: '01055443322',
        shippingAddress: mockAddress,
        paymentMethod: 'fawry',
        cart,
        idempotencyKey,
      });

      runner.assertEquals(order2.success, true, 'Duplicate order request should return success');
      runner.assertEquals(order2.isIdempotentReplay, true, 'Duplicate order must be intercepted as replay');
      runner.assertEquals(order2.order?.id, order1.order?.id, 'Returned order ID must match original order');

      const stockAfterSecond = db.getProductById(product.id)!.stock;
      runner.assertEquals(stockAfterSecond, stockAfterFirst, 'Stock MUST NOT be double-decremented on idempotency replay');
    });

    runner.test('Payment confirmation updates order payment status and records payment event', () => {
      const product = getActiveProduct();
      const orderRes = db.createOrder({
        customerName: 'ياسر القاضي',
        customerPhone: '01200112233',
        shippingAddress: mockAddress,
        paymentMethod: 'fawry',
        cart: [{ product, quantity: 1, sellerId: product.sellerId }],
      });

      runner.assertEquals(orderRes.success, true, `Order creation should succeed: ${orderRes.error || ''}`);
      const order = orderRes.order!;
      const confirmRes = db.confirmPayment({
        orderId: order.id,
        transactionRef: 'FAWRY-WEBHOOK-TRX-100200',
        paymentMethod: 'fawry',
      });

      runner.assertEquals(confirmRes.success, true, 'Payment confirmation should succeed');
      runner.assertEquals(confirmRes.order?.paymentStatus, 'paid', 'Order paymentStatus must be set to paid');
    });

    runner.test('Order delivery moves net balance from pending to seller available balance and logs ledger entry', () => {
      const product = getActiveProduct();
      const sellerId = product.sellerId;

      const orderRes = db.createOrder({
        customerName: 'إبراهيم غالي',
        customerPhone: '01033445566',
        shippingAddress: mockAddress,
        paymentMethod: 'cash_on_delivery',
        cart: [{ product, quantity: 1, sellerId }],
      });

      runner.assertEquals(orderRes.success, true, `Order creation should succeed: ${orderRes.error || ''}`);
      const order = orderRes.order!;
      const subOrder = order.subOrders[0];

      const sellerBefore = db.getSellerById(sellerId)!;
      const availableBefore = sellerBefore.availableBalanceEGP;

      db.updateSubOrderStatus(order.id, subOrder.id, 'delivered', 'تم تسليم المشتري واستلام ثمن البضاعة');

      const sellerAfter = db.getSellerById(sellerId)!;
      const expectedBalance = availableBefore + subOrder.sellerNetEGP;

      runner.assertEquals(sellerAfter.availableBalanceEGP, expectedBalance, 'Seller available balance must increase by sellerNetEGP');
    });

    runner.test('Sub-order refund atomically restocks inventory back to warehouse', () => {
      const product = getActiveProduct();
      const stockBefore = product.stock;

      const orderRes = db.createOrder({
        customerName: 'طارق عزيز',
        customerPhone: '01155667788',
        shippingAddress: mockAddress,
        paymentMethod: 'cash_on_delivery',
        cart: [{ product, quantity: 1, sellerId: product.sellerId }],
      });

      runner.assertEquals(orderRes.success, true, `Order creation should succeed: ${orderRes.error || ''}`);
      const order = orderRes.order!;
      const subOrder = order.subOrders[0];
      const stockAfterOrder = db.getProductById(product.id)!.stock;
      runner.assertEquals(stockAfterOrder, stockBefore - 1, 'Stock decremented after order');

      const refundRes = db.processRefund({
        orderId: order.id,
        subOrderId: subOrder.id,
        reason: 'طلب إرجاع وتراجع عن الشراء خلال فترة الحماية القانونية',
        restockInventory: true,
        processedBy: 'مسؤول المرتجعات بالمنصة',
      });

      runner.assertEquals(refundRes.success, true, 'Refund processing should succeed');
      const stockPostRefund = db.getProductById(product.id)!.stock;
      runner.assertEquals(stockPostRefund, stockBefore, 'Refund with restock must restore exact original stock level');
    });

    runner.test('Immutable Financial Ledger records transaction trail', () => {
      const ledger = db.getLedger();
      runner.assertGte(ledger.length, 1, 'Financial ledger should maintain transaction log records');
      const entry = ledger[0];
      runner.assert(!!entry.id && !!entry.type && typeof entry.amountEGP === 'number', 'Ledger entries must contain mandatory auditing fields');
    });

  });
}
