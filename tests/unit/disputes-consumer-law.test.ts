import { TestRunner } from '../testFramework';
import { db } from '../../server/db';
import { EgyptianAddress } from '../../src/types';

export async function runDisputesConsumerLawTests(runner: TestRunner): Promise<void> {
  runner.describe('Egyptian Consumer Protection Law 181/2018 Arbitration & Disputes', () => {

    const mockAddress: EgyptianAddress = {
      id: 'addr-dispute-test',
      fullName: 'جمال عبد اللطيف',
      phone: '01011998877',
      governorate: 'كفر الشيخ',
      city: 'دسوق',
      district: 'حي الصفا',
      streetDetails: 'شارع المحطة',
      buildingNo: '12',
    };

    const getActiveProduct = () => {
      const active = db.getProducts().find(p => p.status === 'active' && p.stock >= 5);
      return active || db.getProducts()[0];
    };

    runner.test('Customer initializes formal dispute under Law 181/2018', () => {
      const product = getActiveProduct();
      const orderRes = db.createOrder({
        customerName: 'جمال عبد اللطيف',
        customerPhone: '01011998877',
        shippingAddress: mockAddress,
        paymentMethod: 'cash_on_delivery',
        cart: [{ product, quantity: 1, sellerId: product.sellerId }],
      });

      runner.assertEquals(orderRes.success, true, `Order creation should succeed: ${orderRes.error || ''}`);
      const order = orderRes.order!;
      const subOrder = order.subOrders[0];

      const dispute = db.createDispute({
        orderId: order.id,
        subOrderId: subOrder.id,
        reason: 'defective_product',
        description: 'وجود عيب مصنعي جوهري في المنتج المطرز ويحق للمستهلك استرداد القيمة الكاملة وفق المادة 21 من قانون 181 لسنة 2018',
        requestedResolution: 'refund',
      });

      runner.assert(!!dispute && !!dispute.id, 'Dispute should be initialized with unique ID');
      runner.assertEquals(dispute.status, 'open', 'New dispute status must be open');
      runner.assertEquals(dispute.reason, 'defective_product', 'Reason should be defective_product');
    });

    runner.test('Support/Admin executes binding arbitration in favor of consumer refund', () => {
      const product = getActiveProduct();
      const orderRes = db.createOrder({
        customerName: 'سميرة فؤاد',
        customerPhone: '01233221100',
        shippingAddress: mockAddress,
        paymentMethod: 'fawry',
        cart: [{ product, quantity: 1, sellerId: product.sellerId }],
      });

      runner.assertEquals(orderRes.success, true, `Order creation should succeed: ${orderRes.error || ''}`);
      const order = orderRes.order!;
      const subOrder = order.subOrders[0];

      const dispute = db.createDispute({
        orderId: order.id,
        subOrderId: subOrder.id,
        reason: 'not_as_described',
        description: 'المواصفات المستلمة تختلف عن العينة المعروضة بالمتجر',
        requestedResolution: 'refund',
      });

      const arbitrationResult = db.resolveDispute({
        disputeId: dispute.id,
        resolution: 'refund_approved',
        adminNotes: 'بناءً على فحص شكوى المستهلك ومطابقتها للمواصفات المعلنة، تقرر إلزام التاجر برد القيمة كاملة وفقاً للمادة 17 و 21 من قانون حماية المستهلك المصري رقم 181 لسنة 2018',
        resolvedBy: 'مستشار التحكيم القانوني بالمنصة',
      });

      runner.assertEquals(arbitrationResult.success, true, 'Dispute arbitration resolution should succeed');
      runner.assertEquals(arbitrationResult.dispute?.status, 'resolved', 'Dispute status must transition to resolved');
      runner.assertEquals(arbitrationResult.dispute?.resolution, 'refund_approved', 'Resolution must match refund_approved');

      // Verify sub-order was transitioned to refunded
      const updatedOrder = db.getOrderById(order.id)!;
      const updatedSub = updatedOrder.subOrders.find(s => s.id === subOrder.id)!;
      runner.assertEquals(updatedSub.status, 'refunded', 'Arbitrated sub-order status must become refunded');
    });

    runner.test('Retrieving all disputes for administrative dashboard review', () => {
      const allDisputes = db.getDisputes();
      runner.assertGte(allDisputes.length, 1, 'Disputes list should return recorded claims');
    });

  });
}
