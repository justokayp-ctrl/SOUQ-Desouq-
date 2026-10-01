import { getDatabase, runTransaction } from '../server/database/connection';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function cleanupAndSetAdmin() {
  const db = getDatabase();
  console.log('🧹 Starting cleanup of mock data and test accounts...');

  db.exec('PRAGMA foreign_keys = OFF;');

  try {
    runTransaction((tx) => {
      // 1. Clean up mock/test disputes and messages
      const delDispMsg = tx.prepare('DELETE FROM dispute_messages').run();
      const delDisputes = tx.prepare('DELETE FROM disputes').run();
      console.log(`Deleted ${delDispMsg.changes} dispute messages and ${delDisputes.changes} disputes.`);

      // 2. Clean up inventory reservations, payments, shipments, commissions, ledger
      tx.prepare('DELETE FROM inventory_reservations').run();
      tx.prepare('DELETE FROM payments').run();
      tx.prepare('DELETE FROM shipments').run();
      tx.prepare('DELETE FROM commissions').run();
      tx.prepare('DELETE FROM seller_ledger').run();

      // 3. Clean up mock/test orders, sub-orders, and items
      const delOrderItems = tx.prepare('DELETE FROM order_items').run();
      const delSubOrders = tx.prepare('DELETE FROM sub_orders').run();
      const delOrders = tx.prepare('DELETE FROM orders').run();
      console.log(`Deleted ${delOrderItems.changes} order items, ${delSubOrders.changes} sub-orders, ${delOrders.changes} orders.`);

      // 4. Clean up cart items & active sessions
      const delCart = tx.prepare('DELETE FROM cart_items').run();
      const delSessions = tx.prepare('DELETE FROM sessions').run();
      console.log(`Cleared ${delCart.changes} cart items and ${delSessions.changes} sessions.`);

      // 5. Clean up fake/test users (qa_cust_*, cust-demo)
      const delQaUsers = tx.prepare("DELETE FROM users WHERE email LIKE 'qa_cust_%' OR id = 'cust-demo'").run();
      console.log(`Deleted ${delQaUsers.changes} fake/test accounts.`);

      // 6. Ensure the Admin account justokayp@gmail.com is installed and elevated
      const adminEmail = 'justokayp@gmail.com';
      const adminPasswordHash = hashPassword('Admin@2026!');
      const existingAdmin = tx.prepare('SELECT id FROM users WHERE lower(email) = ?').get(adminEmail.toLowerCase()) as any;

      if (existingAdmin) {
        tx.prepare(`
          UPDATE users 
          SET role = 'admin', full_name = 'مدير عام منصة سوق دسوق (justokayp)', password_hash = ?
          WHERE id = ?
        `).run(adminPasswordHash, existingAdmin.id);
        console.log(`✅ Admin account updated for ${adminEmail} (ID: ${existingAdmin.id})`);
      } else {
        const adminId = 'user-admin-root';
        tx.prepare(`
          INSERT INTO users (id, email, password_hash, full_name, phone, role, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          adminId,
          adminEmail.toLowerCase(),
          adminPasswordHash,
          'مدير عام منصة سوق دسوق (justokayp)',
          '01000000000',
          'admin',
          new Date().toISOString()
        );
        console.log(`✅ Admin account created: ${adminEmail} (ID: ${adminId})`);
      }

      // Also ensure admin@souqdesoq.eg has admin role so QA suites continue to work
      const existingQaAdmin = tx.prepare("SELECT id FROM users WHERE email = 'admin@souqdesoq.eg'").get() as any;
      if (existingQaAdmin) {
        tx.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(existingQaAdmin.id);
      }
    });
  } finally {
    db.exec('PRAGMA foreign_keys = ON;');
  }

  console.log('🎉 Database cleanup and Admin setup complete!');
}

if (process.argv[1]?.endsWith('clean_mock_data_and_set_admin.ts')) {
  cleanupAndSetAdmin();
}
