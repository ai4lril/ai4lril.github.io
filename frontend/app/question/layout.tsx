import { SITE_URL, ORG_NAME } from '@/lib/site-config';
import type { Metadata } from 'next';

const title = 'Spontaneous Speech | ILHRF';
const description =
  'Answer questions with voice. Contribute spontaneous speech to ILHRF linguistic data collection for 7100+ languages.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'International Linguistic Heritage Research Foundation',
    'ILHRF',
    'crowdsourced linguistic data',
    '7100+ languages',
    'global languages',
    'spontaneous speech',
    'question answering',
  ],
  alternates: { canonical: `${SITE_URL}/question` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/question`,
    siteName: ORG_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function QuestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
