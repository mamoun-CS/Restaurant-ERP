import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const apiDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(apiDirectory, "../..");

const config: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: repositoryRoot,
  turbopack: { root: repositoryRoot },
};

export default config;
