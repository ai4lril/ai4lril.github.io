import { SITE_URL } from '@/lib/site-config';

/**
 * @deprecated SEO metadata is now handled by Next.js App Router metadata API in layout.tsx and page.tsx.
 * This component is not imported anywhere. Use site-config.ts SITE_URL if you need absolute URLs.
 */
interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string[];
    canonical?: string;
    ogImage?: string;
    noindex?: boolean;
    structuredData?: object;
}

export default function SEOHead({
    keywords = [],
    canonical,
    ogImage,
    noindex = false,
    structuredData
}: SEOHeadProps) {
    const defaultKeywords = [
        "language data collection",
        "7100+ languages",
        "International Linguistic Heritage Research Foundation",
        "ILHRF",
        "NLP datasets",
        "speech recognition",
        "artificial intelligence",
        "multilingual data"
    ];

    const allKeywords = [...defaultKeywords, ...keywords];

    return (
        <>
            {/* Canonical URL */}
            {canonical && (
                <link rel="canonical" href={`${SITE_URL}${canonical}`} />
            )}

            {/* Robots Meta */}
            {noindex && (
                <meta name="robots" content="noindex, nofollow" />
            )}

            {/* Additional Keywords */}
            <meta name="keywords" content={allKeywords.join(', ')} />

            {/* Open Graph Additional */}
            {ogImage && (
                <>
                    <meta property="og:image:width" content="1200" />
                    <meta property="og:image:height" content="630" />
                    <meta property="og:image:type" content="image/jpeg" />
                </>
            )}

            {/* Twitter Additional */}
            <meta name="twitter:site" content="@alvynabranches" />
            <meta name="twitter:creator" content="@alvynabranches" />

            {/* Additional Meta Tags */}
            <meta name="author" content="Alvyn Abranches" />
            <meta name="publisher" content="ILHRF" />
            <meta name="language" content="English" />
            <meta name="revisit-after" content="7 days" />

            {/* Structured Data */}
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData)
                    }}
                />
            )}
        </>
    );
}

// Helper function to generate structured data for pages
export function generatePageStructuredData(
    type: string,
    name: string,
    description: string,
    url: string
) {
    return {
        "@context": "https://schema.org",
        "@type": type,
        "name": name,
        "description": description,
        "url": `${SITE_URL}${url}`,
        "publisher": {
            "@type": "Organization",
            "name": "International Linguistic Heritage Research Foundation",
            "url": SITE_URL
        },
        "isPartOf": {
            "@type": "WebSite",
            "name": "ILHRF",
            "url": SITE_URL
        }
    };
}
