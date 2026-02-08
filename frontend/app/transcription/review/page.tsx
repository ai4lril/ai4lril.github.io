import type { Metadata } from 'next';
import DocsPageWrapper from '@/components/docs/DocsPageWrapper';
import CodeBlock from '@/components/docs/CodeBlock';
import CodeTabs from '@/components/docs/CodeTabs';
import ErrorResponses from '@/components/docs/ErrorResponses';

export const metadata: Metadata = {
    title: 'Review Transcription - API Documentation',
    description: 'Review transcriptions submitted by other users',
};

export default function ReviewTranscriptionPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <DocsPageWrapper
                method="GET"
                requiresAuth={false}
                breadcrumbs={[
                    { label: 'Docs', href: '/docs' },
                    { label: 'Transcription', href: '/docs/transcription/get-audio' },
                    { label: 'Review Transcription' },
                ]}
                previous={{ title: 'Submit Transcription', href: '/docs/transcription/submit' }}
            >
                <h1>Review Transcription</h1>
                <p className="text-lg text-slate-600">
                    Get transcriptions for review and submit your approval or rejection.
                </p>

                <h2>Get Transcriptions for Review</h2>
                <h3>Endpoint</h3>
                <CodeBlock language="http">GET /api/transcription/review</CodeBlock>

                <h3>Query Parameters</h3>
                <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left border-b">Parameter</th>
                                <th className="px-4 py-2 text-left border-b">Type</th>
                                <th className="px-4 py-2 text-left border-b">Required</th>
                                <th className="px-4 py-2 text-left border-b">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>languageCode</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">No</td>
                                <td className="px-4 py-2 border-b">Language code with script (e.g., &quot;eng_Latn&quot;, &quot;hin_Deva&quot;, &quot;kok_Deva&quot;, &quot;kok_Latn&quot;, &quot;kok_Mlym&quot;)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3>Response</h3>
                <CodeBlock language="json">{`[
  {
    "id": "transcription-review-id",
    "transcription": {
      "id": "transcription-id",
      "transcriptionText": "Hello, how are you?",
      "speechRecordingId": "recording-id"
    },
    "audioUrl": "https://storage.example.com/audio/recording-id.wav"
  }
]`}</CodeBlock>

                <h2>Submit Review</h2>
                <h3>Endpoint</h3>
                <CodeBlock language="http">POST /api/transcription/review-submission</CodeBlock>

                <h3>Request Body</h3>
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
                                <td className="px-4 py-2 border-b"><code>transcriptionReviewId</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">Yes</td>
                                <td className="px-4 py-2 border-b">ID of the transcription review</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>isApproved</code></td>
                                <td className="px-4 py-2 border-b">boolean</td>
                                <td className="px-4 py-2 border-b">Yes</td>
                                <td className="px-4 py-2 border-b">Whether the transcription is approved (true) or rejected (false)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3>Request Example</h3>
                <CodeTabs
                    examples={[
                        {
                            language: 'bash',
                            label: 'cURL',
                            code: `curl -X POST "https://api.ilhrf.org/api/transcription/review-submission" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your-api-key-here" \\
  -d '{
    "transcriptionReviewId": "transcription-review-id",
    "isApproved": true
  }'`,
                        },
                        {
                            language: 'javascript',
                            label: 'JavaScript',
                            code: `const API_BASE_URL = 'https://api.ilhrf.org/api';
const response = await fetch(\`\${API_BASE_URL}/transcription/review-submission\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key-here'
  },
  body: JSON.stringify({
    transcriptionReviewId: 'transcription-review-id',
    isApproved: true
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
    f'\${API_BASE_URL}/transcription/review-submission',
    headers={'x-api-key': 'your-api-key-here'},
    json={
        'transcriptionReviewId': 'transcription-review-id',
        'isApproved': True
    }
)
result = response.json()`,
                        },
                    ]}
                />

                <h3>Response</h3>
                <CodeBlock language="json">{`{
  "id": "review-id",
  "transcriptionReviewId": "transcription-review-id",
  "userId": "user-id",
  "isApproved": true,
  "createdAt": "2024-01-15T10:30:00Z"
}`}</CodeBlock>

                <h2>Notes</h2>
                <ul>
                    <li>After review, approved transcriptions become available for validation (Listen feature)</li>
                    <li>The review itself counts as a validation</li>
                    <li>Each transcription can only be reviewed once per user</li>
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
