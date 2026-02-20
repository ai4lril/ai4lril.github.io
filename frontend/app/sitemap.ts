import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;

  const routes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/speak`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/listen`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/question`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/write`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/transcribe`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/translate`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/review`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/languages`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/docs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/docs/languages`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/docs/authentication`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/docs/rate-limiting`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/docs/api-keys`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
  ];

  return routes;
}
