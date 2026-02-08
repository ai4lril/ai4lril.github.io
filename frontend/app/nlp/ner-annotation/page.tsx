import type { Metadata } from 'next';
import DocsPageWrapper from '@/components/docs/DocsPageWrapper';
import CodeBlock from '@/components/docs/CodeBlock';
import CodeTabs from '@/components/docs/CodeTabs';

export const metadata: Metadata = {
    title: 'NER Annotation - API Documentation',
    description: 'Submit Named Entity Recognition annotations',
};

const API_BASE_URL = 'https://ilhrf.org/api';

export default function NerAnnotationPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <DocsPageWrapper
                method="POST"
                requiresAuth={true}
                breadcrumbs={[
                    { label: 'Docs', href: '/docs' },
                    { label: 'NLP', href: '/docs/nlp/ner-sentences' },
                    { label: 'NER Annotation' },
                ]}
                previous={{ title: 'NER Sentences', href: '/docs/nlp/ner-sentences' }}
                next={{ title: 'POS Sentences', href: '/docs/nlp/pos-sentences' }}
            >
                <h1>Submit NER Annotation</h1>
                <p className="text-lg text-slate-600">
                    Submit Named Entity Recognition (NER) annotations for a sentence.
                </p>

                <h2>Endpoint</h2>
                <CodeBlock language="http">POST /api/dataset/ner-annotation</CodeBlock>

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
                                <td className="px-4 py-2 border-b">Yes</td>
                                <td className="px-4 py-2 border-b">Array of NER annotations</td>
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

                <h2>Annotation Format</h2>
                <p>Each annotation object should contain:</p>
                <ul>
                    <li><code>text</code>: The entity text</li>
                    <li><code>label</code>: The entity label (e.g., &quot;PERSON&quot;, &quot;ORG&quot;, &quot;LOC&quot;, &quot;MISC&quot;)</li>
                    <li><code>start</code>: Start position in the sentence</li>
                    <li><code>end</code>: End position in the sentence</li>
                </ul>

                <h2>Request Example</h2>
                <CodeTabs
                    examples={[
                        {
                            language: 'bash',
                            label: 'cURL',
                            code: `curl -X POST "\${API_BASE_URL}/dataset/ner-annotation" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your-api-key-here" \\
  -d '{
    "sentenceId": "sentence-id-1",
    "annotations": [
      {"text": "John", "label": "PERSON", "start": 0, "end": 4},
      {"text": "Microsoft", "label": "ORG", "start": 15, "end": 24},
      {"text": "Seattle", "label": "LOC", "start": 28, "end": 35}
    ],
    "languageCode": "hin_Deva"
  }'`,
                        },
                        {
                            language: 'javascript',
                            label: 'JavaScript',
                            code: `const response = await fetch('\${API_BASE_URL}/dataset/ner-annotation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key-here'
  },
  body: JSON.stringify({
    sentenceId: 'sentence-id-1',
    annotations: [
      { text: 'John', label: 'PERSON', start: 0, end: 4 },
      { text: 'Microsoft', label: 'ORG', start: 15, end: 24 },
      { text: 'Seattle', label: 'LOC', start: 28, end: 35 }
    ],
    languageCode: 'hin_Deva'
  })
});
const result = await response.json();`,
                        },
                        {
                            language: 'python',
                            label: 'Python',
                            code: `import requests

response = requests.post(
    '\${API_BASE_URL}/dataset/ner-annotation',
    headers={'x-api-key': 'your-api-key-here'},
    json={
        'sentenceId': 'sentence-id-1',
        'annotations': [
            {'text': 'John', 'label': 'PERSON', 'start': 0, 'end': 4},
            {'text': 'Microsoft', 'label': 'ORG', 'start': 15, 'end': 24},
            {'text': 'Seattle', 'label': 'LOC', 'start': 28, 'end': 35}
        ],
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
  "annotations": [...],
  "createdAt": "2024-01-15T10:30:00Z"
}`}</CodeBlock>

            </DocsPageWrapper>
        </div>
    );
}
