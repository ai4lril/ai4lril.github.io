import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Sentences - ILHRF API Docs',
};

export default function SubmitSentencesDocs() {
  return (
    <div className="prose max-w-none">
      <h1>Submit Sentences</h1>
      <p>POST /api/write-submission – Submit text sentences for validation. Body: {'{ sentencesText, languageCode, citation? }'}. Requires JWT/API key.</p>

      <h2>Example</h2>
      <pre><code>{`const response = await fetch('/api/write-submission', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: \`Bearer \${token}\`
  },
  body: JSON.stringify({
    sentencesText: 'Hello world sentence.',
    languageCode: 'eng_Latn',
    citation: 'Book title, page 42'
  })
});`}</code></pre>

      <h3>Success (201)</h3>
      <pre><code>{`{
  "success": true,
  "data": {
    "submissionId": "sub789",
    "message": "Sentences submitted successfully for review"
  }
}`}</code></pre>

      <h3>Error (413 - Text Too Long)</h3>
      <pre><code>{`{
  "success": false,
  "error": {
    "statusCode": 413,
    "message": ["Submitted text exceeds maximum length (5000 characters)"],
    "error": "Payload Too Large",
    "timestamp": "2025-01-24T10:00:00Z",
    "path": "/api/write-submission",
    "method": "POST"
  }
}`}</code></pre>

      <h3>Error (400)</h3>
      <pre><code>{`{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": ["Language code is required"],
    "error": "Bad Request",
    "timestamp": "2025-01-24T10:00:00Z",
    "path": "/api/write-submission",
    "method": "POST"
  }
}`}</code></pre>

      <h2>Notes</h2>
      <ul>
        <li>Citation optional but recommended for sourced text.</li>
        <li>Multiple sentences supported (split by periods).</li>
        <li>Rate Limit: 60/min per key.</li>
      </ul>
    </div>
  );
}
