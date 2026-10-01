import { TestRunner } from '../testFramework';
import { db } from '../../server/db';

export async function runCartCheckoutTests(runner: TestRunner): Promise<void> {
  runner.describe('Server-Side Cart & Authoritative Checkout Quotes', () => {
    const testUserId = 'test-cart-user-123';

    const getActiveProduct = () => {
      const active = db.getProducts().find(p => p.status === 'active' && p.stock >= 5);
      return active || db.getProducts()[0];
    };

    runner.test('Server cart initializes empty for new user session', () => {
      db.clearCart(testUserId);
      const cart = db.getCart(testUserId);
      runner.assertEquals(cart.length, 0, 'Cart should be empty initially');
    });

    runner.test('Adding items to server cart enforces authoritative catalog pricing', () => {
      const product = getActiveProduct();
      const addRes = db.addToCart(testUserId, product.id, undefined, 1);

      runner.assertEquals(addRes.success, true, `Add to cart should succeed: ${addRes.message || ''}`);
      runner.assertEquals(addRes.cart.length, 1, 'Cart should contain 1 item type');
      runner.assertEquals(addRes.cart[0].product.priceEGP, product.priceEGP, 'Cart item price must match database price');
      runner.assertEquals(addRes.cart[0].quantity, 1, 'Quantity should be 1');
    });

    runner.test('Updating item quantity in server cart', () => {
      const product = getActiveProduct();
      const updateRes = db.updateCartQuantity(testUserId, product.id, 2);

      runner.assertEquals(updateRes.success, true, 'Update cart quantity should succeed');
      runner.assertEquals(updateRes.cart[0].quantity, 2, 'Updated quantity should be 2');
    });

    runner.test('Removing item from server cart', () => {
      const product = getActiveProduct();
      const removeRes = db.removeFromCart(testUserId, product.id);

      runner.assertEquals(removeRes.success, true, 'Remove from cart should succeed');
      runner.assertEquals(removeRes.cart.length, 0, 'Cart should be empty after removal');
    });

    runner.test('Authoritative quote calculation computes subtotals, shipping, and coupon discounts', () => {
      const activeList = db.getProducts().filter(p => p.status === 'active' && p.stock >= 5);
      const prodA = activeList[0];
      const prodB = activeList.find(p => p.sellerId !== prodA.sellerId) || activeList[1];

      const cart = [
        { product: prodA, quantity: 1, sellerId: prodA.sellerId },
        { product: prodB, quantity: 1, sellerId: prodB.sellerId },
      ];

      const expectedSubtotal = prodA.priceEGP + prodB.priceEGP;

      const quote = db.calculateQuote({
        cart,
        destinationCity: 'دسوق',
        discountCode: 'AHLAN', // 50 EGP promo coupon
      });

      runner.assertEquals(quote.success, true, 'Quote calculation should succeed');
      runner.assertEquals(quote.totalSubtotalEGP, expectedSubtotal, 'Subtotal must match server calculation');
      runner.assertEquals(quote.discountEGP, 50, 'AHLAN promo discount must equal 50 EGP');
      runner.assertEquals(quote.totalAmountEGP, expectedSubtotal + quote.totalShippingEGP! - 50, 'Grand total equation must balance');
    });

    runner.test('Quote calculation rejects invalid coupon codes without crashing', () => {
      const product = getActiveProduct();
      const quote = db.calculateQuote({
        cart: [{ product, quantity: 1, sellerId: product.sellerId }],
        destinationCity: 'القاهرة',
        discountCode: 'INVALID_COUPON_CODE',
      });

      runner.assertEquals(quote.success, true, 'Quote should succeed without discount');
      runner.assertEquals(quote.discountEGP, 0, 'Invalid coupon must yield 0 discount');
    });

  });
}
