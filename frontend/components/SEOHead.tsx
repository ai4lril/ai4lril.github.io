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
        "Indian languages",
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
                <link rel="canonical" href={`https://ai4lril.github.io${canonical}`} />
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
        "url": `https://ai4lril.github.io${url}`,
        "publisher": {
            "@type": "Organization",
            "name": "ILHRF",
            "url": "https://ai4lril.github.io"
        },
        "isPartOf": {
            "@type": "WebSite",
            "name": "ILHRF",
            "url": "https://ai4lril.github.io"
        }
    };
}
