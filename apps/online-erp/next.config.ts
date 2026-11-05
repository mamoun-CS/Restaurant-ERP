import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  turbopack: { root: path.resolve(__dirname, "../..") },
  transpilePackages: ["@restaurant/shared-types", "@restaurant/shared-validation", "@restaurant/shared-business-logic"],
  allowedDevOrigins: [
    "tychistic-ira-stretchiest.ngrok-free.dev",
    "localhost:3000",
  ],
  async redirects() {
    return [
      {
        source: "/admin/printing",
        destination: "/admin/settings/printing",
        permanent: false,
      },
      {
        source: "/admin/printing/printing",
        destination: "/admin/settings/printing",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
