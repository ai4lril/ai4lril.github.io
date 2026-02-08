import type { Metadata } from 'next';
import DocsPageWrapper from '@/components/docs/DocsPageWrapper';
import CodeBlock from '@/components/docs/CodeBlock';
import CodeTabs from '@/components/docs/CodeTabs';
import ErrorResponses from '@/components/docs/ErrorResponses';

export const metadata: Metadata = {
    title: 'Emotion Recognition - API Documentation',
    description: 'Submit emotion annotations for sentences',
};

export default function EmotionPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <DocsPageWrapper
                method="POST"
                requiresAuth={true}
                breadcrumbs={[
                    { label: 'Docs', href: '/docs' },
                    { label: 'NLP', href: '/docs/nlp/ner-sentences' },
                    { label: 'Emotion Recognition' },
                ]}
                previous={{ title: 'Sentiment Analysis', href: '/docs/nlp/sentiment' }}
            >
                <h1>Emotion Recognition</h1>
                <p className="text-lg text-slate-600">
                    Submit emotion annotations for sentences. Emotions are categorized into positive, negative, neutral, and mixed.
                </p>

                <h2>Endpoint</h2>
                <CodeBlock language="http">POST /api/emotion-annotation</CodeBlock>

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
                                <td className="px-4 py-2 border-b"><code>emotion</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">Yes</td>
                                <td className="px-4 py-2 border-b">Emotion label (e.g., &quot;joy&quot;, &quot;sadness&quot;, &quot;anger&quot;, &quot;fear&quot;, &quot;surprise&quot;, &quot;neutral&quot;, &quot;mixed&quot;)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>confidence</code></td>
                                <td className="px-4 py-2 border-b">number</td>
                                <td className="px-4 py-2 border-b">No</td>
                                <td className="px-4 py-2 border-b">Confidence score (0.0 to 1.0, default: 0.5)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>languageCode</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">No</td>
                                <td className="px-4 py-2 border-b">Language code with script (e.g., &quot;hin_Deva&quot;, &quot;kok_Deva&quot;, &quot;kok_Latn&quot;)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"><code>text</code></td>
                                <td className="px-4 py-2 border-b">string</td>
                                <td className="px-4 py-2 border-b">No</td>
                                <td className="px-4 py-2 border-b">The sentence text (optional, can be retrieved from sentenceId)</td>
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
                            code: `curl -X POST "https://api.ilhrf.org/api/emotion-annotation" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your-api-key-here" \\
  -d '{
    "sentenceId": "sentence-id-1",
    "emotion": "joy",
    "confidence": 0.9,
    "languageCode": "hin_Deva"
  }'`,
                        },
                        {
                            language: 'javascript',
                            label: 'JavaScript',
                            code: `const API_BASE_URL = 'https://api.ilhrf.org/api';
const response = await fetch(\`\${API_BASE_URL}/emotion-annotation\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key-here'
  },
  body: JSON.stringify({
    sentenceId: 'sentence-id-1',
    emotion: 'joy',
    confidence: 0.9,
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
    f'\${API_BASE_URL}/emotion-annotation',
    headers={'x-api-key': 'your-api-key-here'},
    json={
        'sentenceId': 'sentence-id-1',
        'emotion': 'joy',
        'confidence': 0.9,
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
  "emotion": "joy",
  "confidence": 0.9,
  "createdAt": "2024-01-15T10:30:00Z"
}`}</CodeBlock>

                <h2>Emotion Categories</h2>
                <p>Emotions are categorized as:</p>
                <ul>
                    <li><strong>Positive:</strong> joy, happiness, excitement, love</li>
                    <li><strong>Negative:</strong> sadness, anger, fear, disgust</li>
                    <li><strong>Neutral:</strong> neutral, calm</li>
                    <li><strong>Mixed:</strong> mixed emotions</li>
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
