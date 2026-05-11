import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    externalDir: true,
  },
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
