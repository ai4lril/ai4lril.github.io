import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Speech Recording - ILHRF API Docs',
};

export default function SubmitSpeechRecordingDocs() {
  return (
    <div className="prose max-w-none">
      <h1>Submit Speech Recording</h1>
      <p>POST /api/speech-recording – Upload audio for sentence validation. Multipart form: audioFile (required, max 10MB), sentenceId, duration. Requires JWT/API key.</p>

      <h2>Example</h2>
      <pre><code>{`const formData = new FormData();
formData.append('audioFile', audioBlob);
formData.append('sentenceId', 'sent123');
formData.append('duration', '5.2'); // From Web Audio API

const response = await fetch('/api/speech-recording', {
  method: 'POST',
  headers: { Authorization: \`Bearer \${token}\` },
  body: formData
});`}</code></pre>

      <h3>Success (201)</h3>
      <pre><code>{`{
  "success": true,
  "data": {
    "recordingId": "rec456",
    "message": "Recording submitted successfully"
  }
}`}</code></pre>

      <h3>Error (413 - File Too Large)</h3>
      <pre><code>{`{
  "success": false,
  "error": {
    "statusCode": 413,
    "message": ["File too large (max 10MB)"],
    "error": "Payload Too Large",
    "timestamp": "2025-01-24T10:00:00Z",
    "path": "/api/speech-recording",
    "method": "POST"
  }
}`}</code></pre>

      <h3>Error (400 - Invalid Sentence ID)</h3>
      <pre><code>{`{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": ["Invalid sentence ID"],
    "error": "Bad Request",
    "timestamp": "2025-01-24T10:00:00Z",
    "path": "/api/speech-recording",
    "method": "POST"
  }
}`}</code></pre>

      <h2>Validation Notes</h2>
      <ul>
        <li>Max file size: 10MB (enforced client/server).</li>
        <li>Supported formats: WebM, WAV, MP3, OGG.</li>
        <li>Duration: Auto-calculated (min 0.5s, max 60s validated client-side).</li>
      </ul>

      <h2>Curl Example (Multipart)</h2>
      <pre><code>{`curl -X POST http://localhost:5566/api/speech-recording \\
  -H "Authorization: Bearer <token>" \\
  -F "audioFile=@recording.webm" \\
  -F "sentenceId=sent123" \\
  -F "duration=5.2"`}</code></pre>
    </div>
  );
}
