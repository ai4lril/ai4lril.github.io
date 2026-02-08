import type { Metadata } from 'next';
import DocsPageWrapper from '@/components/docs/DocsPageWrapper';
import CodeBlock from '@/components/docs/CodeBlock';
import CodeTabs from '@/components/docs/CodeTabs';
import ErrorResponses from '@/components/docs/ErrorResponses';

export const metadata: Metadata = {
    title: 'POS Annotation - API Documentation',
    description: 'Submit Part-of-Speech annotations',
};

export default function PosAnnotationPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <DocsPageWrapper
                method="POST"
                requiresAuth={true}
                breadcrumbs={[
                    { label: 'Docs', href: '/docs' },
                    { label: 'NLP', href: '/docs/nlp/ner-sentences' },
                    { label: 'POS Annotation' },
                ]}
                previous={{ title: 'POS Sentences', href: '/docs/nlp/pos-sentences' }}
                next={{ title: 'Translation', href: '/docs/nlp/translation' }}
            >
                <h1>Submit POS Annotation</h1>
                <p className="text-lg text-slate-600">
                    Submit Part-of-Speech (POS) annotations for a sentence.
                </p>

                <h2>Endpoint</h2>
                <CodeBlock language="http">POST /api/pos-annotation</CodeBlock>

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
                                <td className="px-4 py-2 border-b"><code>sentenceId</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">Yes</td>
                                <td className="px-4 py-2 border-b">ID of the sentence being annotated</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>annotations</code></td>
                                <td className="px-4 py-2 border-b">array</td>
                                <td className="px-4 py-2 border-b">No</td>
                                <td className="px-4 py-2 border-b">Array of POS annotations (alternative to tags)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>tags</code></td>
                                <td className="px-4 py-2 border-b">array</td>
                                <td className="px-4 py-2 border-b">No</td>
                                <td className="px-4 py-2 border-b">Array of POS tags (alternative to annotations)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>languageCode</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">No</td>
                                <td className="px-4 py-2 border-b">Language code with script (e.g., &quot;hin_Deva&quot;, &quot;kok_Deva&quot;, &quot;kok_Latn&quot;)</td>
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
                            code: `curl -X POST "https://api.ilhrf.org/api/pos-annotation" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your-api-key-here" \\
  -d '{
    "sentenceId": "sentence-id-1",
    "tags": ["DT", "NN", "VBD", "IN", "DT", "NN", "."],
    "languageCode": "hin_Deva"
  }'`,
                        },
                        {
                            language: 'javascript',
                            label: 'JavaScript',
                            code: `const API_BASE_URL = 'https://api.ilhrf.org/api';
const response = await fetch(\`\${API_BASE_URL}/pos-annotation\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key-here'
  },
  body: JSON.stringify({
    sentenceId: 'sentence-id-1',
    tags: ['DT', 'NN', 'VBD', 'IN', 'DT', 'NN', '.'],
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
    f'\${API_BASE_URL}/pos-annotation',
    headers={'x-api-key': 'your-api-key-here'},
    json={
        'sentenceId': 'sentence-id-1',
        'tags': ['DT', 'NN', 'VBD', 'IN', 'DT', 'NN', '.'],
        'languageCode': 'hin_Deva'
    }
)
result = response.json()`,
                        },
                    ]}
                />

                <h2>Response</h2>
                <CodeBlock language="json">{`{
  "id": "annotation-id",
  "sentenceId": "sentence-id-1",
  "userId": "user-id",
  "tags": ["DT", "NN", "VBD", "IN", "DT", "NN", "."],
  "createdAt": "2024-01-15T10:30:00Z"
}`}</CodeBlock>

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
