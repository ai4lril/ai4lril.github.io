import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'NLP Translation (Beta) - ILHRF API Docs',
};

export default function NlpTranslationDocs() {
    return (
        <div className="prose max-w-none">
            <h1>NLP Translation (Beta)</h1>
            <p>POST /api/nlp/translate – Translates text between languages. Requires JWT/API key. <strong>Beta:</strong> Uses placeholder until full integration (Hugging Face/Google Cloud).</p>

            <h2>Request Body</h2>
            <pre><code>{`{
  "text": "Hello world",
  "sourceLang": "eng_Latn",
  "targetLang": "hin_Deva"
}`}</code></pre>

            <h3>Success (200)</h3>
            <pre><code>{`{
  "success": true,
  "data": {
    "translatedText": "[hin_Deva] Hello world", // Placeholder
    "confidence": 0.5
  }
}`}</code></pre>

            <h3>Error (503 - Beta Mode)</h3>
            <pre><code>{`{
  "success": false,
  "error": {
    "statusCode": 503,
    "message": ["NLP service unavailable (beta)"],
    "error": "Service Unavailable",
    "timestamp": "2025-01-24T10:00:00Z",
    "path": "/api/nlp/translate",
    "method": "POST"
  }
}`}</code></pre>

            <h2>Example Usage</h2>
            <pre><code>{`const token = localStorage.getItem('token');
const response = await fetch('/api/nlp/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: \`Bearer \${token}\`
  },
  body: JSON.stringify({
    text: 'Hello',
    sourceLang: 'eng_Latn',
    targetLang: 'hin_Deva'
  })
});`}</code></pre>

            <p><strong>Note:</strong> Beta – full integration coming soon. Current responses are placeholders for UI testing.</p>
        </div>
    );
}
