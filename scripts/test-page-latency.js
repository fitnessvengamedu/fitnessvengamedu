const http = require('http');
const https = require('https');
const { URL } = require('url');

// Define targets (both production live site and localhost fallback)
const defaultHost = process.argv[2] || 'https://sfitness.qzz.io';
const pages = [
  '/',
  '/about',
  '/gallery',
  '/services',
  '/review',
  '/feedback'
];

async function measurePage(urlStr) {
  return new Promise((resolve) => {
    const urlObj = new URL(urlStr);
    const client = urlObj.protocol === 'https:' ? https : http;
    const start = Date.now();
    let ttfb = 0;
    
    const req = client.get(urlObj, (res) => {
      res.once('data', () => {
        ttfb = Date.now() - start;
      });
      
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        const total = Date.now() - start;
        resolve({
          url: urlObj.pathname,
          status: res.statusCode,
          ttfb: ttfb || total,
          totalTime: total,
          sizeKb: (Buffer.byteLength(rawData, 'utf8') / 1024).toFixed(2)
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url: urlObj.pathname,
        status: 'ERROR',
        ttfb: -1,
        totalTime: -1,
        sizeKb: 0,
        error: err.message
      });
    });
  });
}

async function runTests() {
  console.log(`\n==================================================`);
  console.log(`S FITNESS - LATENCY PERFORMANCE TEST SUITE`);
  console.log(`Targeting Host: ${defaultHost}`);
  console.log(`==================================================\n`);
  
  const results = [];
  for (const page of pages) {
    const fullUrl = `${defaultHost}${page}`;
    process.stdout.write(`Testing ${page}... `);
    const metrics = await measurePage(fullUrl);
    results.push(metrics);
    if (metrics.status === 'ERROR') {
      console.log(`❌ Failed (${metrics.error})`);
    } else {
      console.log(`✅ Status ${metrics.status} in ${metrics.totalTime}ms (TTFB: ${metrics.ttfb}ms, Size: ${metrics.sizeKb} KB)`);
    }
  }
  
  console.log(`\n==================================================`);
  console.log(`PERFORMANCE OVERVIEW REPORT CARD`);
  console.log(`==================================================`);
  console.table(results.map(r => ({
    "Route": r.url,
    "Status": r.status,
    "TTFB (ms)": r.ttfb,
    "Total Load (ms)": r.totalTime,
    "Size (KB)": r.sizeKb
  })));
  
  const slowPages = results.filter(r => r.totalTime > 600);
  if (slowPages.length > 0) {
    console.log(`⚠️  Warning: ${slowPages.length} route(s) exceeded the 600ms latency budget.`);
  } else {
    console.log(`🎉 Success: All tested routes loaded within acceptable limits (<600ms)!`);
  }
  console.log(`==================================================\n`);
}

runTests();
