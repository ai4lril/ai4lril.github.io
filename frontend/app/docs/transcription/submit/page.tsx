import type { Metadata } from 'next';
import DocsPageWrapper from '@/components/docs/DocsPageWrapper';
import CodeBlock from '@/components/docs/CodeBlock';
import CodeTabs from '@/components/docs/CodeTabs';
import ErrorResponses from '@/components/docs/ErrorResponses';

export const metadata: Metadata = {
    title: 'Submit Transcription - API Documentation',
    description: 'Submit a transcription for an audio recording',
};

export default function SubmitTranscriptionPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <DocsPageWrapper
                method="POST"
                requiresAuth={true}
                breadcrumbs={[
                    { label: 'Docs', href: '/docs' },
                    { label: 'Transcription', href: '/docs/transcription/get-audio' },
                    { label: 'Submit Transcription' },
                ]}
                previous={{ title: 'Get Audio', href: '/docs/transcription/get-audio' }}
                next={{ title: 'Review Transcription', href: '/docs/transcription/review' }}
            >
                <h1>Submit Transcription</h1>
                <p className="text-lg text-slate-600">
                    Submit a text transcription for an audio recording.
                </p>

                <h2>Endpoint</h2>
                <CodeBlock language="http">POST /api/transcription/submission</CodeBlock>

                <h2>Request Body</h2>
                <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left border-b">Field</th>
                                <th className="px-4 py-2 text-left border-b">Type</th>
                                <th className="px-4 py-2 text-left border-b">Required</th>
                                <th className="px-4 py-2 text-left border-b">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>speechRecordingId</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">Yes</td>
                                <td className="px-4 py-2 border-b">ID of the speech recording being transcribed</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>transcriptionText</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">Yes</td>
                                <td className="px-4 py-2 border-b">The transcribed text</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2>Request Example</h2>
                <CodeTabs
                    examples={[
                        {
                            language: 'bash',
                            label: 'cURL',
                            code: `curl -X POST "https://api.ilhrf.org/api/transcription/submission" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your-api-key-here" \\
  -d '{
    "speechRecordingId": "recording-id",
    "transcriptionText": "Hello, how are you?"
  }'`,
                        },
                        {
                            language: 'javascript',
                            label: 'JavaScript',
                            code: `const API_BASE_URL = 'https://api.ilhrf.org/api';
const response = await fetch(\`\${API_BASE_URL}/transcription/submission\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key-here'
  },
  body: JSON.stringify({
    speechRecordingId: 'recording-id',
    transcriptionText: 'Hello, how are you?'
  })
});
const result = await response.json();`,
                        },
                        {
                            language: 'python',
                            label: 'Python',
                            code: `import requests

API_BASE_URL = 'https://api.ilhrf.org/api'
response = requests.post(
    f'\${API_BASE_URL}/transcription/submission',
    headers={'x-api-key': 'your-api-key-here'},
    json={
        'speechRecordingId': 'recording-id',
        'transcriptionText': 'Hello, how are you?'
    }
)
result = response.json()`,
                        },
                    ]}
                />

                <h2>Response</h2>
                <CodeBlock language="json">{`{
  "id": "transcription-id",
  "speechRecordingId": "recording-id",
  "userId": "user-id",
  "transcriptionText": "Hello, how are you?",
  "createdAt": "2024-01-15T10:30:00Z"
}`}</CodeBlock>

                <h2>Notes</h2>
                <ul>
                    <li>The transcription is automatically associated with your user account</li>
                    <li>After submission, the transcription becomes available for review</li>
                    <li>Each recording can only be transcribed once per user</li>
                </ul>

                <ErrorResponses />
                <div className="mt-2 text-xs text-slate-500">
                    <p>
                        <strong>Note:</strong> Replace <code>https://api.ilhrf.org/api</code> with{' '}
                        <code>http://localhost:5566/api</code> for local development.
                    </p>
                </div>
            </DocsPageWrapper>
        </div>
    );
}
