import { SITE_URL, ORG_NAME } from '@/lib/site-config';
import type { Metadata } from 'next';

const title = 'Scripted Speech | ILHRF';
const description =
  'Record audio for predefined sentences. Contribute to ILHRF crowdsourced linguistic data for 7100+ languages worldwide.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'International Linguistic Heritage Research Foundation',
    'ILHRF',
    'crowdsourced linguistic data',
    '7100+ languages',
    'global languages',
    'scripted speech',
    'speech recording',
  ],
  alternates: { canonical: `${SITE_URL}/speak` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/speak`,
    siteName: ORG_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function SpeakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
