import { TestRunner } from '../testFramework';
import { db } from '../../server/db';
import { signToken, verifyToken, toAuthUser } from '../../server/auth';
import { validateEmail } from '../../server/utils/emailValidator';
import { bruteForceProtection } from '../../server/security/bruteForceProtection';

export async function runAuthRbacTests(runner: TestRunner): Promise<void> {
  runner.describe('Authentication & Role-Based Access Control (RBAC)', () => {

    runner.test('Customer authentication with valid credentials', () => {
      const user = db.validateUserCredentials('customer@souqdesoq.eg', 'Password123!');
      runner.assert(!!user, 'Valid customer should authenticate');
      runner.assertEquals(user?.role, 'customer', 'User role should be customer');
      runner.assertEquals(user?.email, 'customer@souqdesoq.eg', 'Email should match');
    });

    runner.test('Seller authentication links to merchant ID', () => {
      const seller = db.validateUserCredentials('farmawy@souqdesoq.eg', 'Password123!');
      runner.assert(!!seller, 'Valid seller should authenticate');
      runner.assertEquals(seller?.role, 'seller', 'User role should be seller');
      runner.assertEquals(seller?.sellerId, 'seller-1', 'Seller should be linked to seller-1');
    });

    runner.test('Admin authentication with elevated privileges', () => {
      const admin = db.validateUserCredentials('admin@souqdesoq.eg', 'Password123!');
      runner.assert(!!admin, 'Valid admin should authenticate');
      runner.assertEquals(admin?.role, 'admin', 'User role should be admin');
    });

    runner.test('Support persona authentication for consumer protection arbitration', () => {
      const support = db.validateUserCredentials('support@souqdesoq.eg', 'Password123!');
      runner.assert(!!support, 'Support user should authenticate');
      runner.assertEquals(support?.role, 'support', 'Role should be support');
    });

    runner.test('Invalid password rejection', () => {
      const invalid = db.validateUserCredentials('customer@souqdesoq.eg', 'WrongPassword123!');
      runner.assertEquals(invalid, null, 'Invalid password must return null');
    });

    runner.test('Non-existent email rejection', () => {
      const invalid = db.validateUserCredentials('nonexistent@souqdesoq.eg', 'Password123!');
      runner.assertEquals(invalid, null, 'Non-existent user must return null');
    });

    runner.test('JWT token generation and verification cycle', () => {
      const user = db.getUserByEmailOrPhone('customer@souqdesoq.eg')!;
      runner.assert(!!user, 'Customer user record should exist');
      const authUser = toAuthUser(user);
      const token = signToken(user);

      runner.assert(typeof token === 'string' && token.length > 20, 'Signed token should be non-empty string');

      const verified = verifyToken(token);
      runner.assert(!!verified, 'Token should verify successfully');
      runner.assertEquals(verified?.userId, user.id, 'Verified ID should match');
      runner.assertEquals(verified?.role, authUser.role, 'Verified role should match');
    });

    runner.test('Tampered or invalid JWT token rejection', () => {
      const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
      const verified = verifyToken(tamperedToken);
      runner.assertEquals(verified, null, 'Tampered token must fail verification');
    });

    runner.test('Authoritative session revocation immediately invalidates token', () => {
      const user = db.getUserByEmailOrPhone('customer@souqdesoq.eg')!;
      const token = signToken(user);
      runner.assert(db.isSessionValid(token), 'Session should be valid immediately after creation');

      db.revokeSession(token);
      runner.assertEquals(db.isSessionValid(token), false, 'Revoked session token must be immediately recognized as invalid');
    });

    runner.test('Disposable email and dummy domains are blocked strictly', () => {
      const tempRes = validateEmail('spammer@10minutemail.com');
      runner.assertEquals(tempRes.valid, false, 'Temporary disposable email must be blocked');

      const dummyRes = validateEmail('fakeuser@test.com');
      runner.assertEquals(dummyRes.valid, false, 'Dummy test domain must be blocked');

      const legitimateRes = validateEmail('Customer.Desoq@gmail.com');
      runner.assertEquals(legitimateRes.valid, true, 'Legitimate customer email should be valid');
      runner.assertEquals(legitimateRes.normalizedEmail, 'customer.desoq@gmail.com', 'Email should be normalized to lowercase');
    });

    runner.test('Brute force protection locks account after repeated failed attempts', () => {
      const targetId = 'brute-target@souqdesoq.eg';
      const testIp = '192.168.1.50';

      for (let i = 1; i <= 4; i++) {
        const attempt = bruteForceProtection.recordFailedAttempt(targetId, testIp);
        runner.assertEquals(attempt.isNowLocked, false, `Attempt ${i} should not lock account yet`);
      }

      const fifthAttempt = bruteForceProtection.recordFailedAttempt(targetId, testIp);
      runner.assertEquals(fifthAttempt.isNowLocked, true, '5th failed attempt must trigger account lockout');

      const lockCheck = bruteForceProtection.isLocked(targetId, testIp);
      runner.assertEquals(lockCheck.locked, true, 'Account should be actively locked');
      runner.assertGte(lockCheck.remainingSeconds, 60, 'Locked remaining seconds should be positive');

      // Cleanup
      bruteForceProtection.recordSuccess(targetId, testIp);
      runner.assertEquals(bruteForceProtection.isLocked(targetId, testIp).locked, false, 'Successful login resets lockout');
    });

  });
}
