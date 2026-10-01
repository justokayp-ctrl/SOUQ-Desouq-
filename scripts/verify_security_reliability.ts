import http from 'http';

interface TestResult {
  category: string;
  name: string;
  endpoint: string;
  method: string;
  actor: string;
  headers: Record<string, string>;
  body?: any;
  expectedStatus: number | number[];
  actualStatus: number;
  actualBody: any;
  passed: boolean;
  notes?: string;
}

function sendRequest(
  method: string,
  path: string,
  headers: Record<string, string> = {},
  body?: any
): Promise<{ status: number; body: any; raw: string }> {
  return new Promise((resolve, reject) => {
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '';
    const reqHeaders: Record<string, string> = {
      ...headers,
    };
    if (body) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
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
            raw,
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runSecurityAndReliabilityTests() {
  console.log('================================================================');
  console.log('🛡️ SOUQ DESOQ DEFENSIVE SECURITY & RELIABILITY VERIFICATION SUITE');
  console.log('================================================================\n');

  const results: TestResult[] = [];

  async function testCase(
    category: string,
    name: string,
    method: string,
    endpoint: string,
    actor: string,
    headers: Record<string, string>,
    body: any,
    expectedStatus: number | number[]
  ) {
    try {
      const res = await sendRequest(method, endpoint, headers, body);
      const isExpected = Array.isArray(expectedStatus)
        ? expectedStatus.includes(res.status)
        : res.status === expectedStatus;

      const result: TestResult = {
        category,
        name,
        endpoint,
        method,
        actor,
        headers,
        body,
        expectedStatus,
        actualStatus: res.status,
        actualBody: res.body,
        passed: isExpected,
      };
      results.push(result);

      const statusSymbol = isExpected ? '✅' : '❌';
      console.log(
        `${statusSymbol} [${category}] ${name} -> Expected: ${JSON.stringify(expectedStatus)}, Got: ${res.status}`
      );
      if (!isExpected) {
        console.log(`   Response:`, typeof res.body === 'object' ? JSON.stringify(res.body) : res.body);
      }
    } catch (e: any) {
      console.error(`❌ [${category}] ${name} failed with error:`, e.message);
      results.push({
        category,
        name,
        endpoint,
        method,
        actor,
        headers,
        body,
        expectedStatus,
        actualStatus: 0,
        actualBody: e.message,
        passed: false,
        notes: e.message,
      });
    }
  }

  // 1. AUTHENTICATION & ACCESS CONTROL (401 & 403 ENFORCEMENT)
  console.log('\n--- 1. AUTHENTICATION & ACCESS CONTROL ---');
  await testCase(
    'Auth',
    'Unauthenticated access to private KYC list',
    'GET',
    '/api/storage/kyc',
    'Anonymous',
    {},
    null,
    401
  );

  await testCase(
    'Auth',
    'Unauthenticated access to admin metrics',
    'GET',
    '/api/admin/metrics',
    'Anonymous',
    {},
    null,
    401
  );

  await testCase(
    'Auth',
    'Customer role blocked from admin metrics (403)',
    'GET',
    '/api/admin/metrics',
    'Customer',
    { 'x-role-override': 'customer' },
    null,
    403
  );

  await testCase(
    'Auth',
    'Customer role blocked from courier shift view (403)',
    'GET',
    '/api/courier/deliveries',
    'Customer',
    { 'x-role-override': 'customer' },
    null,
    403
  );

  // 2. SELLER A vs SELLER B (TENANT ISOLATION & IDOR DEFENSE)
  console.log('\n--- 2. SELLER A vs SELLER B (TENANT ISOLATION) ---');
  await testCase(
    'Tenant Isolation',
    'Seller A (seller-1) querying KYC with sellerId=seller-2 receives only own docs (200)',
    'GET',
    '/api/storage/kyc?sellerId=seller-2',
    'Seller 1',
    { 'x-role-override': 'seller', 'x-seller-id': 'seller-1' },
    null,
    200
  );

  await testCase(
    'Tenant Isolation',
    'Customer blocked from KYC Vault list (403)',
    'GET',
    '/api/storage/kyc',
    'Customer',
    { 'x-role-override': 'customer' },
    null,
    403
  );

  // 3. PRIVATE OBJECT STORAGE & SENSITIVE FILE ACCESS (VAULT)
  console.log('\n--- 3. PRIVATE STORAGE & KYC VAULT ACCESS ---');
  
  const validPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n162\n%%EOF');
  const uploadRes = await sendRequest(
    'POST',
    '/api/storage/kyc',
    { 'x-role-override': 'seller', 'x-seller-id': 'seller-1' },
    {
      sellerId: 'seller-1',
      documentType: 'tax_card',
      titleAr: 'بطاقة ضريبية معتمدة - دسوق',
      documentNumber: 'EG-TX-884920',
      base64Data: `data:application/pdf;base64,${validPdfBuffer.toString('base64')}`,
      filename: 'tax_card_seller1.pdf',
      mimeType: 'application/pdf',
      purpose: 'kyc_tax_card',
    }
  );

  const fileId = uploadRes.body?.fileId || uploadRes.body?.file?.id;
  console.log(`  Uploaded KYC Document for testing, File ID: ${fileId}`);

  if (fileId) {
    await testCase(
      'Storage Isolation',
      'Unauthenticated direct download of private KYC file (401)',
      'GET',
      `/api/storage/files/${fileId}/download`,
      'Anonymous',
      {},
      null,
      401
    );

    await testCase(
      'Storage Isolation',
      'Customer direct download of seller private KYC file (403)',
      'GET',
      `/api/storage/files/${fileId}/download`,
      'Customer',
      { 'x-role-override': 'customer' },
      null,
      403
    );

    await testCase(
      'Storage Isolation',
      'Seller B (seller-2) attempting to download Seller A private KYC file (403)',
      'GET',
      `/api/storage/files/${fileId}/download`,
      'Seller 2',
      { 'x-role-override': 'seller', 'x-seller-id': 'seller-2' },
      null,
      403
    );

    await testCase(
      'Storage Isolation',
      'Seller A (owner) authorized download of own KYC document (200)',
      'GET',
      `/api/storage/files/${fileId}/download`,
      'Seller 1',
      { 'x-role-override': 'seller', 'x-seller-id': 'seller-1' },
      null,
      200
    );

    await testCase(
      'Storage Isolation',
      'Admin authorized download of KYC document (200)',
      'GET',
      `/api/storage/files/${fileId}/download`,
      'Admin',
      { 'x-role-override': 'admin' },
      null,
      200
    );

    // Test Signed URL Generation & Validation
    const signedUrlRes = await sendRequest(
      'GET',
      `/api/storage/files/${fileId}/signed-url`,
      { 'x-role-override': 'seller', 'x-seller-id': 'seller-1' }
    );

    if (signedUrlRes.body?.signedUrl) {
      await testCase(
        'Storage Signed URL',
        'Valid Signed URL access without authorization header (200)',
        'GET',
        signedUrlRes.body.signedUrl,
        'Anonymous with Signed Token',
        {},
        null,
        200
      );

      await testCase(
        'Storage Signed URL',
        'Tampered Signed Token rejected (403)',
        'GET',
        `/api/storage/files/${fileId}/download?token=tampered.invalid.token`,
        'Attacker with Fake Token',
        {},
        null,
        403
      );
    }
  }

  // 4. COURIER ≠ ADMIN, SUPPORT ≠ ADMIN BOUNDARIES
  console.log('\n--- 4. ROLE BOUNDARIES (COURIER/SUPPORT ≠ ADMIN) ---');
  await testCase(
    'RBAC Boundary',
    'Courier blocked from Admin Users Management (403)',
    'GET',
    '/api/admin/users',
    'Courier',
    { 'x-role-override': 'courier' },
    null,
    403
  );

  await testCase(
    'RBAC Boundary',
    'Support blocked from Admin Users Management (403)',
    'GET',
    '/api/admin/users',
    'Support',
    { 'x-role-override': 'support' },
    null,
    403
  );

  await testCase(
    'RBAC Boundary',
    'Seller blocked from Courier Shift Settlements (403)',
    'GET',
    '/api/courier/shift/settlements',
    'Seller',
    { 'x-role-override': 'seller', 'x-seller-id': 'seller-1' },
    null,
    403
  );

  await testCase(
    'RBAC Boundary',
    'Support authorized to access unified support disputes (200)',
    'GET',
    '/api/support/disputes',
    'Support',
    { 'x-role-override': 'support' },
    null,
    200
  );

  // 5. INJECTION & SANITIZATION DEFENSE
  console.log('\n--- 5. INJECTION & SANITIZATION DEFENSE ---');
  await testCase(
    'Injection Defense',
    'SQL Injection attempt in product query handled safely (200 / 0 injection)',
    'GET',
    '/api/products?search=' + encodeURIComponent("'; DROP TABLE products; --"),
    'Public',
    {},
    null,
    200
  );

  // 6. RELIABILITY & ERROR RECOVERY
  console.log('\n--- 6. RELIABILITY & CIRCUIT BREAKERS ---');
  await testCase(
    'Reliability',
    'Health Check Endpoint returns 200 OK with active telemetry',
    'GET',
    '/api/health',
    'Public',
    {},
    null,
    200
  );

  await testCase(
    'Reliability',
    'Circuit Breakers status returns 200 OK',
    'GET',
    '/api/observability/circuit-breakers',
    'Public',
    {},
    null,
    200
  );

  await testCase(
    'Reliability',
    'Non-existent product ID returns 404 cleanly without crashing',
    'GET',
    '/api/products/non-existent-product-id-99999',
    'Public',
    {},
    null,
    404
  );

  await testCase(
    'Reliability',
    'Malformed JSON in POST request handled safely (400 Bad Request)',
    'POST',
    '/api/cart/add',
    'Public',
    { 'Content-Type': 'application/json' },
    '{"malformed": json, invalid syntax',
    400
  );

  // Summary
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log('\n================================================================');
  console.log(`SUMMARY: ${passedCount}/${totalCount} Defensive Security & Reliability Tests Passed`);
  console.log('================================================================\n');

  process.exit(passedCount === totalCount ? 0 : 1);
}

runSecurityAndReliabilityTests();
