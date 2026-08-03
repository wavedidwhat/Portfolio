import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * Every view is a hash route on one page, so there is only one real URL to
 * submit. Listing `#hash` entries would be noise: crawlers drop the fragment
 * and would see the same page repeated twenty times, which reads as duplicate
 * content rather than depth.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

