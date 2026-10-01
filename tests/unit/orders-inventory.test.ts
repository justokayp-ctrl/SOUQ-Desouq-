import { TestRunner } from '../testFramework';
import { db } from '../../server/db';
import { EgyptianAddress, CartItem } from '../../src/types';

export async function runOrdersInventoryTests(runner: TestRunner): Promise<void> {
  runner.describe('Orders Engine & Transactional Inventory Locking', () => {

    const mockAddress: EgyptianAddress = {
      id: 'addr-unit-test',
      fullName: 'علي حسن البنا',
      phone: '01012345678',
      governorate: 'كفر الشيخ',
      city: 'دسوق',
      district: 'حي الصفا',
      streetDetails: 'شارع سعد زغلول',
      buildingNo: '8',
    };

    const getActiveProducts = () => {
      const active = db.getProducts().filter(p => p.status === 'active' && p.stock >= 5);
      return active.length > 0 ? active : db.getProducts();
    };

    runner.test('Transactional inventory blocks overselling beyond available stock', () => {
      const product = getActiveProducts()[0];
      const stock = product.stock;

      const excessiveCart: CartItem[] = [
        {
          product,
          quantity: stock + 9999,
          sellerId: product.sellerId,
        }
      ];

      const oversellRes = db.createOrder({
        customerName: 'مشتري المتجاوز',
        customerPhone: '01012345678',
        shippingAddress: mockAddress,
        paymentMethod: 'cash_on_delivery',
        cart: excessiveCart,
      });

      runner.assertEquals(oversellRes.success, false, 'Order creation must fail when stock is insufficient');
      runner.assert(oversellRes.error?.includes('عفواً') || oversellRes.error?.includes('تكفي'), 'Error message should indicate insufficient stock');
    });

    runner.test('Multi-vendor order creation splits cart into distinct merchant sub-orders', () => {
      const products = getActiveProducts();
      const prodA = products[0];
      const prodB = products.find(p => p.sellerId !== prodA.sellerId && p.stock >= 1) || products[1];

      const validCart: CartItem[] = [
        { product: prodA, quantity: 1, sellerId: prodA.sellerId },
        { product: prodB, quantity: 1, sellerId: prodB.sellerId },
      ];

      const orderRes = db.createOrder({
        customerName: 'سارة عبد الله',
        customerPhone: '01122334455',
        shippingAddress: mockAddress,
        paymentMethod: 'fawry',
        cart: validCart,
      });

      runner.assertEquals(orderRes.success, true, `Multi-vendor order should be created: ${orderRes.error || ''}`);
      const order = orderRes.order!;
      runner.assertEquals(order.subOrders.length, 2, 'Order must be split into exactly 2 merchant sub-orders');
      runner.assert(!!order.fawryReferenceCode, 'Fawry payment reference code must be generated');
      runner.assertEquals(order.paymentStatus, 'pending_fawry', 'Initial payment status should be pending_fawry');
    });

    runner.test('Sub-order status progression and tracking assignment', () => {
      const product = getActiveProducts()[0];
      const orderRes = db.createOrder({
        customerName: 'محمود السيد',
        customerPhone: '01099887766',
        shippingAddress: mockAddress,
        paymentMethod: 'cash_on_delivery',
        cart: [{ product, quantity: 1, sellerId: product.sellerId }],
      });

      runner.assertEquals(orderRes.success, true, `Order must be created: ${orderRes.error || ''}`);
      const order = orderRes.order!;
      const subOrder = order.subOrders[0];

      // Update sub-order to shipped
      const updatedShipped = db.updateSubOrderStatus(order.id, subOrder.id, 'shipped', 'تم تسليم الشحنة لمندوب البريد المصري بمركز دسوق');
      runner.assert(!!updatedShipped, 'Status update to shipped should succeed');

      const reloadedOrder = db.getOrderById(order.id)!;
      const reloadedSub = reloadedOrder.subOrders.find(s => s.id === subOrder.id)!;
      runner.assertEquals(reloadedSub.status, 'shipped', 'Sub-order status must be shipped');
      runner.assert(!!reloadedSub.trackingNumber, 'Tracking number must be present');
    });

  });
}
