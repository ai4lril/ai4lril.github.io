import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Rate Limiting - ILHRF API Docs',
};

export default function RateLimitingDocs() {
    return (
        <div className="prose max-w-none">
            <h1>Rate Limiting</h1>
            <p>The API enforces rate limits to prevent abuse. Limits are per-API-key (60 requests/min default) or per-IP for unauth. Exceeded requests return 429.</p>

            <h2>API Key Rate Limiting</h2>
            <p>Per-key limit: 60 requests per minute. Uses <code>x-api-key</code> header or <code>api_key</code> query.</p>

            <h3>Exceeded Response (429)</h3>
            <pre><code>{`{
  "success": false,
  "error": {
    "statusCode": 429,
    "message": ["Rate limit exceeded. Try again in 60s."],
    "error": "Too Many Requests",
    "timestamp": "2025-01-24T10:00:00Z",
    "path": "/api/speech-sentences",
    "method": "GET"
  }
}`}</code></pre>

            <h3>Response Headers</h3>
            <ul>
                <li><code>X-RateLimit-Remaining</code>: Requests left in window (e.g., 59).</li>
                <li><code>X-RateLimit-Reset</code>: Seconds until reset (e.g., 45).</li>
            </ul>

            <h3>Client Retry Example</h3>
            <pre><code>{`// After 429, check headers
if (response.status === 429) {
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  showToast(\`Rate limited. \${remaining} left, resets in \${reset}s.\`);
  // Retry after parseInt(reset) * 1000 ms
}`}</code></pre>

            <h2>JWT Rate Limiting (Per-User)</h2>
            <p>Global: 120 requests/min per user/IP. Adjust via env (THROTTLE_DEFAULT=120).</p>

            <h2>Common Limits</h2>
            <ul>
                <li>Speech submission: 60/min (file upload).</li>
                <li>Question answer: 100/min.</li>
                <li>NLP calls: 30/min (beta).</li>
            </ul>

            <p>Exceeding limits logs to security events for monitoring.</p>
        </div>
    );
}
