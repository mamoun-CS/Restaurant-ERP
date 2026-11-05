import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const apiDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(apiDirectory, "../..");

const config: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: repositoryRoot,
  turbopack: { root: repositoryRoot },
  transpilePackages: ["@restaurant/shared-types", "@restaurant/shared-validation", "@restaurant/shared-business-logic"],
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    APP_URL: process.env.APP_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
  },
  webpack(configuration) {
    configuration.resolve.alias = {
      ...configuration.resolve.alias,
      "@": path.join(repositoryRoot, "apps", "online-erp", "src"),
    };
    return configuration;
  },
};

export default config;
