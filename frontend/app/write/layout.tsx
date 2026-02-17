import { SITE_URL, ORG_NAME } from '@/lib/site-config';
import type { Metadata } from 'next';

const title = 'Submit Sentences | ILHRF';
const description =
  'Contribute sentences to the ILHRF corpus. Support crowdsourced linguistic data collection for languages worldwide.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'International Linguistic Heritage Research Foundation',
    'ILHRF',
    'crowdsourced linguistic data',
    '7100+ languages',
    'global languages',
    'sentence contribution',
    'linguistic corpus',
  ],
  alternates: { canonical: `${SITE_URL}/write` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/write`,
    siteName: ORG_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function WriteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
