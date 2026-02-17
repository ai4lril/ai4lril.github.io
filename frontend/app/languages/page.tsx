import type { Metadata } from 'next';
import DocsPageWrapper from '@/components/docs/DocsPageWrapper';
import CodeBlock from '@/components/docs/CodeBlock';
import { LANGUAGES } from '@/lib/languages';
import { SITE_URL, ORG_NAME } from '@/lib/site-config';

const title = 'Supported Languages | ILHRF';
const description =
    'ILHRF crowdsourced linguistic data platform supports 7100+ languages worldwide. List of supported languages and their ISO language codes with script variants for the API.';

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/languages` },
    openGraph: {
        title,
        description,
        type: 'website',
        url: `${SITE_URL}/languages`,
        siteName: ORG_NAME,
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
    },
};

export default function LanguagesPage() {

    return (
        <div className="prose prose-slate max-w-none">
            <DocsPageWrapper
                method="GET"
                requiresAuth={false}
                breadcrumbs={[
                    { label: 'Docs', href: '/docs' },
                    { label: 'Supported Languages' },
                ]}
            >
                <h1>Supported Languages</h1>
                <p className="text-lg text-slate-600">
                    The API uses ISO standard language codes with script variants in the format <code>{`{lang}_{script}`}</code>.
                    All endpoints accept a <code>languageCode</code> parameter to filter results by language and script.
                </p>

                <h2>Language Code Format</h2>
                <p>
                    Language codes follow the ISO standard pattern: <code>{`{ISO_639-3}_{ISO_15924}`}</code>
                </p>
                <ul>
                    <li><strong>Language code:</strong> ISO 639-3 three-letter language code (e.g., <code>hin</code> for Hindi, <code>kok</code> for Konkani, <code>eng</code> for English)</li>
                    <li><strong>Script code:</strong> ISO 15924 four-letter script code (e.g., <code>Deva</code> for Devanagari, <code>Latn</code> for Latin/Roman, <code>Mlym</code> for Malayalam)</li>
                </ul>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                        <strong>Note:</strong> This follows the ISO 639-3 (language) and ISO 15924 (script) standards,
                        ensuring international compatibility and standardization.
                    </p>
                </div>

                <h2>Supported Languages</h2>
                <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left border-b">Language Code</th>
                                <th className="px-4 py-2 text-left border-b">Language</th>
                                <th className="px-4 py-2 text-left border-b">Script</th>
                                <th className="px-4 py-2 text-left border-b">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LANGUAGES.map((lang) => (
                                <tr key={lang.code}>
                                    <td className="px-4 py-2 border-b">
                                        <code className="bg-slate-100 px-2 py-1 rounded">{lang.code}</code>
                                    </td>
                                    <td className="px-4 py-2 border-b">{lang.name}</td>
                                    <td className="px-4 py-2 border-b">{lang.script}</td>
                                    <td className="px-4 py-2 border-b">
                                        <span className={lang.status === 'supported' ? 'text-green-600' : 'text-yellow-600'}>
                                            {lang.status === 'supported' ? '✅ Supported' : '🚧 Coming Soon'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h2>Examples</h2>
                <p>Here are some examples of language codes with script variants using ISO standards:</p>
                <ul>
                    <li><code>kok_Deva</code> - Konkani Devanagari (ISO 639-3: kok, ISO 15924: Deva)</li>
                    <li><code>kok_Latn</code> - Konkani Latin/Roman (ISO 639-3: kok, ISO 15924: Latn)</li>
                    <li><code>kok_Mlym</code> - Konkani Malayalam (ISO 639-3: kok, ISO 15924: Mlym)</li>
                    <li><code>hin_Deva</code> - Hindi Devanagari (ISO 639-3: hin, ISO 15924: Deva)</li>
                    <li><code>hin_Latn</code> - Hindi Latin/Roman (ISO 639-3: hin, ISO 15924: Latn)</li>
                    <li><code>mar_Deva</code> - Marathi Devanagari (ISO 639-3: mar, ISO 15924: Deva)</li>
                    <li><code>mar_Latn</code> - Marathi Latin/Roman (ISO 639-3: mar, ISO 15924: Latn)</li>
                    <li><code>eng_Latn</code> - English Latin (ISO 639-3: eng, ISO 15924: Latn)</li>
                </ul>

                <h2>Script Support</h2>
                <p>
                    Most endpoints accept text in native scripts. When submitting text, you must specify both the language and script using the combined code format.
                </p>
                <ul>
                    <li>Native script (e.g., <code>hin_Deva</code> for Hindi in Devanagari, <code>tam_Taml</code> for Tamil)</li>
                    <li>Roman transliteration (e.g., <code>hin_Latn</code> for Hindi in Latin script, <code>kok_Latn</code> for Konkani in Latin script)</li>
                </ul>

                <h2>Usage Examples</h2>
                <p>
                    Filter sentences by language code with script:
                </p>
                <CodeBlock language="bash">{`# Get Hindi sentences in Devanagari script
GET /api/speech/sentences?languageCode=hin_Deva

# Get Hindi sentences in Latin/Roman script
GET /api/speech/sentences?languageCode=hin_Latn

# Get Konkani sentences in Devanagari script
GET /api/speech/sentences?languageCode=kok_Deva

# Get Konkani sentences in Latin/Roman script
GET /api/speech/sentences?languageCode=kok_Latn

# Get Konkani sentences in Malayalam script
GET /api/speech/sentences?languageCode=kok_Mlym

# Get Tamil sentences
GET /api/speech/sentences?languageCode=tam_Taml

# Get English sentences
GET /api/speech/sentences?languageCode=eng_Latn`}</CodeBlock>

                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Note</h3>
                    <p className="text-blue-800 text-sm">
                        If no <code>languageCode</code> is provided, endpoints may return results from all languages
                        or default to a specific language depending on the endpoint.
                    </p>
                </div>
            </DocsPageWrapper>
        </div>
    );
}
