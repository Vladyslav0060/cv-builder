import type { MetadataRoute } from "next";

const SITE_URL = "https://cv-builder-chi-black.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/documents",
        "/new-document",
        "/profile",
        "/checkout",
        "/auth",
        "/403",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
