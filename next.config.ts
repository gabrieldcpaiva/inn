import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [82],
  },
  serverExternalPackages: ["@electric-sql/pglite", "pg", "sharp"],
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "localhost", "127.0.0.1"],
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
