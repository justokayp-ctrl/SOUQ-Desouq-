import { TestRunner } from '../testFramework';
import { eventBus } from '../../server/events/eventBus';
import { workerEngine } from '../../server/workers/workerEngine';

export async function runEventsWorkersTests(runner: TestRunner): Promise<void> {
  runner.describe('Domain Event Bus & Asynchronous Worker Engine', () => {

    runner.test('EventBus publishes domain event and persists record in database', async () => {
      const event = await eventBus.publish(
        'order.created',
        'order',
        'ord-unit-test-evt-1',
        {
          orderId: 'ord-unit-test-evt-1',
          customerName: 'اختبار الأحداث',
          totalAmountEGP: 450,
        },
        {
          userId: 'user-event-test',
          role: 'customer',
        }
      );

      runner.assert(!!event && !!event.id, 'Published event should have an ID');
      runner.assertEquals(event.eventName, 'order.created', 'Event name should be order.created');
      runner.assertEquals(event.aggregateType, 'order', 'Aggregate type should be order');

      const queried = eventBus.getEventById(event.id);
      runner.assert(!!queried, 'Event should be queryable by ID from database');
      runner.assertEquals(queried?.aggregateId, 'ord-unit-test-evt-1', 'Aggregate ID should match');
    });

    runner.test('WorkerEngine enqueues background job and computes real-time telemetry metrics', () => {
      const testJobKey = `unit-job-key-${Date.now()}`;
      const job = workerEngine.enqueue({
        queueName: 'notifications',
        jobType: 'send_order_notification',
        payload: {
          phone: '01012345678',
          message: 'تم استلام طلبك بنجاح وجاري تجهيز الشحنة',
        },
        idempotencyKey: testJobKey,
      });

      runner.assert(!!job && !!job.id, 'Job should be created with an ID');
      runner.assertEquals(job.status, 'queued', 'Initial job status must be queued');

      const stats = workerEngine.getStats();
      runner.assert(typeof stats.queued === 'number', 'Queue stats should report queued count');
    });

  });
}
