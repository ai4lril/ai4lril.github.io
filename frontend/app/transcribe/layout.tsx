import { SITE_URL, ORG_NAME } from '@/lib/site-config';
import type { Metadata } from 'next';

const title = 'Transcribe Audio | ILHRF';
const description =
  'Transcribe audio to text for ILHRF. Help build crowdsourced linguistic datasets for language preservation across 7100+ languages.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'International Linguistic Heritage Research Foundation',
    'ILHRF',
    'crowdsourced linguistic data',
    '7100+ languages',
    'global languages',
    'transcription',
    'speech to text',
  ],
  alternates: { canonical: `${SITE_URL}/transcribe` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/transcribe`,
    siteName: ORG_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function TranscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
