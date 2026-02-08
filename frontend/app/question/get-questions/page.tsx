import type { Metadata } from 'next';
import DocsPageWrapper from '@/components/docs/DocsPageWrapper';
import CodeBlock from '@/components/docs/CodeBlock';
import CodeTabs from '@/components/docs/CodeTabs';
import ErrorResponses from '@/components/docs/ErrorResponses';

export const metadata: Metadata = {
    title: 'Get Questions - API Documentation',
    description: 'Get validated questions for answering',
};

export default function GetQuestionsPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <DocsPageWrapper
                method="GET"
                requiresAuth={false}
                breadcrumbs={[
                    { label: 'Docs', href: '/docs' },
                    { label: 'Spontaneous Speech', href: '/docs/question/submit-question' },
                    { label: 'Get Questions' },
                ]}
                previous={{ title: 'Submit Question', href: '/docs/question/submit-question' }}
                next={{ title: 'Submit Answer', href: '/docs/question/submit-answer' }}
            >
                <h1>Get Questions</h1>
                <p className="text-lg text-slate-600">
                    Retrieve validated questions available for answering. Questions are filtered to avoid duplicates for the authenticated user.
                </p>

                <h2>Endpoint</h2>
                <CodeBlock language="http">GET /api/question/sentences</CodeBlock>

                <h2>Query Parameters</h2>
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
                            code: `curl -X GET "https://api.ilhrf.org/api/question/sentences?languageCode=hin_Deva" \\
  -H "x-api-key: your-api-key-here"`,
                        },
                        {
                            language: 'javascript',
                            label: 'JavaScript',
                            code: `const API_BASE_URL = 'https://api.ilhrf.org/api';
const response = await fetch(\`\${API_BASE_URL}/question/sentences?languageCode=hin_Deva\`, {
  headers: {
    'x-api-key': 'your-api-key-here'
  }
});
const questions = await response.json();`,
                        },
                        {
                            language: 'python',
                            label: 'Python',
                            code: `import requests

API_BASE_URL = 'https://api.ilhrf.org/api'
response = requests.get(
    f'\${API_BASE_URL}/question/sentences',
    params={'languageCode': 'hin_Deva'},
    headers={'x-api-key': 'your-api-key-here'}
)
questions = response.json()`,
                        },
                    ]}
                />

                <h2>Response</h2>
                <p>Returns an array of question objects:</p>
                <CodeBlock language="json">{`[
  {
    "id": "question-id-1",
    "questionText": "What is your favorite hobby?",
    "languageCode": "hin_Deva",
    "valid": true
  },
  {
    "id": "question-id-2",
    "questionText": "Where did you grow up?",
    "languageCode": "hin_Deva",
    "valid": true
  }
]`}</CodeBlock>

                <h2>Notes</h2>
                <ul>
                    <li>Only questions with <code>valid: true</code> are returned</li>
                    <li>If authenticated, questions you&apos;ve already answered are excluded</li>
                    <li>If no language code is provided, questions from all languages may be returned</li>
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
