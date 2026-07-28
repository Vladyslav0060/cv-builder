import type { NextConfig } from "next";
import path from "node:path";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname, "../.."),
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
