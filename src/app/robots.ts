import type { MetadataRoute } from 'next';

const BASE = 'https://cpu-scheduling-algorithms-visualizer.onrender.com';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
