import type { Metadata } from 'next';
import './globals.css';
import NavbarWrapper from '@/components/NavbarWrapper';
import { ToastContainer } from '@/lib/toast';
import { RealtimeNotificationListener } from '@/components/RealtimeNotificationListener';
import OnboardingTourMount from '@/components/OnboardingTourMount';
import OnboardingProgressMount from '@/components/OnboardingProgressMount';
import { SITE_URL, ORG_NAME, ORG_DESCRIPTION } from '@/lib/site-config';
import StructuredData from '../components/StructuredData';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title:
        'ILHRF - International Linguistic Heritage Research Foundation | Crowdsourced Linguistic Data for 7100+ Languages',
    description: ORG_DESCRIPTION,
    keywords: [
        'International Linguistic Heritage Research Foundation',
        'ILHRF',
        'linguistic heritage foundation',
        'crowdsourced linguistic data',
        'language data collection',
        '7100+ languages',
        'global languages',
        'speech recognition',
        'NLP',
        'linguistic research',
        'language preservation',
        'language diversity',
        'translation',
        'transliteration',
        'automatic speech recognition',
        'speech to text translation',
        'named entity recognition',
        'emotion recognition',
        'sentiment identification',
        'parts of speech',
    ],
    openGraph: {
        title:
            'ILHRF - International Linguistic Heritage Research Foundation | Crowdsourced Linguistic Data for 7100+ Languages',
        description: ORG_DESCRIPTION,
        type: 'website',
        url: SITE_URL,
        siteName: ORG_NAME,
    },
    twitter: {
        card: 'summary_large_image',
        title:
            'ILHRF - International Linguistic Heritage Research Foundation | Crowdsourced Linguistic Data for 7100+ Languages',
        description: ORG_DESCRIPTION,
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <StructuredData />
                <NavbarWrapper />
                <OnboardingTourMount />
                <OnboardingProgressMount />
                <RealtimeNotificationListener />
                <ToastContainer />
                {children}
            </body>
        </html>
    );
}
