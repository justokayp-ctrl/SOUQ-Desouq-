import http from 'http';
import zlib from 'zlib';

function requestEndpoint(path: string, acceptEncoding: string = 'gzip'): Promise<{ status: number; bytes: number; latencyMs: number; encoding: string }> {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method: 'GET',
      headers: {
        'Accept-Encoding': acceptEncoding,
      },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const totalBytes = Buffer.concat(chunks).length;
        const latencyMs = performance.now() - start;
        resolve({
          status: res.statusCode || 0,
          bytes: totalBytes,
          latencyMs,
          encoding: (res.headers['content-encoding'] as string) || 'none',
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- API PERFORMANCE BENCHMARK (AFTER COMPRESSION & BATCHING) ---');
  
  // Test endpoints
  const endpoints = [
    '/api/products',
    '/api/products?limit=20',
    '/api/sellers',
    '/api/announcements',
    '/api/hero-slides',
    '/api/health',
  ];

  for (const ep of endpoints) {
    // Uncompressed measurement
    const uncompressed = await requestEndpoint(ep, 'identity');
    // Compressed measurement (gzip)
    const compressed = await requestEndpoint(ep, 'gzip');

    // Run 20 iterations to compute average latency
    const iterations = 20;
    let totalLatency = 0;
    for (let i = 0; i < iterations; i++) {
      const res = await requestEndpoint(ep, 'gzip');
      totalLatency += res.latencyMs;
    }
    const avgLatency = totalLatency / iterations;

    const savingsPercent = (((uncompressed.bytes - compressed.bytes) / uncompressed.bytes) * 100).toFixed(1);

    console.log(`Endpoint: ${ep}`);
    console.log(`  Raw Payload: ${(uncompressed.bytes / 1024).toFixed(2)} KB`);
    console.log(`  Gzip Payload: ${(compressed.bytes / 1024).toFixed(2)} KB (${savingsPercent}% reduction)`);
    console.log(`  Avg Latency: ${avgLatency.toFixed(2)} ms (over ${iterations} runs)`);
    console.log(`  Encoding: ${compressed.encoding}`);
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
