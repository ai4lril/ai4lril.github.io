'use client';

import Link from 'next/link';

export default function CrowdsourcingHomePage() {
    return (
        <div className="min-h-screen container mx-auto py-16 px-4">
            <h1 className="text-3xl font-bold mb-8">ILHRF Crowdsourcing</h1>
            <p className="text-gray-600 mb-8">Choose a task to contribute:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/speak" className="neu-raised rounded-xl p-4">Scripted Speech</Link>
                <Link href="/listen" className="neu-raised rounded-xl p-4">Listen & Validate</Link>
                <Link href="/write" className="neu-raised rounded-xl p-4">Write Sentences</Link>
                <Link href="/question" className="neu-raised rounded-xl p-4">Spontaneous Speech</Link>
                <Link href="/ner" className="neu-raised rounded-xl p-4">Token Classification</Link>
                <Link href="/translate" className="neu-raised rounded-xl p-4">Translation</Link>
                <Link href="/sentiment" className="neu-raised rounded-xl p-4">Affect</Link>
                <Link href="/docs" className="neu-raised rounded-xl p-4">API Docs</Link>
            </div>
        </div>
    );
}
