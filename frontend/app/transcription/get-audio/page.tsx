import type { Metadata } from 'next';
import DocsPageWrapper from '@/components/docs/DocsPageWrapper';
import CodeBlock from '@/components/docs/CodeBlock';
import CodeTabs from '@/components/docs/CodeTabs';
import ErrorResponses from '@/components/docs/ErrorResponses';

export const metadata: Metadata = {
    title: 'Get Audio for Transcription - API Documentation',
    description: 'Get audio recordings for transcription',
};

export default function GetAudioPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <DocsPageWrapper
                method="GET"
                requiresAuth={false}
                breadcrumbs={[
                    { label: 'Docs', href: '/docs' },
                    { label: 'Transcription', href: '/docs/transcription/get-audio' },
                    { label: 'Get Audio' },
                ]}
                next={{ title: 'Submit Transcription', href: '/docs/transcription/submit' }}
            >
                <h1>Get Audio for Transcription</h1>
                <p className="text-lg text-slate-600">
                    Retrieve audio recordings that need transcription. Audio is filtered to avoid duplicates for the authenticated user.
                </p>

                <h2>Endpoint</h2>
                <CodeBlock language="http">GET /api/transcription/audio</CodeBlock>

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

                <h2>Request Example</h2>
                <CodeTabs
                    examples={[
                        {
                            language: 'bash',
                            label: 'cURL',
                            code: `curl -X GET "https://api.ilhrf.org/api/transcription/audio?languageCode=hin_Deva" \\
  -H "x-api-key: your-api-key-here"`,
                        },
                        {
                            language: 'javascript',
                            label: 'JavaScript',
                            code: `const API_BASE_URL = 'https://api.ilhrf.org/api';
const response = await fetch(\`\${API_BASE_URL}/transcription/audio?languageCode=hin_Deva\`, {
  headers: {
    'x-api-key': 'your-api-key-here'
  }
});
const audio = await response.json();`,
                        },
                        {
                            language: 'python',
                            label: 'Python',
                            code: `import requests

API_BASE_URL = 'https://api.ilhrf.org/api'
response = requests.get(
    f'\${API_BASE_URL}/transcription/audio',
    params={'languageCode': 'hin_Deva'},
    headers={'x-api-key': 'your-api-key-here'}
)
audio = response.json()`,
                        },
                    ]}
                />

                <h2>Response</h2>
                <p>Returns an audio recording object:</p>
                <CodeBlock language="json">{`{
  "id": "recording-id",
  "audioUrl": "https://storage.example.com/audio/recording-id.wav",
  "audioFormat": "wav",
  "duration": 3.5,
  "createdAt": "2024-01-15T10:30:00Z"
}`}</CodeBlock>

                <h2>Notes</h2>
                <ul>
                    <li>If authenticated, recordings you&apos;ve already transcribed are excluded</li>
                    <li>The audio URL is a presigned URL that expires after a set time</li>
                    <li>After transcription, the audio becomes available for review</li>
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
