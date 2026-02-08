import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Authentication - ILHRF API Docs',
};

export default function AuthenticationDocs() {
    return (
        <div className="prose max-w-none">
            <h1>Authentication</h1>
            <p>All user endpoints require authentication via JWT Bearer token or API key.</p>

            <h2>JWT Bearer Token</h2>
            <p>Use <code>Authorization: Bearer &lt;token&gt;</code> header.</p>

            <h3>Login (POST /api/auth/login)</h3>
            <pre><code>{`curl -X POST http://localhost:5566/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{ "email": "user@example.com", "password": "password" }'`}</code></pre>

            <h4>Success (200)</h4>
            <pre><code>{`{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "role": "USER"
    }
  }
}`}</code></pre>

            <h4>Error (400 - Invalid Credentials)</h4>
            <pre><code>{`{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": ["Invalid email or password"],
    "error": "Bad Request",
    "timestamp": "2025-01-24T10:00:00Z",
    "path": "/api/auth/login",
    "method": "POST"
  }
}`}</code></pre>

            <h3>OAuth Login (Google/GitHub)</h3>
            <p>Redirect to <code>/api/auth/google</code> or <code>/api/auth/github</code>. Callback stores token in localStorage.</p>
            <p>Frontend Example:</p>
            <pre><code>{`const response = await fetch('/api/auth/google', { method: 'POST' });
if (response.ok) window.location.href = '/auth/callback';`}</code></pre>

            <h4>Error (400 - Email Conflict)</h4>
            <pre><code>{`{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": ["Email already exists with different provider. Account linked."],
    "error": "Bad Request",
    "timestamp": "2025-01-24T10:00:00Z",
    "path": "/api/auth/google",
    "method": "POST"
  }
}`}</code></pre>

            <h2>API Keys (For Scriptless Access)</h2>
            <h3>Create Key (POST /api/auth/api-keys) - Requires JWT</h3>
            <pre><code>{`curl -X POST http://localhost:5566/api/auth/api-keys \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "My Script", "expiresAt": "2025-02-24" }'`}</code></pre>

            <h4>Success (201)</h4>
            <pre><code>{`{
  "success": true,
  "data": {
    "apiKey": "ilhrf_abcd1234...",
    "name": "My Script",
    "expiresAt": "2025-02-24T00:00:00Z"
  }
}`}</code></pre>

            <h3>Usage</h3>
            <p>Use <code>x-api-key: &lt;key&gt;</code> header or <code>?api_key=&lt;key&gt;</code> query. Rate Limit: 60/min per key (see Rate Limiting docs).</p>

            <h3>Refresh Token (POST /api/auth/refresh)</h3>
            <p>Body: <code>{`{ "refreshToken": "&lt;token&gt;" }`}</code></p>

            <h4>Error (401 - Expired)</h4>
            <pre><code>{`{
  "success": false,
  "error": {
    "statusCode": 401,
    "message": ["Refresh token expired"],
    "error": "Unauthorized",
    "timestamp": "2025-01-24T10:00:00Z",
    "path": "/api/auth/refresh",
    "method": "POST"
  }
}`}</code></pre>
        </div>
    );
}
