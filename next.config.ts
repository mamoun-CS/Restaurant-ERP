import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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