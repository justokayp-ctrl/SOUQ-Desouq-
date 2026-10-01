import { TestRunner } from './testFramework';
import { db } from '../server/db';
import { INITIAL_PRODUCTS } from '../src/data/mockData';
import { runAuthRbacTests } from './unit/auth-rbac.test';
import { runCatalogSearchTests } from './unit/catalog-search.test';
import { runCartCheckoutTests } from './unit/cart-checkout.test';
import { runOrdersInventoryTests } from './unit/orders-inventory.test';
import { runPaymentsRefundsLedgerTests } from './unit/payments-refunds-ledger.test';
import { runDisputesConsumerLawTests } from './unit/disputes-consumer-law.test';
import { runEventsWorkersTests } from './unit/events-workers.test';
import { runSellerWorkspaceOperationsTests } from './unit/seller-workspace-operations.test';
import { runProductCreationWizardTests } from './unit/product-creation-wizard-11steps.test';
import { runApiSecurityTests } from './integration/api-security.test';
import { runE2EWorkflowsTests } from './integration/e2e-workflows.test';
import { runApiSmokeTests } from './qa/api-smoke.test';
import { runProjectIntegrityTests } from './qa/project-integrity.test';
import { QAReporter } from './qa/report';

async function executeTestSuite() {
  console.log('====================================================');
  console.log('🧪 SOUQ DESOQ V2 — UNIFIED QA & INTEGRATION TEST SUITE');
  console.log(' Full Coverage: Unit, RBAC, Catalog, E2E & QA Smoke');
  console.log('====================================================');

  const runner = new TestRunner();

  // Reset product stocks and status to baseline so tests are repeatable across runs
  for (const p of INITIAL_PRODUCTS) {
    db.updateProduct(p.id, { stock: p.stock, status: 'active' });
  }

  try {
    // 1. Unit Tests (Domain Core & Business Rules)
    await runAuthRbacTests(runner);
    await runCatalogSearchTests(runner);
    await runCartCheckoutTests(runner);
    await runOrdersInventoryTests(runner);
    await runPaymentsRefundsLedgerTests(runner);
    await runDisputesConsumerLawTests(runner);
    await runEventsWorkersTests(runner);
    await runSellerWorkspaceOperationsTests(runner);
    await runProductCreationWizardTests(runner);

    // 2. Integration & Security Boundaries
    await runApiSecurityTests(runner);

    // 3. End-to-End User Journeys & Concurrency Stress Tests
    await runE2EWorkflowsTests(runner);

    // 4. QA Smoke & Latency Validation
    await runApiSmokeTests(runner);

    // 5. Project Integrity, Configuration & Localization Parity
    await runProjectIntegrityTests(runner);

  } catch (err: any) {
    console.error('Fatal unhandled error during test suite execution:', err);
    process.exit(1);
  }

  const success = runner.printSummary();

  // Generate and persist structured QA report
  const summary = QAReporter.generateSummary(runner.getResults(), 'testing');
  const reportFile = QAReporter.saveReport(summary);
  if (reportFile) {
    console.log(`📄 QA Report persisted to: ${reportFile}`);
  }

  if (!success) {
    console.error('❌ QA Test Suite failed! Halting build pipeline.');
    process.exit(1);
  } else {
    console.log('✅ All marketplace core domain & API workflows verified successfully!');
    process.exit(0);
  }
}

executeTestSuite();
