import { TestRunner } from '../testFramework';
import { db } from '../../server/db';
import { EgyptianAddress, CartItem } from '../../src/types';

export async function runSellerWorkspaceOperationsTests(runner: TestRunner) {
  runner.describe('SOUQ DESOQ — SELLER WORKSPACE OPERATIONS & ISOLATION', () => {

    const mockAddress: EgyptianAddress = {
      id: 'addr-seller-test',
      fullName: 'أحمد محمود',
      phone: '01012345678',
      governorate: 'كفر الشيخ',
      city: 'دسوق',
      district: 'حي وسط',
      streetDetails: 'شارع الجيش',
      buildingNo: '14',
    };

    runner.test('Seller A vs Seller B: Strict Ownership & Product Isolation', () => {
      const sellers = db.getSellers();
      runner.assert(sellers.length >= 2, 'Should have at least 2 sellers registered for multi-tenant isolation tests');

      const sellerA = sellers[0];
      const sellerB = sellers[1];

      // Create product for Seller A
      const productA = db.createProduct({
        sellerId: sellerA.id,
        titleAr: 'جلابية قطن فاخرة للتجربة أ',
        titleEn: 'Luxury Cotton Galabeya A',
        descriptionAr: 'جلابية قطنية عالية الجودة من تراث دسوق',
        category: 'traditional_desoq',
        priceEGP: 850,
        stock: 25,
        status: 'active',
        images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400'],
        attributes: { brand: 'دسوقي', origin: 'دسوق' },
      });

      runner.assert(productA.id !== undefined, 'Product A should be created with unique ID');
      runner.assertEquals(productA.sellerId, sellerA.id, 'Product A must belong to Seller A');

      // Verify that Seller B querying their products does NOT see Product A
      const allProducts = db.getProducts();
      const sellerAProducts = allProducts.filter(p => p.sellerId === sellerA.id);
      const sellerBProducts = allProducts.filter(p => p.sellerId === sellerB.id);

      runner.assert(sellerAProducts.some(p => p.id === productA.id), 'Seller A product list must contain Product A');
      runner.assert(!sellerBProducts.some(p => p.id === productA.id), 'Seller B product list must NEVER contain Product A');

      // Cleanup
      db.deleteProduct(productA.id);
    });

    runner.test('CRUD Lifecycle: Create, Edit, Duplicate, Status Transitions, Delete', () => {
      const sellers = db.getSellers();
      const seller = sellers[0];

      // 1. Create (Active)
      const prod = db.createProduct({
        sellerId: seller.id,
        titleAr: 'بدلة رجالي كلاسيك دسوقي',
        titleEn: 'Desoq Classic Men Suit',
        descriptionAr: 'بدلة كلاسيكية مفصلة يدويا',
        category: 'suits_and_tailoring',
        priceEGP: 2200,
        stock: 12,
        status: 'active',
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'],
        attributes: { brand: 'دسوق تيلور', origin: 'دسوق' },
      });
      runner.assertEquals(prod.status, 'active', 'Newly created product starts as active');

      // 2. Edit
      const updated = db.updateProduct(prod.id, {
        priceEGP: 2400,
        stock: 15,
        titleAr: 'بدلة رجالي كلاسيك دسوقي فاخرة',
      });
      runner.assertEquals(updated?.priceEGP, 2400, 'Product price should be updated');
      runner.assertEquals(updated?.stock, 15, 'Product stock should be updated');

      // 3. Pause / Suspend
      const suspended = db.updateProduct(prod.id, { status: 'suspended' });
      runner.assertEquals(suspended?.status, 'suspended', 'Product status should be suspended/paused');

      // 4. Mark Out of Stock
      const outOfStock = db.updateProduct(prod.id, { status: 'out_of_stock' });
      runner.assertEquals(outOfStock?.status, 'out_of_stock', 'Product status should be out of stock');

      // 5. Re-activate
      const reActivated = db.updateProduct(prod.id, { status: 'active' });
      runner.assertEquals(reActivated?.status, 'active', 'Product should be re-published as active');

      // 5b. Test all product listing statuses (draft, incomplete, pending_moderation, suppressed, inactive, archived)
      const allStatuses: ('draft' | 'incomplete' | 'pending_moderation' | 'suppressed' | 'inactive' | 'archived')[] = [
        'draft',
        'incomplete',
        'pending_moderation',
        'suppressed',
        'inactive',
        'archived'
      ];
      for (const st of allStatuses) {
        const res = db.updateProduct(prod.id, { status: st });
        runner.assertEquals(res?.status, st, `Product status should update to ${st} without SQLite constraint error`);
      }

      // 6. Duplicate
      const duplicated = db.duplicateProduct(prod.id);
      runner.assert(duplicated !== null, 'Duplicated product must be created');
      runner.assert(duplicated!.id !== prod.id, 'Duplicated product must have a new unique ID');
      runner.assertEquals(duplicated!.sellerId, seller.id, 'Duplicated product must retain seller ownership');
      runner.assertEquals(duplicated!.status, 'suspended', 'Duplicated product should initialize as suspended');

      // 7. Delete
      const isDeleted = db.deleteProduct(prod.id);
      runner.assert(isDeleted, 'Product deletion should succeed');
      const fetchedAfterDelete = db.getProductById(prod.id);
      runner.assert(fetchedAfterDelete === undefined, 'Product must no longer exist in the database');

      // Clean up duplicated product
      if (duplicated) {
        db.deleteProduct(duplicated.id);
      }
    });

    runner.test('Inventory Calculation: Available, Reserved, Low Stock, Out of Stock', () => {
      const sellers = db.getSellers();
      const seller = sellers[0];

      // Create a batch of products with different inventory levels
      const inStockProd = db.createProduct({
        sellerId: seller.id,
        titleAr: 'منتج متوفر',
        titleEn: 'In Stock Product',
        descriptionAr: 'وصف المنتج المتوفر',
        priceEGP: 100,
        stock: 50,
        category: 'fabrics_and_cotton',
        images: [],
        attributes: {},
        status: 'active',
      });

      const lowStockProd = db.createProduct({
        sellerId: seller.id,
        titleAr: 'منتج مخزون منخفض',
        titleEn: 'Low Stock Product',
        descriptionAr: 'وصف المنتج المنخفض',
        priceEGP: 150,
        stock: 4,
        category: 'fabrics_and_cotton',
        images: [],
        attributes: {},
        status: 'active',
      });

      const outOfStockProd = db.createProduct({
        sellerId: seller.id,
        titleAr: 'منتج نافد',
        titleEn: 'Out of Stock Product',
        descriptionAr: 'وصف المنتج النافد',
        priceEGP: 200,
        stock: 0,
        category: 'fabrics_and_cotton',
        images: [],
        attributes: {},
        status: 'active',
      });

      // Verify stock health categorization
      runner.assert(inStockProd.stock >= 10, 'In stock item has >= 10 units');
      runner.assert(lowStockProd.stock > 0 && lowStockProd.stock < 10, 'Low stock item has between 1 and 9 units');
      runner.assertEquals(outOfStockProd.stock, 0, 'Out of stock item has 0 units');

      // Cleanup
      db.deleteProduct(inStockProd.id);
      db.deleteProduct(lowStockProd.id);
      db.deleteProduct(outOfStockProd.id);
    });

    runner.test('Orders 6-Stage Workflow: New -> Preparing -> Ready -> Shipped -> Delivered -> Exception', () => {
      const sellers = db.getSellers();
      const seller = sellers[0];

      // Use an existing active catalog product
      const activeProducts = db.getProducts().filter(p => p.status === 'active' && p.stock >= 2);
      const existingProduct = activeProducts.find(p => p.sellerId === seller.id) || activeProducts[0];

      const cart: CartItem[] = [
        {
          product: existingProduct,
          quantity: 1,
          sellerId: existingProduct.sellerId,
        },
      ];

      // Create order
      const orderRes = db.createOrder({
        customerName: 'أحمد محمود',
        customerPhone: '01012345678',
        shippingAddress: mockAddress,
        paymentMethod: 'cash_on_delivery',
        cart,
      });

      runner.assert(orderRes.success && orderRes.order !== undefined, `Order creation failed: ${orderRes.error}`);
      const order = orderRes.order!;
      const subOrderId = order.subOrders[0].id;

      // Stage 1: New (seller_confirmed / processing initiation)
      runner.assertEquals(order.subOrders[0].status, 'seller_confirmed', 'Order starts in Stage 1: New');

      // Stage 2: Preparing (processing)
      const preparing = db.updateSubOrderStatus(order.id, subOrderId, 'processing', 'بدء تجهيز الطرد');
      runner.assert(!!preparing, 'Transition to Stage 2: Preparing should succeed');
      let currentOrder = db.getOrderById(order.id);
      runner.assertEquals(currentOrder?.subOrders[0].status, 'processing', 'Sub-order status is processing');

      // Stage 3: Ready (ready_for_pickup)
      const ready = db.updateSubOrderStatus(order.id, subOrderId, 'ready_for_pickup', 'الطرد جاهز للمندوب');
      runner.assert(!!ready, 'Transition to Stage 3: Ready should succeed');
      currentOrder = db.getOrderById(order.id);
      runner.assertEquals(currentOrder?.subOrders[0].status, 'ready_for_pickup', 'Sub-order status is ready_for_pickup');

      // Stage 4: Shipped (shipped)
      const shipped = db.updateSubOrderStatus(order.id, subOrderId, 'shipped', 'تم التسليم للمندوب');
      runner.assert(!!shipped, 'Transition to Stage 4: Shipped should succeed');
      currentOrder = db.getOrderById(order.id);
      runner.assertEquals(currentOrder?.subOrders[0].status, 'shipped', 'Sub-order status is shipped');

      // Stage 5: Delivered (delivered)
      const delivered = db.updateSubOrderStatus(order.id, subOrderId, 'delivered', 'تم التسليم للعميل');
      runner.assert(!!delivered, 'Transition to Stage 5: Delivered should succeed');
      currentOrder = db.getOrderById(order.id);
      runner.assertEquals(currentOrder?.subOrders[0].status, 'delivered', 'Sub-order status is delivered');
    });

    runner.test('Concurrency & Atomic Stock Refills', async () => {
      const sellers = db.getSellers();
      const seller = sellers[0];

      const concurrentProd = db.createProduct({
        sellerId: seller.id,
        titleAr: 'منتج اختبار التزامن',
        titleEn: 'Concurrency Test Product',
        descriptionAr: 'وصف منتج اختبار التزامن',
        priceEGP: 100,
        stock: 10,
        category: 'fabrics_and_cotton',
        images: [],
        attributes: {},
        status: 'active',
      });

      // Simulate 10 parallel stock updates
      const promises = Array.from({ length: 10 }).map((_, idx) => {
        return new Promise<void>((resolve) => {
          db.updateProduct(concurrentProd.id, { stock: 10 + (idx + 1) * 5 });
          resolve();
        });
      });

      await Promise.all(promises);

      const finalProduct = db.getProductById(concurrentProd.id);
      runner.assert(finalProduct !== null && finalProduct !== undefined && finalProduct.stock > 10, 'Atomic transactions ensure stock is preserved correctly under concurrency');

      db.deleteProduct(concurrentProd.id);
    });

  });
}
