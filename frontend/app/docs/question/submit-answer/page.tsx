import type { Metadata } from 'next';
import DocsPageWrapper from '@/components/docs/DocsPageWrapper';
import CodeBlock from '@/components/docs/CodeBlock';
import CodeTabs from '@/components/docs/CodeTabs';
import ErrorResponses from '@/components/docs/ErrorResponses';

export const metadata: Metadata = {
    title: 'Submit Answer - API Documentation',
    description: 'Submit an audio answer to a question',
};

export default function SubmitAnswerPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <DocsPageWrapper
                method="POST"
                requiresAuth={true}
                breadcrumbs={[
                    { label: 'Docs', href: '/docs' },
                    { label: 'Spontaneous Speech', href: '/docs/question/submit-question' },
                    { label: 'Submit Answer' },
                ]}
                previous={{ title: 'Get Questions', href: '/docs/question/get-questions' }}
            >
                <h1>Submit Answer</h1>
                <p className="text-lg text-slate-600">
                    Submit an audio recording answering a validated question. Audio files must be base64-encoded.
                </p>

                <h2>Endpoint</h2>
                <CodeBlock language="http">POST /api/question/answer-recording</CodeBlock>

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
                                <td className="px-4 py-2 border-b"><code>questionSubmissionId</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">Yes</td>
                                <td className="px-4 py-2 border-b">ID of the question being answered</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>audioFile</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">Yes</td>
                                <td className="px-4 py-2 border-b">Base64-encoded audio file</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>audioFormat</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">Yes</td>
                                <td className="px-4 py-2 border-b">Audio format (e.g., &quot;wav&quot;, &quot;mp3&quot;, &quot;ogg&quot;)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>duration</code></td>
                                <td className="px-4 py-2 border-b">number</td>
                                <td className="px-4 py-2 border-b">No</td>
                                <td className="px-4 py-2 border-b">Duration of the audio in seconds</td>
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
                            code: `curl -X POST "https://api.ilhrf.org/api/question/answer-recording" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your-api-key-here" \\
  -d '{
    "questionSubmissionId": "question-submission-id",
    "audioFile": "UklGRiQAAABXQVZFZm10...",
    "audioFormat": "wav",
    "duration": 5.2
  }'`,
                        },
                        {
                            language: 'javascript',
                            label: 'JavaScript',
                            code: `const API_BASE_URL = 'https://api.ilhrf.org/api';
const audioFile = await fileToBase64(audioBlob);

const response = await fetch(\`\${API_BASE_URL}/question/answer-recording\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key-here'
  },
  body: JSON.stringify({
    questionSubmissionId: 'question-submission-id',
    audioFile: audioFile,
    audioFormat: 'wav',
    duration: 5.2
  })
});
const result = await response.json();`,
                        },
                        {
                            language: 'python',
                            label: 'Python',
                            code: `import requests
import base64

API_BASE_URL = 'https://api.ilhrf.org/api'

with open('answer.wav', 'rb') as f:
    audio_data = base64.b64encode(f.read()).decode('utf-8')

response = requests.post(
    f'\${API_BASE_URL}/question/answer-recording',
    headers={'x-api-key': 'your-api-key-here'},
    json={
        'questionSubmissionId': 'question-submission-id',
        'audioFile': audio_data,
        'audioFormat': 'wav',
        'duration': 5.2
    }
)
result = response.json()`,
                        },
                    ]}
                />

                <h2>Response</h2>
                <CodeBlock language="json">{`{
  "id": "answer-recording-id",
  "answerId": "answer-recording-id",
  "questionSubmissionId": "question-submission-id",
  "userId": "user-id",
  "audioUrl": "https://storage.example.com/audio/answer-recording-id.wav",
  "audioFormat": "wav",
  "duration": 5.2,
  "createdAt": "2024-01-15T10:30:00Z"
}`}</CodeBlock>

                <h2>Notes</h2>
                <ul>
                    <li>Audio files must be base64-encoded</li>
                    <li>Supported audio formats include WAV, MP3, OGG, and others</li>
                    <li>The answer is automatically associated with your user account</li>
                    <li>Each question can only be answered once per user</li>
                    <li>Only validated questions can be answered</li>
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
