import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
