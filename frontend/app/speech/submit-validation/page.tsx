import type { Metadata } from 'next';
import DocsPageWrapper from '@/components/docs/DocsPageWrapper';
import CodeBlock from '@/components/docs/CodeBlock';
import CodeTabs from '@/components/docs/CodeTabs';
import ErrorResponses from '@/components/docs/ErrorResponses';

export const metadata: Metadata = {
    title: 'Submit Validation - API Documentation',
    description: 'Submit validation for an audio recording',
};

export default function SubmitValidationPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <DocsPageWrapper
                method="POST"
                requiresAuth={true}
                breadcrumbs={[
                    { label: 'Docs', href: '/docs' },
                    { label: 'Scripted Speech', href: '/docs/speech/get-sentences' },
                    { label: 'Submit Validation' },
                ]}
                previous={{ title: 'Listen Audio', href: '/docs/speech/listen-audio' }}
            >
                <h1>Submit Validation</h1>
                <p className="text-lg text-slate-600">
                    Submit your validation (match or mismatch) for an audio recording compared to its text.
                </p>

                <h2>Endpoint</h2>
                <CodeBlock language="http">POST /api/speech/listen-validation</CodeBlock>

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
                                <td className="px-4 py-2 border-b">ID of the speech recording being validated</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>isValid</code></td>
                                <td className="px-4 py-2 border-b">boolean</td>
                                <td className="px-4 py-2 border-b">Yes</td>
                                <td className="px-4 py-2 border-b">Whether the audio matches the text (true) or not (false)</td>
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
                            code: `curl -X POST "https://api.ilhrf.org/api/speech/listen-validation" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your-api-key-here" \\
  -d '{
    "speechRecordingId": "recording-id",
    "isValid": true
  }'`,
                        },
                        {
                            language: 'javascript',
                            label: 'JavaScript',
                            code: `const API_BASE_URL = 'https://api.ilhrf.org/api';
const response = await fetch(\`\${API_BASE_URL}/speech/listen-validation\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key-here'
  },
  body: JSON.stringify({
    speechRecordingId: 'recording-id',
    isValid: true
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
    f'\${API_BASE_URL}/speech/listen-validation',
    headers={'x-api-key': 'your-api-key-here'},
    json={
        'speechRecordingId': 'recording-id',
        'isValid': True
    }
)
result = response.json()`,
                        },
                    ]}
                />

                <h2>Response</h2>
                <CodeBlock language="json">{`{
  "id": "validation-id",
  "speechRecordingId": "recording-id",
  "userId": "user-id",
  "isValid": true,
  "createdAt": "2024-01-15T10:30:00Z"
}`}</CodeBlock>

                <ErrorResponses />
                <div className="mt-2 text-xs text-slate-500">
                    <p>
                        <strong>Note:</strong> Replace <code>https://api.ilhrf.org/api</code> with{' '}
                        <code>http://localhost:5566/api</code> for local development.
                    </p>
                </div>

                <h2>Notes</h2>
                <ul>
                    <li>Maximum 25 validations per user</li>
                    <li>Each recording can only be validated once per user</li>
                    <li>Validations are used to determine dataset quality</li>
                </ul>

            </DocsPageWrapper>
        </div>
    );
}
