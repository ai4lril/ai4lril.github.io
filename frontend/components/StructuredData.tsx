import { SITE_URL, ORG_NAME, ORG_ACRONYM, ORG_DESCRIPTION } from '@/lib/site-config';

export default function StructuredData() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORG_NAME,
    alternateName: ORG_ACRONYM,
    url: SITE_URL,
    description: ORG_DESCRIPTION,
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORG_NAME,
    alternateName: ORG_ACRONYM,
    url: SITE_URL,
    description: ORG_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
