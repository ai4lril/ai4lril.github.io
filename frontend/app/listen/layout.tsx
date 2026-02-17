import { SITE_URL, ORG_NAME } from '@/lib/site-config';
import type { Metadata } from 'next';

const title = 'Listen & Validate | ILHRF';
const description =
  'Validate audio recordings for ILHRF. Help ensure quality of crowdsourced linguistic data for languages worldwide.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'International Linguistic Heritage Research Foundation',
    'ILHRF',
    'crowdsourced linguistic data',
    '7100+ languages',
    'global languages',
    'audio validation',
    'speech validation',
  ],
  alternates: { canonical: `${SITE_URL}/listen` },
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${SITE_URL}/listen`,
    siteName: ORG_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function ListenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
