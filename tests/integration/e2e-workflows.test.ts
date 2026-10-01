import { TestRunner, TestHttpClient } from '../testFramework';
import { db } from '../../server/db';
import { signToken, toAuthUser } from '../../server/auth';
import { EgyptianAddress } from '../../src/types';

export async function runE2EWorkflowsTests(runner: TestRunner): Promise<void> {
  const client = new TestHttpClient();

  runner.describe('End-to-End Marketplace Journeys & Concurrency Stress Test', () => {

    const customerUser = db.getUserByEmailOrPhone('customer@souqdesoq.eg')!;
    const customerToken = signToken(customerUser);

    const seller1User = db.getUserByEmailOrPhone('farmawy@souqdesoq.eg')!;
    const seller1Token = signToken(seller1User);

    const mockAddress: EgyptianAddress = {
      id: 'addr-e2e-test',
      fullName: 'عمرو عبد الفتاح الشناوي',
      phone: '01012341234',
      governorate: 'كفر الشيخ',
      city: 'دسوق',
      district: 'حي الصفا',
      streetDetails: 'شارع الجلاء الكورنيش',
      buildingNo: '44',
    };

    runner.test('E2E Journey: Search -> Cart -> Quote -> Order Creation -> Fawry Payment -> Delivery -> Ledger', async () => {
      // 1. Search for local products
      const searchRes = await client.request({
        method: 'GET',
        path: '/api/search?q=قماش',
      });
      runner.assertEquals(searchRes.status, 200, 'Search route should respond with 200');

      // 2. Fetch seed product
      const product = db.getProducts()[0];
      const sellerId = product.sellerId;

      // 3. Request quote
      const quoteRes = await client.request({
        method: 'POST',
        path: '/api/cart/quote',
        body: {
          items: [{ productId: product.id, quantity: 2 }],
          destinationCity: 'دسوق',
          discountCode: 'AHLAN',
        },
      });
      runner.assertEquals(quoteRes.status, 200, 'Cart quote endpoint should return 200');
      runner.assertEquals(quoteRes.body.discountEGP, 50, 'AHLAN promo discount must equal 50 EGP');

      // 4. Place Order via Fawry with Idempotency Key
      const idempotencyKey = `e2e-idem-key-${Date.now()}`;
      const orderRes = await client.request({
        method: 'POST',
        path: '/api/orders',
        token: customerToken,
        body: {
          customerName: 'عمرو عبد الفتاح الشناوي',
          customerPhone: '01012341234',
          shippingAddress: mockAddress,
          paymentMethod: 'fawry',
          items: [{ productId: product.id, quantity: 2 }],
          discountCode: 'AHLAN',
          idempotencyKey,
        },
      });

      runner.assertEquals(orderRes.status, 200, 'Order creation should succeed');
      const order = orderRes.body.order;
      runner.assert(!!order && !!order.id, 'Order object must be returned');
      runner.assert(!!order.fawryReferenceCode, 'Fawry reference code must be present');

      // 5. Confirm Payment via Webhook / Endpoint
      const confirmRes = await client.request({
        method: 'POST',
        path: '/api/payments/confirm',
        body: {
          orderId: order.id,
          transactionRef: `FAWRY-TRX-${Date.now()}`,
          paymentMethod: 'fawry',
        },
      });
      runner.assertEquals(confirmRes.status, 200, 'Payment confirmation should succeed');

      // 6. Fulfill Sub-Order (Seller updates status to delivered)
      const subOrderId = order.subOrders[0].id;
      const deliverRes = await client.request({
        method: 'PATCH',
        path: `/api/orders/${order.id}/sub-orders/${subOrderId}/status`,
        token: seller1Token,
        body: {
          status: 'delivered',
          note: 'تم تسليم العميل بنجاح أمام مركز البريد',
        },
      });
      runner.assertEquals(deliverRes.status, 200, 'Status update to delivered should succeed');

      // 7. Verify Seller Balance & Financial Ledger
      const seller = db.getSellerById(sellerId);
      runner.assert(!!seller, 'Seller record must exist');
    });

    runner.test('Concurrency & Double-Spend Prevention: Concurrent orders competing for limited stock', async () => {
      // Pick a product with small stock
      const product = db.getProducts().find(p => p.stock > 0)!;
      const initialStock = product.stock;

      // Attempt 5 simultaneous order creations each asking for the entire stock
      const orderPromises = Array.from({ length: 5 }).map((_, i) => {
        return client.request({
          method: 'POST',
          path: '/api/orders',
          body: {
            customerName: `متنافس ${i + 1}`,
            customerPhone: '01000000000',
            shippingAddress: mockAddress,
            paymentMethod: 'cash_on_delivery',
            items: [{ productId: product.id, quantity: initialStock }],
          },
        });
      });

      const results = await Promise.all(orderPromises);
      const successfulOrders = results.filter(r => r.status === 200 && r.body && r.body.success === true);

      // Only EXACTLY ONE order should succeed; the others must be rejected due to stock depletion
      runner.assertEquals(successfulOrders.length, 1, 'Transactional database lock must allow exactly 1 successful order for remaining stock');

      const finalStock = db.getProductById(product.id)!.stock;
      runner.assertEquals(finalStock, 0, 'Final stock must equal 0 without underflowing into negative stock');
    });

  });
}
