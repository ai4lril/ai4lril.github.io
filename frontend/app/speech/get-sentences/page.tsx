import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Get Speech Sentences - ILHRF API Docs',
};

export default function GetSpeechSentencesDocs() {
    return (
        <div className="prose max-w-none">
            <h1>Get Speech Sentences</h1>
            <p>GET /api/speech-sentences?languageCode=&lt;code&gt; – Fetches sentences for recording (requires JWT/API key).</p>

            <h2>Auth Example</h2>
            <pre><code>{`const token = localStorage.getItem('token');
const response = await fetch('/api/speech-sentences?languageCode=hin_Deva', {
  headers: { Authorization: \`Bearer ${token}\` }
});`}</code></pre>

            <h3>Success (200)</h3>
            <pre><code>{`{
  "success": true,
  "data": [
    { "id": "sent123", "text": "नमस्ते दुनिया", "languageCode": "hin_Deva", "taskType": "speech" }
  ]
}`}</code></pre>

            <h3>Error (404 - No Sentences)</h3>
            <pre><code>{`{
  "success": false,
  "error": {
    "statusCode": 404,
    "message": ["No sentences found for language hin_Deva"],
    "error": "Not Found",
    "timestamp": "2025-01-24T10:00:00Z",
    "path": "/api/speech-sentences",
    "method": "GET"
  }
}`}</code></pre>

            <h2>Rate Limiting</h2>
            <p>60 requests/min per API key. Exceeded → 429 with <code>X-RateLimit-Remaining: 0</code>.</p>

            <h3>Curl Example</h3>
            <pre><code>{`curl -X GET "http://localhost:5566/api/speech-sentences?languageCode=hin_Deva" \\
  -H "Authorization: Bearer <token>"`}</code></pre>
        </div>
    );
}
