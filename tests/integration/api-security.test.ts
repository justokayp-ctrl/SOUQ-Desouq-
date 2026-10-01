import { TestRunner, TestHttpClient } from '../testFramework';
import { db } from '../../server/db';
import { signToken, toAuthUser } from '../../server/auth';

export async function runApiSecurityTests(runner: TestRunner): Promise<void> {
  const client = new TestHttpClient();

  runner.describe('API Security Boundaries, RBAC & Ownership Enforcement', () => {

    // Generate tokens for testing
    const customerUser = db.getUserByEmailOrPhone('customer@souqdesoq.eg')!;
    const customerToken = signToken(customerUser);

    const seller1User = db.getUserByEmailOrPhone('farmawy@souqdesoq.eg')!;
    const seller1Token = signToken(seller1User);

    const seller2User = db.getUserByEmailOrPhone('carpet@souqdesoq.eg')!;
    const seller2Token = signToken(seller2User);

    const adminUser = db.getUserByEmailOrPhone('admin@souqdesoq.eg')!;
    const adminToken = signToken(adminUser);

    runner.test('GET /api/audit requires authentication or returns public baseline', async () => {
      const res = await client.request({
        method: 'GET',
        path: '/api/audit',
      });
      runner.assert(res.status === 200 || res.status === 401, 'Audit log access must enforce status boundary');
    });

    runner.test('Customer cannot access seller payout requests', async () => {
      const res = await client.request({
        method: 'POST',
        path: '/api/seller/payout',
        token: customerToken,
        body: { amount: 100, payoutMethodTitle: 'فودافون كاش' },
      });
      runner.assertEquals(res.status, 403, 'Customer role must be forbidden from initiating seller payouts');
    });

    runner.test('Seller cannot request payout exceeding available ledger balance', async () => {
      const res = await client.request({
        method: 'POST',
        path: '/api/seller/payout',
        token: seller1Token,
        body: { amount: 999999, payoutMethodTitle: 'تحويل بنكي' },
      });
      runner.assert(res.status === 400 || (res.body && res.body.success === false), 'Excessive payout request must be rejected');
    });

    runner.test('Seller A cannot modify Seller B products or orders', async () => {
      // Find a product owned by seller-2
      const seller2Product = db.getProducts({ sellerId: 'seller-2' })[0];
      if (seller2Product) {
        const updateRes = await client.request({
          method: 'PATCH',
          path: `/api/products/${seller2Product.id}`,
          token: seller1Token, // Seller 1 trying to modify Seller 2 product
          body: { priceEGP: 1 },
        });
        runner.assert(updateRes.status === 403 || updateRes.status === 404, 'Seller 1 must be blocked from modifying Seller 2 products');
      }
    });

    runner.test('Admin role has permission to review all merchant disputes', async () => {
      const res = await client.request({
        method: 'GET',
        path: '/api/disputes',
        token: adminToken,
      });
      runner.assertEquals(res.status, 200, 'Admin token should grant access to full disputes list');
    });

    // Session Management, Refresh, Expiration & Seller Onboarding Tests
    runner.test('POST /api/auth/login succeeds with valid credentials and issues JWT token', async () => {
      const res = await client.request({
        method: 'POST',
        path: '/api/auth/login',
        body: {
          identifier: 'customer@souqdesoq.eg',
          password: 'Password123!',
        },
      });
      runner.assertEquals(res.status, 200, 'Login status should be 200 OK');
      runner.assert(!!res.body.token, 'Response must contain a signed JWT token');
      runner.assertEquals(res.body.user.role, 'customer', 'Authenticated user role must be customer');
    });

    runner.test('POST /api/auth/refresh rotates valid session token', async () => {
      const res = await client.request({
        method: 'POST',
        path: '/api/auth/refresh',
        token: customerToken,
      });
      runner.assertEquals(res.status, 200, 'Token refresh must return 200 OK');
      runner.assert(!!res.body.token, 'Refresh must provide a fresh token');
      runner.assertEquals(res.body.user.email, 'customer@souqdesoq.eg', 'User email must be preserved');
    });

    runner.test('POST /api/auth/refresh without token returns 401 Unauthorized', async () => {
      const res = await client.request({
        method: 'POST',
        path: '/api/auth/refresh',
      });
      runner.assertEquals(res.status, 401, 'Unauthenticated refresh must return 401');
    });

    runner.test('POST /api/auth/register handles comprehensive seller onboarding pipeline', async () => {
      const uniqueEmail = `seller_audit_${Date.now()}@souqdesoq.eg`;
      const uniquePhone = `010${Math.floor(10000000 + Math.random() * 90000000)}`;
      const res = await client.request({
        method: 'POST',
        path: '/api/auth/register',
        body: {
          fullName: 'عمرو عبد الحميد الشرقاوي',
          email: uniqueEmail,
          phone: uniquePhone,
          password: 'SecurePassword123!',
          role: 'seller',
          storeName: 'أقمشة الشرقاوي الأصيلة',
          tradeName: 'الشرقاوي لتجارة النسيج',
          ownerName: 'عمرو الشرقاوي',
          desoqDistrict: 'حي دحروج وشارع الجمهورية',
          businessCategory: 'أقمشة ومنسوجات دسوقية',
          commercialRecordNumber: 'CR-887711',
          taxRegistrationNumber: 'TR-332211',
          nationalIdNumber: '28911011501234'
        },
      });

      runner.assertEquals(res.status, 201, 'Seller onboarding registration should return 201 Created');
      runner.assert(!!res.body.token, 'New seller must receive an authentication token');
      runner.assertEquals(res.body.user.role, 'seller', 'Registered role must be seller');
      runner.assert(!!res.body.user.sellerId, 'Registered seller must have an auto-provisioned sellerId');

      // Verify seller store was persisted in database
      const createdSeller = db.getSellerById(res.body.user.sellerId);
      runner.assert(!!createdSeller, 'Seller profile must be persisted in database');
      runner.assertEquals(createdSeller?.name, 'أقمشة الشرقاوي الأصيلة', 'Store name must match registered value');
      runner.assertEquals(createdSeller?.district, 'حي دحروج وشارع الجمهورية', 'District must match registered value');
    });

    runner.test('Role escalation prevention: Client cannot bypass server authorization', async () => {
      // Customer tries to call admin-only endpoints
      const res = await client.request({
        method: 'GET',
        path: '/api/audit',
        token: customerToken,
      });
      // Audit endpoint is restricted to admins/staff
      runner.assert(res.status === 403 || res.status === 401, 'Customer must not access internal audit logs');
    });

    runner.test('GET /api/admin/users requires admin privileges', async () => {
      const customerRes = await client.request({
        method: 'GET',
        path: '/api/admin/users',
        token: customerToken,
      });
      runner.assertEquals(customerRes.status, 403, 'Customer must be blocked from fetching admin user list');

      const adminRes = await client.request({
        method: 'GET',
        path: '/api/admin/users',
        token: adminToken,
      });
      runner.assertEquals(adminRes.status, 200, 'Admin token must be allowed to fetch user list');
    });

    runner.test('PATCH /api/admin/users/:id/role blocks non-admin from privilege escalation', async () => {
      const res = await client.request({
        method: 'PATCH',
        path: `/api/admin/users/${customerUser.id}/role`,
        token: customerToken, // Customer trying to elevate themselves to admin
        body: { role: 'admin' },
      });
      runner.assertEquals(res.status, 403, 'Customer cannot promote themselves to admin role');
    });

    runner.test('GET /api/admin/audit-logs requires admin role', async () => {
      const sellerRes = await client.request({
        method: 'GET',
        path: '/api/admin/audit-logs',
        token: seller1Token,
      });
      runner.assertEquals(sellerRes.status, 403, 'Seller role must be blocked from audit logs');

      const adminRes = await client.request({
        method: 'GET',
        path: '/api/admin/audit-logs',
        token: adminToken,
      });
      runner.assertEquals(adminRes.status, 200, 'Admin token must have access to audit logs');
    });

  });
}
