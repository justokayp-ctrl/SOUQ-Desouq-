import { app } from '../server';
import http from 'http';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export class TestRunner {
  private results: TestResult[] = [];
  private currentSuite = 'Default Suite';

  public describe(suiteName: string, fn: () => void | Promise<void>): void {
    this.currentSuite = suiteName;
    console.log(`\n====================================================`);
    console.log(`📂 SUITE: ${suiteName}`);
    console.log(`====================================================`);
    fn();
  }

  public async test(name: string, fn: () => void | Promise<void>): Promise<void> {
    const start = Date.now();
    try {
      await fn();
      const durationMs = Date.now() - start;
      console.log(`  ✅ [PASS] ${name} (${durationMs}ms)`);
      this.results.push({
        suite: this.currentSuite,
        name,
        passed: true,
        durationMs,
      });
    } catch (err: any) {
      const durationMs = Date.now() - start;
      const errorMsg = err?.message || String(err);
      console.error(`  ❌ [FAIL] ${name} (${durationMs}ms)`);
      console.error(`     Error: ${errorMsg}`);
      this.results.push({
        suite: this.currentSuite,
        name,
        passed: false,
        error: errorMsg,
        durationMs,
      });
    }
  }

  public assert(condition: boolean, message?: string): void {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  public assertEquals(actual: any, expected: any, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  public assertNotEquals(actual: any, expected: any, message?: string): void {
    if (actual === expected) {
      throw new Error(message || `Expected value not to equal ${JSON.stringify(expected)}`);
    }
  }

  public assertGte(actual: number, expected: number, message?: string): void {
    if (actual < expected) {
      throw new Error(message || `Expected ${actual} to be >= ${expected}`);
    }
  }

  public getSummary(): { total: number; passed: number; failed: number; durationMs: number } {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const durationMs = this.results.reduce((sum, r) => sum + r.durationMs, 0);
    return { total, passed, failed, durationMs };
  }

  public getResults(): TestResult[] {
    return [...this.results];
  }

  public printSummary(): boolean {
    const summary = this.getSummary();
    console.log('\n====================================================');
    console.log(`🏁 TEST SUITE SUMMARY: ${summary.passed}/${summary.total} PASSED (${summary.failed} FAILED) in ${summary.durationMs}ms`);
    console.log('====================================================\n');
    if (summary.failed > 0) {
      console.error('❌ Failed tests:');
      for (const r of this.results.filter(r => !r.passed)) {
        console.error(` - [${r.suite}] ${r.name}: ${r.error}`);
      }
      return false;
    }
    return true;
  }
}

// In-Memory Test HTTP Client for direct API testing without socket overhead
export class TestHttpClient {
  private server: http.Server | null = null;
  private baseUrl = '';

  public async start(): Promise<string> {
    if (this.baseUrl) return this.baseUrl;

    return new Promise((resolve) => {
      this.server = http.createServer(app);
      this.server.listen(0, '127.0.0.1', () => {
        const addr = this.server!.address() as any;
        this.baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve(this.baseUrl);
      });
    });
  }

  public async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          this.baseUrl = '';
          resolve();
        });
      });
    }
  }

  public async request(options: {
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    path: string;
    headers?: Record<string, string>;
    body?: any;
    token?: string;
  }): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
    const baseUrl = await this.start();
    const url = new URL(options.path, baseUrl);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
      headers['Cookie'] = `auth_token=${options.token}`;
    }

    let payload: string | undefined = undefined;
    if (options.body !== undefined) {
      payload = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      headers['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    return new Promise((resolve, reject) => {
      const req = http.request(url, {
        method: options.method,
        headers,
      }, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          let parsedBody: any = rawData;
          try {
            parsedBody = JSON.parse(rawData);
          } catch {
            // Keep raw string if not JSON
          }
          resolve({
            status: res.statusCode || 500,
            body: parsedBody,
            headers: res.headers,
          });
        });
      });

      req.on('error', (err) => reject(err));
      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }
}
