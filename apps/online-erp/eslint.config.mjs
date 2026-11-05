import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "../api/.next/**",
    "out/**",
    "build/**",
    "nova-print-agent/**",
    "print-agent/**",
    "../../apps/desktop-pos/node_modules/**",
    "../../apps/desktop-pos/dist/**",
    "../../apps/desktop-pos/dist-electron/**",
    "../../apps/desktop-pos/release/**",
    "scripts/**",
    "test/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
