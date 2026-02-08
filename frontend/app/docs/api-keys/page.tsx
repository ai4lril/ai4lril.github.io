import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'API Keys - API Documentation',
    description: 'Learn how to create, manage, and use API keys for the ILHRF API',
};

export default function ApiKeysPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <h1>API Keys</h1>
            <p className="text-lg text-slate-600">
                API keys provide secure, programmatic access to the ILHRF API without requiring user credentials.
            </p>

            <h2>Creating an API Key</h2>
            <p>
                To create an API key, you must be logged in. Then make a POST request to the API keys endpoint:
            </p>

            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 my-4 overflow-x-auto">
                <pre className="text-sm"><code>{`POST /api/auth/api-keys
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "My API Key",
  "expiresAt": "2025-12-31T23:59:59Z"  // Optional
}

Response:
{
  "id": "key-id",
  "apiKey": "ilhrf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "name": "My API Key",
  "expiresAt": "2025-12-31T23:59:59Z"
}`}</code></pre>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
                <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> The API key is only shown once when created. Make sure to copy and store it securely.
                    If you lose your API key, you&apos;ll need to revoke it and create a new one.
                </p>
            </div>

            <h2>Listing Your API Keys</h2>
            <p>Retrieve a list of all your API keys:</p>

            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 my-4 overflow-x-auto">
                <pre className="text-sm"><code>{`GET /api/auth/api-keys
Authorization: Bearer <your-jwt-token>

Response:
[
  {
    "id": "key-id-1",
    "name": "My API Key",
    "lastUsedAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2025-12-31T23:59:59Z",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "key-id-2",
    "name": "Development Key",
    "lastUsedAt": null,
    "expiresAt": null,
    "isActive": true,
    "createdAt": "2024-01-10T00:00:00Z",
    "updatedAt": "2024-01-10T00:00:00Z"
  }
]`}</code></pre>
            </div>

            <h2>Updating an API Key</h2>
            <p>Update the name or expiration date of an API key:</p>

            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 my-4 overflow-x-auto">
                <pre className="text-sm"><code>{`PUT /api/auth/api-keys/:id
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "expiresAt": "2026-12-31T23:59:59Z"  // Optional
}

Response:
{
  "id": "key-id",
  "name": "Updated Name",
  "lastUsedAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2026-12-31T23:59:59Z",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}`}</code></pre>
            </div>

            <h2>Revoking an API Key</h2>
            <p>Revoke (deactivate) an API key:</p>

            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 my-4 overflow-x-auto">
                <pre className="text-sm"><code>{`DELETE /api/auth/api-keys/:id
Authorization: Bearer <your-jwt-token>

Response:
{
  "success": true,
  "message": "API key revoked successfully"
}`}</code></pre>
            </div>

            <h2>Using API Keys</h2>
            <p>
                Once you have an API key, include it in your requests using the <code>x-api-key</code> header:
            </p>

            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 my-4 overflow-x-auto">
                <pre className="text-sm"><code>{`curl -X GET "https://api.example.com/api/speech/sentences?languageCode=en" \\
  -H "x-api-key: ilhrf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`}</code></pre>
            </div>

            <p>Or as a query parameter:</p>

            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 my-4 overflow-x-auto">
                <pre className="text-sm"><code>{`curl -X GET "https://api.example.com/api/speech/sentences?languageCode=en&api_key=ilhrf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`}</code></pre>
            </div>

            <h2>API Key Expiration</h2>
            <p>
                API keys can have an optional expiration date. If an expiration date is set, the key will automatically
                become invalid after that date. Keys without an expiration date remain valid until manually revoked.
            </p>

            <h2>Security Best Practices</h2>
            <ul>
                <li><strong>Store securely:</strong> Never commit API keys to version control or expose them in client-side code</li>
                <li><strong>Use environment variables:</strong> Store API keys in environment variables or secure secret management systems</li>
                <li><strong>Rotate regularly:</strong> Create new keys periodically and revoke old ones</li>
                <li><strong>Use descriptive names:</strong> Name your keys descriptively (e.g., &quot;Production Server&quot;, &quot;Development&quot;)</li>
                <li><strong>Set expiration dates:</strong> Set expiration dates for keys used in temporary or testing environments</li>
                <li><strong>Revoke compromised keys:</strong> Immediately revoke any keys that may have been compromised</li>
            </ul>

            <h2>Error Responses</h2>
            <p>If you try to use a revoked or expired API key:</p>

            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 my-4 overflow-x-auto">
                <pre className="text-sm"><code>{`{
  "statusCode": 401,
  "message": "Invalid or expired API key",
  "error": "Unauthorized"
}`}</code></pre>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Use API Keys?</h3>
                <p className="text-blue-800 text-sm mb-2">
                    Now that you know how to manage API keys, explore the{' '}
                    <Link href="/docs/speech/get-sentences" className="text-blue-600 hover:text-blue-700 underline">
                        API endpoints
                    </Link>{' '}
                    to start making requests.
                </p>
            </div>
        </div>
    );
}
