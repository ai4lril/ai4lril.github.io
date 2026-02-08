import type { Metadata } from 'next';
import DocsPageWrapper from '@/components/docs/DocsPageWrapper';
import CodeBlock from '@/components/docs/CodeBlock';
import CodeTabs from '@/components/docs/CodeTabs';

export const metadata: Metadata = {
    title: 'POS Sentences - API Documentation',
    description: 'Get sentences for Part-of-Speech tagging',
};

export default function PosSentencesPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <DocsPageWrapper
                method="GET"
                requiresAuth={false}
                breadcrumbs={[
                    { label: 'Docs', href: '/docs' },
                    { label: 'NLP', href: '/docs/nlp/ner-sentences' },
                    { label: 'POS Sentences' },
                ]}
                previous={{ title: 'NER Annotation', href: '/docs/nlp/ner-annotation' }}
                next={{ title: 'POS Annotation', href: '/docs/nlp/pos-annotation' }}
            >
                <h1>Get POS Sentences</h1>
                <p className="text-lg text-slate-600">
                    Retrieve sentences available for Part-of-Speech (POS) tagging.
                </p>

                <h2>Endpoint</h2>
                <CodeBlock language="http">GET /api/pos-sentences</CodeBlock>

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
                            code: `curl -X GET "https://api.example.com/api/pos-sentences?languageCode=en"`,
                        },
                        {
                            language: 'javascript',
                            label: 'JavaScript',
                            code: `const response = await fetch('https://api.example.com/api/pos-sentences?languageCode=en');
const sentences = await response.json();`,
                        },
                        {
                            language: 'python',
                            label: 'Python',
                            code: `import requests

response = requests.get(
    'https://api.example.com/api/pos-sentences',
    params={'languageCode': 'en'}
)
sentences = response.json()`,
                        },
                    ]}
                />

                <h2>Response</h2>
                <p>Returns an array of sentence objects:</p>
                <CodeBlock language="json">{`[
  {
    "id": "sentence-id-1",
    "sentenceText": "The cat sat on the mat.",
    "languageCode": "en"
  }
]`}</CodeBlock>
            </DocsPageWrapper>
        </div>
    );
}
