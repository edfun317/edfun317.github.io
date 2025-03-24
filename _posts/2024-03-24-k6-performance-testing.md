---
layout: post
title: Performance Testing with K6 - A Practical Guide
date: 2024-03-24
description: A comprehensive guide to performance testing using K6, including setup, basic tests, advanced features, and best practices.
tags: k6 performance-testing javascript web
categories: technical testing javascript
---

## Introduction

Performance testing is crucial for ensuring your applications can handle real-world loads. K6, an open-source load testing tool, provides a developer-friendly approach to performance testing using JavaScript. This guide will walk you through using K6 effectively for your performance testing needs.

### What is K6?

K6 is a modern load testing tool that allows you to write performance tests as JavaScript code. Its key advantages include:
- Developer-friendly API
- Local and cloud execution options
- Extensive metrics and analysis capabilities
- Low resource footprint

## Setting Up K6

### Installation

Installing K6 is straightforward. Here are the commands for different platforms:

```bash
# macOS (using Homebrew)
brew install k6

# Windows (using Chocolatey)
choco install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

Verify the installation:

```bash
k6 version
```

## Writing Your First K6 Test

Let's create a simple test script that checks a website's performance. Create a file named `script.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  vus: 10,  // Number of virtual users
  duration: '30s',  // Test duration
};

// Main test function
export default function() {
  // Make an HTTP GET request
  const res = http.get('https://test.k6.io');
  
  // Check if response is successful
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  // Wait between requests
  sleep(1);
}
```

Run the test:

```bash
k6 run script.js
```

## Advanced K6 Features

### Test Scenarios

K6 allows you to define complex test scenarios with different user behaviors:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    browse_products: {
      exec: 'browseProducts',
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '1m', target: 0 },
      ],
    },
    perform_checkout: {
      exec: 'checkoutProcess',
      executor: 'constant-vus',
      vus: 10,
      duration: '4m',
    },
  },
};

export function browseProducts() {
  http.get('https://test.k6.io/products');
  sleep(2);
}

export function checkoutProcess() {
  http.post('https://test.k6.io/checkout', {
    productId: 1,
    quantity: 1,
  });
  sleep(3);
}
```

### Thresholds and Checks

Set performance thresholds to automatically fail tests when criteria aren't met:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
    checks: ['rate>0.9'],             // 90% of checks should pass
  },
};

export default function() {
  const res = http.get('https://test.k6.io');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });
  
  sleep(1);
}
```

## Test Analysis

### Understanding Results

K6 provides detailed metrics after test execution:

```plaintext
    data_received..............: 1.2 MB  89 kB/s
    data_sent.................: 24 kB   1.8 kB/s
    http_req_blocked..........: avg=1.95ms   min=0s      med=0s      max=123.12ms p(90)=0s      p(95)=0s     
    http_req_connecting.......: avg=0.98ms   min=0s      med=0s      max=61.56ms  p(90)=0s      p(95)=0s     
    http_req_duration.........: avg=214.06ms min=167.77ms med=210.4ms max=378.83ms p(90)=234.51ms p(95)=264.89ms
    http_req_failed...........: 0.00%   ✓ 0   ✗ 300
    http_req_receiving........: avg=2.36ms   min=0.12ms  med=1.97ms  max=12.3ms   p(90)=3.97ms   p(95)=4.88ms 
    http_req_sending.........: avg=0.35ms   min=0.06ms  med=0.28ms  max=3.02ms   p(90)=0.56ms   p(95)=0.79ms 
    http_reqs................: 300     22.37/s
```

Key metrics to monitor:
- `http_req_duration`: Total request duration
- `http_req_failed`: Rate of failed requests
- `vus`: Number of virtual users
- `iterations`: Total number of script iterations

## Best Practices

1. **Start Small and Scale Up**
   - Begin with few virtual users
   - Gradually increase load to identify breaking points
   - Monitor system resources during tests

2. **Use Realistic Scenarios**
   ```javascript
   export const options = {
     scenarios: {
       peaks_and_troughs: {
         executor: 'ramping-vus',
         stages: [
           { duration: '5m', target: 100 },  // Morning rush
           { duration: '2h', target: 50 },   // Normal activity
           { duration: '5m', target: 150 },  // Evening peak
         ],
       },
     },
   };
   ```

3. **Include Think Time**
   - Add realistic delays between actions
   - Use `sleep()` with random variations
   ```javascript
   sleep(Math.random() * 3 + 2); // Sleep 2-5 seconds
   ```

4. **Monitor Resource Usage**
   ```bash
   k6 run --out statsd script.js
   ```

5. **Use Tags for Better Analysis**
   ```javascript
   http.get('https://api.example.com/users', {
     tags: { endpoint: 'get_users' }
   });
   ```

## Conclusion

K6 provides a powerful, developer-friendly approach to performance testing. By following these practices and utilizing K6's features effectively, you can create comprehensive performance tests that help ensure your applications perform well under load.

Remember to:
- Start with clear performance goals
- Write maintainable test scripts
- Monitor and analyze results consistently
- Iterate and refine your tests based on findings
