import type { Metadata } from 'next';
import DocsPageWrapper from '@/components/docs/DocsPageWrapper';
import CodeBlock from '@/components/docs/CodeBlock';
import CodeTabs from '@/components/docs/CodeTabs';
import ErrorResponses from '@/components/docs/ErrorResponses';

export const metadata: Metadata = {
    title: 'Submit Question - API Documentation',
    description: 'Submit a new question for validation',
};

export default function SubmitQuestionPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <DocsPageWrapper
                method="POST"
                requiresAuth={true}
                breadcrumbs={[
                    { label: 'Docs', href: '/docs' },
                    { label: 'Spontaneous Speech', href: '/docs/question/submit-question' },
                    { label: 'Submit Question' },
                ]}
                next={{ title: 'Get Questions', href: '/docs/question/get-questions' }}
            >
                <h1>Submit Question</h1>
                <p className="text-lg text-slate-600">
                    Submit a new question for validation. Questions are used in spontaneous speech collection.
                </p>

                <h2>Endpoint</h2>
                <CodeBlock language="http">POST /api/question/submission</CodeBlock>

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
                                <td className="px-4 py-2 border-b"><code>questionText</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">Yes</td>
                                <td className="px-4 py-2 border-b">The question text</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>languageCode</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">Yes</td>
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
                            code: `curl -X POST "https://api.ilhrf.org/api/question/submission" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your-api-key-here" \\
  -d '{
    "questionText": "What is your favorite hobby?",
    "languageCode": "hin_Deva"
  }'`,
                        },
                        {
                            language: 'javascript',
                            label: 'JavaScript',
                            code: `const API_BASE_URL = 'https://api.ilhrf.org/api';
const response = await fetch(\`\${API_BASE_URL}/question/submission\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key-here'
  },
  body: JSON.stringify({
    questionText: 'What is your favorite hobby?',
    languageCode: 'hin_Deva'
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
    f'\${API_BASE_URL}/question/submission',
    headers={'x-api-key': 'your-api-key-here'},
    json={
        'questionText': 'What is your favorite hobby?',
        'languageCode': 'hin_Deva'
    }
)
result = response.json()`,
                        },
                    ]}
                />

                <h2>Response</h2>
                <CodeBlock language="json">{`{
  "id": "question-submission-id",
  "submissionId": "question-submission-id",
  "questionText": "What is your favorite hobby?",
  "languageCode": "en",
  "userId": "user-id",
  "createdAt": "2024-01-15T10:30:00Z"
}`}</CodeBlock>

                <h2>Notes</h2>
                <ul>
                    <li>Questions require admin validation before being available for answers</li>
                    <li>The submission is automatically associated with your user account</li>
                    <li>Once validated, questions can be answered by other users</li>
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
