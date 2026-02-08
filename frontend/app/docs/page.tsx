import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'API Documentation - Introduction',
    description: 'Introduction to the ILHRF API for accessing language data collection endpoints',
};

export default function DocsIntroPage() {
    return (
        <div className="prose prose-slate max-w-none">
            <h1>API Documentation</h1>
            <p className="text-lg text-slate-600">
                Welcome to the ILHRF API documentation. This API provides programmatic access to language data collection,
                validation, and annotation endpoints for Indian languages.
            </p>

            <h2>Base URL</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-4">
                <div className="space-y-2">
                    <div>
                        <strong>Production:</strong>{' '}
                        <code className="text-sm">https://api.ilhrf.org/api</code>
                    </div>
                    <div>
                        <strong>Development:</strong>{' '}
                        <code className="text-sm">http://localhost:5566/api</code>
                    </div>
                </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-4">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> All code examples in this documentation use{' '}
                    <code>https://api.ilhrf.org/api</code> as the base URL. For local development,
                    replace with <code>http://localhost:5566/api</code>.
                </p>
            </div>

            <h2>Quick Start</h2>
            <p>
                To get started with the API, you&apos;ll need to:
            </p>
            <ol>
                <li>
                    <Link href="/docs/authentication" className="text-indigo-600 hover:text-indigo-700">
                        Create an account
                    </Link>{' '}
                    or use OAuth (Google/GitHub)
                </li>
                <li>
                    <Link href="/docs/api-keys" className="text-indigo-600 hover:text-indigo-700">
                        Generate an API key
                    </Link>{' '}
                    from your account settings
                </li>
                <li>Include your API key in requests using the <code>x-api-key</code> header or <code>api_key</code> query parameter</li>
            </ol>

            <h2>Authentication</h2>
            <p>
                The API supports two authentication methods:
            </p>
            <ul>
                <li>
                    <strong>API Key:</strong> Include your API key in the <code>x-api-key</code> header or as a query parameter
                </li>
                <li>
                    <strong>JWT Token:</strong> Use a JWT token from login/signup in the <code>Authorization</code> header
                </li>
            </ul>
            <p>
                Most endpoints require authentication. See the{' '}
                <Link href="/docs/authentication" className="text-indigo-600 hover:text-indigo-700">
                    Authentication guide
                </Link>{' '}
                for details.
            </p>

            <h2>API Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-2">Scripted Speech</h3>
                    <p className="text-sm text-slate-600 mb-3">
                        Record speech for provided sentences, validate audio recordings, and listen to contributed audio.
                    </p>
                    <Link href="/docs/speech/get-sentences" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        View endpoints →
                    </Link>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-2">Spontaneous Speech</h3>
                    <p className="text-sm text-slate-600 mb-3">
                        Submit questions, get validated questions, and record answers to questions.
                    </p>
                    <Link href="/docs/question/submit-question" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        View endpoints →
                    </Link>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-2">Write</h3>
                    <p className="text-sm text-slate-600 mb-3">
                        Submit new sentences for validation and inclusion in the dataset.
                    </p>
                    <Link href="/docs/write/submit-sentences" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        View endpoints →
                    </Link>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-2">Transcription</h3>
                    <p className="text-sm text-slate-600 mb-3">
                        Get audio for transcription, submit transcriptions, and review transcriptions.
                    </p>
                    <Link href="/docs/transcription/get-audio" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        View endpoints →
                    </Link>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-2">NLP</h3>
                    <p className="text-sm text-slate-600 mb-3">
                        Named Entity Recognition, Part-of-Speech tagging, Translation, Sentiment Analysis, and Emotion Recognition.
                    </p>
                    <Link href="/docs/nlp/ner-sentences" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        View endpoints →
                    </Link>
                </div>
            </div>

            <h2>Response Format</h2>
            <p>
                All API responses are returned in JSON format. Successful responses return a <code>200</code> status code,
                while errors return appropriate HTTP status codes (400, 401, 404, 500, etc.) with error details in the response body.
            </p>

            <h2>Rate Limiting</h2>
            <p>
                Rate limiting is applied to prevent abuse. See the{' '}
                <Link href="/docs/rate-limiting" className="text-indigo-600 hover:text-indigo-700">
                    Rate Limiting guide
                </Link>{' '}
                for details on limits and how to handle rate limit responses.
            </p>

            <h2>Language Codes</h2>
            <p>
                The API uses ISO standard language codes with script variants in the format <code>{`{ISO_639-3}_{ISO_15924}`}</code>
                (e.g., <code>eng_Latn</code>, <code>hin_Deva</code>, <code>kok_Deva</code>, <code>kok_Latn</code>, <code>kok_Mlym</code>).
                Language codes use ISO 639-3 (3-letter) and script codes use ISO 15924 (4-letter).
                See the{' '}
                <Link href="/docs/languages" className="text-indigo-600 hover:text-indigo-700">
                    Supported Languages
                </Link>{' '}
                page for a complete list of supported languages and their codes.
            </p>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
                <p className="text-blue-800 text-sm">
                    If you encounter any issues or have questions, please{' '}
                    <Link href="/contact" className="text-blue-600 hover:text-blue-700 underline">
                        contact us
                    </Link>
                    {' '}or check the{' '}
                    <Link href="/docs/authentication" className="text-blue-600 hover:text-blue-700 underline">
                        authentication guide
                    </Link>.
                </p>
            </div>
        </div>
    );
}
