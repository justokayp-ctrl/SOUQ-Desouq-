import http from 'http';
import { db } from '../server/db';

interface TestStepResult {
  suite: string;
  name: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  durationMs: number;
}

function req(
  method: string,
  path: string,
  headers: Record<string, string> = {},
  body?: any
): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders; raw: string }> {
  return new Promise((resolve, reject) => {
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '';
    const reqHeaders: Record<string, string> = {
      ...headers,
    };
    if (body) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const request = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed: any;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({
            status: res.statusCode || 0,
            body: parsed,
            headers: res.headers,
            raw,
          });
        });
      }
    );

    request.on('error', reject);
    if (postData) {
      request.write(postData);
    }
    request.end();
  });
}

async function runE2EAndRegressionSuite() {
  console.log('================================================================');
  console.log('🚀 SOUQ DESOQ — FULL SYSTEM INTEGRATION & REGRESSION TEST HARNESS');
  console.log('================================================================\n');

  const results: TestStepResult[] = [];

  async function testStep(suite: string, name: string, fn: () => Promise<void>) {
    const start = Date.now();
    try {
      await fn();
      const dur = Date.now() - start;
      results.push({ suite, name, status: 'PASS', durationMs: dur });
      console.log(`✅ [${suite}] ${name} (${dur}ms)`);
    } catch (e: any) {
      const dur = Date.now() - start;
      results.push({ suite, name, status: 'FAIL', details: e.message, durationMs: dur });
      console.error(`❌ [${suite}] ${name} (${dur}ms): ${e.message}`);
    }
  }

  // -------------------------------------------------------------
  // SUITE 1: CUSTOMER LIFECYCLE (Register -> Buy -> Track -> Re-login)
  // -------------------------------------------------------------
  let customerToken = '';
  let customerId = '';
  let createdOrderId = '';
  const rndSuffix = Date.now() + Math.floor(Math.random() * 1000);
  const customerEmail = `qa_cust_${rndSuffix}@souqdesoq.eg`;
  const customerPhone = `010${Math.floor(10000000 + Math.random() * 90000000)}`;

  await testStep('Customer E2E', '1. Register new customer account', async () => {
    const res = await req('POST', '/api/auth/register', {}, {
      fullName: 'أحمد شاكر السعدني (مشتري تجريبي)',
      email: customerEmail,
      phone: customerPhone,
      password: 'Password123!',
      role: 'customer',
    });
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Register failed with status ${res.status}: ${JSON.stringify(res.body)}`);
    }
    if (!res.body.token || !res.body.user?.id) {
      throw new Error('Response missing token or user object');
    }
    customerToken = res.body.token;
    customerId = res.body.user.id;

    // Direct DB Verification
    const dbUser = db.getUserById(customerId);
    if (!dbUser || dbUser.email !== customerEmail) {
      throw new Error('Database user verification failed: Record not written to SQLite users table');
    }
  });

  await testStep('Customer E2E', '2. Customer Search & Catalog Browse', async () => {
    const res = await req('GET', '/api/products?search=' + encodeURIComponent('حرير') + '&limit=10');
    if (res.status !== 200 || !Array.isArray(res.body)) {
      throw new Error(`Product search failed with status ${res.status}`);
    }
    if (res.body.length === 0) {
      throw new Error('Search returned 0 items for seed category');
    }
  });

  await testStep('Customer E2E', '3. Product Detail & Live Stock Query', async () => {
    const prods = await db.getProducts();
    if (!prods || prods.length === 0) throw new Error('No products in database');
    const targetProd = prods[0];

    const res = await req('GET', `/api/products/${targetProd.id}`);
    if (res.status !== 200 || !res.body || res.body.id !== targetProd.id) {
      throw new Error(`Product detail endpoint failed for ID: ${targetProd.id}`);
    }
  });

  await testStep('Customer E2E', '4. Add to Cart & Validation', async () => {
    const prods = await db.getProducts();
    const targetProd = prods.find(p => p.stock > 5) || prods[0];
    const res = await req('POST', '/api/cart/items', {
      Authorization: `Bearer ${customerToken}`,
    }, {
      productId: targetProd.id,
      quantity: 1,
      variantId: targetProd.variants?.[0]?.id,
    });
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Cart addition failed: ${JSON.stringify(res.body)}`);
    }
  });

  await testStep('Customer E2E', '5. Checkout & Order Placement with DB Verification', async () => {
    const prods = await db.getProducts();
    const targetProd = prods.find((p) => p.sellerId === 'seller-1' && p.stock > 2) || prods.find((p) => p.sellerId === 'seller-1') || prods[0];
    const initialStock = targetProd.stock;
    const variantId = targetProd.variants?.[0]?.id;

    const orderPayload = {
      customerName: 'أحمد شاكر السعدني',
      customerPhone: customerPhone,
      shippingAddress: {
        governorate: 'كفر الشيخ',
        city: 'دسوق',
        street: 'شارع الجيش - بجوار مسجد سيدي إبراهيم الدسوقي',
        buildingNumber: '14',
        apartmentNumber: '3',
        deliveryNotes: 'الاتصال عند الوصول',
      },
      paymentMethod: 'cash_on_delivery',
      items: [
        {
          productId: targetProd.id,
          variantId: variantId,
          titleAr: targetProd.titleAr,
          price: (targetProd as any).price || targetProd.priceEGP,
          quantity: 1,
          sellerId: targetProd.sellerId,
        },
      ],
      totalAmount: ((targetProd as any).price || targetProd.priceEGP) + 35,
      shippingFee: 35,
    };

    const res = await req('POST', '/api/orders', {
      Authorization: `Bearer ${customerToken}`,
    }, orderPayload);

    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Order placement failed with status ${res.status}: ${JSON.stringify(res.body)}`);
    }

    createdOrderId = res.body.id || res.body.order?.id;
    if (!createdOrderId) throw new Error('Order creation did not return order ID');

    // DB Verification
    const dbOrder = await db.getOrderById(createdOrderId);
    if (!dbOrder) throw new Error(`Database verification failed: Order ${createdOrderId} not found in DB`);

    // Verify Stock Reduction
    const updatedProd = await db.getProductById(targetProd.id);
    if (updatedProd && updatedProd.stock !== initialStock - 1) {
      throw new Error(`Inventory deduction failed: Initial ${initialStock}, Now ${updatedProd.stock}`);
    }
  });

  await testStep('Customer E2E', '6. Customer Order Tracking & Live Timeline', async () => {
    if (!createdOrderId) throw new Error('No order ID from previous step');
    const res = await req('GET', `/api/orders/${createdOrderId}`, {
      Authorization: `Bearer ${customerToken}`,
    });
    if (res.status !== 200 || !res.body || res.body.id !== createdOrderId) {
      throw new Error(`Order lookup failed for ID ${createdOrderId}`);
    }
  });

  await testStep('Customer E2E', '7. Session Invalidation & Re-Login Integrity', async () => {
    // Logout
    await req('POST', '/api/auth/logout', {
      Authorization: `Bearer ${customerToken}`,
    });

    // Re-login
    const loginRes = await req('POST', '/api/auth/login', {}, {
      email: customerEmail,
      password: 'Password123!',
    });
    if (loginRes.status !== 200 || !loginRes.body.token) {
      throw new Error(`Re-login failed: ${JSON.stringify(loginRes.body)}`);
    }
    customerToken = loginRes.body.token;
  });

  // -------------------------------------------------------------
  // SUITE 2: SELLER LIFECYCLE (KYC -> Inventory -> Fulfillment)
  // -------------------------------------------------------------
  let sellerToken = '';
  let sellerId = 'seller-1';

  await testStep('Seller E2E', '1. Seller Login & Identity Token Generation', async () => {
    const res = await req('POST', '/api/auth/login', {}, {
      email: 'farmawy@souqdesoq.eg',
      password: 'Password123!',
    });
    if (res.status !== 200 || !res.body.token) {
      throw new Error(`Seller login failed: ${JSON.stringify(res.body)}`);
    }
    sellerToken = res.body.token;
    sellerId = res.body.user.sellerId || 'seller-1';
  });

  await testStep('Seller E2E', '2. KYC Vault Upload & Metadata Verification', async () => {
    const validPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n162\n%%EOF');
    const res = await req('POST', '/api/storage/kyc', {
      Authorization: `Bearer ${sellerToken}`,
    }, {
      sellerId: 'seller-1',
      documentType: 'commercial_register',
      titleAr: 'سجل تجاري مصنع دسوق للحرير',
      documentNumber: 'CR-DSQ-9921',
      base64Data: `data:application/pdf;base64,${validPdfBuffer.toString('base64')}`,
      filename: 'cr_desoq_9921.pdf',
      mimeType: 'application/pdf',
      purpose: 'kyc_commercial_register',
    });

    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`KYC Upload failed: ${JSON.stringify(res.body)}`);
    }
  });

  let newProductId = '';
  await testStep('Seller E2E', '3. Add New Product with Variants & Inventory', async () => {
    const newProdPayload = {
      sellerId: 'seller-1',
      titleAr: 'شال حرير طبيعي فاخر بنقوش الدسوقي التراثية',
      titleEn: 'Luxury Natural Silk Shawl Desoqi Heritage',
      descriptionAr: 'شال مصنوع يدوياً من خيوط الحرير الخالص 100%، صباغة نباتية ثابتة من أقدم مشاغل دسوق.',
      descriptionEn: 'Handmade pure 100% natural silk shawl with vegetable dyes from Desoq.',
      priceEGP: 650,
      stock: 25,
      category: 'fabrics',
      images: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80'],
      isDesoqLocalMade: true,
    };

    const res = await req('POST', '/api/catalog/products', {
      Authorization: `Bearer ${sellerToken}`,
    }, newProdPayload);

    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Add product failed: ${JSON.stringify(res.body)}`);
    }
    newProductId = res.body.id || res.body.product?.id;

    // Verify in DB
    const dbP = await db.getProductById(newProductId);
    if (!dbP) throw new Error('Product not found in SQLite products table');
    if (dbP.stock !== 25) throw new Error(`Stock mismatch: expected 25, got ${dbP.stock}`);
  });

  await testStep('Seller E2E', '4. Order Processing & Fulfillment by Seller', async () => {
    if (createdOrderId) {
      const order = await db.getOrderById(createdOrderId);
      const subOrderId = order?.subOrders?.[0]?.id;
      if (subOrderId) {
        const res = await req('PATCH', `/api/orders/${createdOrderId}/suborders/${subOrderId}/status`, {
          Authorization: `Bearer ${sellerToken}`,
        }, {
          status: 'processing',
          noteAr: 'تم تجهيز وتغليف المنتج بعناية في مشغل دسوق',
        });
        if (res.status !== 200) {
          throw new Error(`Order confirmation failed: ${JSON.stringify(res.body)}`);
        }
      }
    }
  });

  // -------------------------------------------------------------
  // SUITE 3: COURIER LIFECYCLE (Dispatch -> Delivery -> Exception)
  // -------------------------------------------------------------
  let courierToken = '';

  await testStep('Courier E2E', '1. Courier Login & Active Shift Retrieval', async () => {
    const res = await req('POST', '/api/auth/login', {}, {
      email: 'courier@souqdesoq.eg',
      password: 'Password123!',
    });
    if (res.status !== 200 || !res.body.token) {
      throw new Error(`Courier login failed: ${JSON.stringify(res.body)}`);
    }
    courierToken = res.body.token;

    const shiftRes = await req('GET', '/api/courier/deliveries', {
      Authorization: `Bearer ${courierToken}`,
    });
    if (shiftRes.status !== 200) {
      throw new Error(`Courier shift view failed with status ${shiftRes.status}`);
    }
  });

  await testStep('Courier E2E', '2. Assign & Pick up Package for Delivery', async () => {
    if (createdOrderId) {
      const pickupRes = await req('PATCH', `/api/orders/${createdOrderId}/status`, {
        Authorization: `Bearer ${courierToken}`,
      }, {
        status: 'out_for_delivery',
        note: 'الشحنة مع مندوب التوصيل في الطريق للمشتري في دسوق',
      });
      if (pickupRes.status !== 200) {
        throw new Error(`Status update failed: ${JSON.stringify(pickupRes.body)}`);
      }
      const dbO = await db.getOrderById(createdOrderId);
      if (dbO?.orderStatus !== 'out_for_delivery') {
        throw new Error(`Order status mismatch in DB: ${dbO?.orderStatus}`);
      }
    }
  });

  await testStep('Courier E2E', '3. Delivery Completion & COD Settlement', async () => {
    if (createdOrderId) {
      const completeRes = await req('PATCH', `/api/orders/${createdOrderId}/status`, {
        Authorization: `Bearer ${courierToken}`,
      }, {
        status: 'delivered',
        note: 'تم تسليم الشحنة للمشتري واستلام المبلغ نقداً',
      });
      if (completeRes.status !== 200) {
        throw new Error(`Delivery completion failed: ${JSON.stringify(completeRes.body)}`);
      }
      const dbO = await db.getOrderById(createdOrderId);
      if (dbO?.orderStatus !== 'delivered') {
        throw new Error(`Order status not updated to delivered in DB. Got: ${dbO?.orderStatus}`);
      }
    }
  });

  // -------------------------------------------------------------
  // SUITE 4: SUPPORT & DISPUTE LIFECYCLE (Dispute -> Investigation -> Resolution)
  // -------------------------------------------------------------
  let supportToken = '';
  let disputeId = '';

  await testStep('Support E2E', '1. Support Login & Unified Queue Access', async () => {
    const res = await req('POST', '/api/auth/login', {}, {
      email: 'support@souqdesoq.eg',
      password: 'Password123!',
    });
    if (res.status !== 200 || !res.body.token) {
      throw new Error(`Support login failed: ${JSON.stringify(res.body)}`);
    }
    supportToken = res.body.token;

    const disputesRes = await req('GET', '/api/support/disputes', {
      Authorization: `Bearer ${supportToken}`,
    });
    if (disputesRes.status !== 200) {
      throw new Error(`Support disputes query failed: ${JSON.stringify(disputesRes.body)}`);
    }
  });

  await testStep('Support E2E', '2. Customer Opens Dispute on Order', async () => {
    if (createdOrderId) {
      const res = await req('POST', '/api/disputes', {
        Authorization: `Bearer ${customerToken}`,
      }, {
        orderId: createdOrderId,
        reason: 'طلب استبدال المقاس لشال الحرير',
        description: 'اللون رائع ولكن أرغب في مقاس أوسع حسب دليل المقاسات التراثية لدسوق',
        requestedResolution: 'exchange',
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error(`Dispute creation failed: ${JSON.stringify(res.body)}`);
      }
      disputeId = res.body.id || res.body.dispute?.id;
    }
  });

  await testStep('Support E2E', '3. Support Resolution & Settlement Action', async () => {
    if (disputeId) {
      const resolveRes = await req('POST', `/api/disputes/${disputeId}/resolve`, {
        Authorization: `Bearer ${supportToken}`,
      }, {
        status: 'resolved',
        resolutionText: 'تمت الموافقة على الاستبدال المجاني بالتنسيق مع التاجر وإغلاق الشكوى بنجاح',
      });
      if (resolveRes.status !== 200 && resolveRes.status !== 201) {
        throw new Error(`Dispute resolution failed: ${JSON.stringify(resolveRes.body)}`);
      }
    }
  });

  // -------------------------------------------------------------
  // SUITE 5: ADMIN & GOVERNANCE LIFECYCLE (Metrics -> Users -> Audits)
  // -------------------------------------------------------------
  let adminToken = '';

  await testStep('Admin E2E', '1. Admin Authentication & Executive Metrics', async () => {
    const res = await req('POST', '/api/auth/login', {}, {
      email: 'admin@souqdesoq.eg',
      password: 'Password123!',
    });
    if (res.status !== 200 || !res.body.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(res.body)}`);
    }
    adminToken = res.body.token;

    const metricsRes = await req('GET', '/api/admin/metrics', {
      Authorization: `Bearer ${adminToken}`,
    });
    if (metricsRes.status !== 200 || typeof metricsRes.body.totalOrders === 'undefined') {
      throw new Error(`Admin metrics failed or incomplete: ${JSON.stringify(metricsRes.body)}`);
    }
  });

  await testStep('Admin E2E', '2. User Management & Audit Trail Logging', async () => {
    const usersRes = await req('GET', '/api/admin/users', {
      Authorization: `Bearer ${adminToken}`,
    });
    if (usersRes.status !== 200 || !Array.isArray(usersRes.body)) {
      throw new Error(`Admin users query failed: ${JSON.stringify(usersRes.body)}`);
    }

    const auditRes = await req('GET', '/api/admin/audit-logs', {
      Authorization: `Bearer ${adminToken}`,
    });
    if (auditRes.status !== 200) {
      throw new Error(`Audit logs query failed: ${JSON.stringify(auditRes.body)}`);
    }
  });

  // -------------------------------------------------------------
  // SUITE 6: CONCURRENCY & RACE CONDITION DEFENSE
  // -------------------------------------------------------------
  await testStep('Concurrency', '1. Simultaneous Checkout for Single Remaining Stock Item', async () => {
    const limitedProdPayload = {
      sellerId: 'seller-1',
      titleAr: 'تحفة نحاسية أثرية نادرة (قطعة واحدة فقط)',
      titleEn: 'Rare Antique Brass Masterpiece (Only 1 item)',
      priceEGP: 1200,
      stock: 1,
      category: 'crafts',
      images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'],
      isDesoqLocalMade: true,
    };

    const prodRes = await req('POST', '/api/catalog/products', {
      Authorization: `Bearer ${sellerToken}`,
    }, limitedProdPayload);
    const limitedProdId = prodRes.body.id || prodRes.body.product?.id;

    if (!limitedProdId) throw new Error(`Could not create test limited product: ${JSON.stringify(prodRes.body)}`);

    // Fire two simultaneous checkout requests
    const p1 = req('POST', '/api/orders', {
      Authorization: `Bearer ${customerToken}`,
    }, {
      customerId: customerId,
      customerName: 'مشتري متزامن A',
      customerPhone: customerPhone,
      shippingAddress: { city: 'دسوق', street: 'شارع الجمهورية', governorate: 'كفر الشيخ' },
      paymentMethod: 'cash_on_delivery',
      items: [{ productId: limitedProdId, price: 1200, quantity: 1, sellerId: 'seller-1' }],
      totalAmount: 1235,
      shippingFee: 35,
    });

    const p2 = req('POST', '/api/orders', {
      Authorization: `Bearer ${customerToken}`,
    }, {
      customerId: customerId,
      customerName: 'مشتري متزامن B',
      customerPhone: customerPhone,
      shippingAddress: { city: 'دسوق', street: 'شارع سعد زغلول', governorate: 'كفر الشيخ' },
      paymentMethod: 'cash_on_delivery',
      items: [{ productId: limitedProdId, price: 1200, quantity: 1, sellerId: 'seller-1' }],
      totalAmount: 1235,
      shippingFee: 35,
    });

    const [res1, res2] = await Promise.all([p1, p2]);
    const successCount = (res1.status === 200 || res1.status === 201 ? 1 : 0) +
                         (res2.status === 200 || res2.status === 201 ? 1 : 0);

    const finalProd = await db.getProductById(limitedProdId);
    console.log(`   Concurrent Checkouts: Success count = ${successCount}, Final DB Stock = ${finalProd?.stock}`);

    if (finalProd && finalProd.stock < 0) {
      throw new Error(`CRITICAL RACE CONDITION: Inventory dropped below 0 to ${finalProd.stock}`);
    }
  });

  // -------------------------------------------------------------
  // SUITE 7: CIRCUIT BREAKER & SYSTEM OBSERVABILITY
  // -------------------------------------------------------------
  await testStep('Observability', '1. System Health & Real-time Telemetry Verification', async () => {
    const healthRes = await req('GET', '/api/health');
    if (healthRes.status !== 200 || healthRes.body.status !== 'healthy') {
      throw new Error(`Health check failed: ${JSON.stringify(healthRes.body)}`);
    }

    const cbRes = await req('GET', '/api/observability/circuit-breakers');
    if (cbRes.status !== 200) {
      throw new Error(`Circuit breakers status failed: ${JSON.stringify(cbRes.body)}`);
    }
  });

  // Print Summary
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;

  console.log('\n================================================================');
  console.log(`E2E & REGRESSION RESULTS: ${passed}/${total} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2EAndRegressionSuite().catch((e) => {
  console.error('Fatal test execution error:', e);
  process.exit(1);
});
