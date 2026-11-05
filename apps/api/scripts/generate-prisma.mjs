import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const erpDir = path.resolve(apiDir, "../online-erp");
const workspace = path.resolve(apiDir, "../..");
const prismaCli = path.join(erpDir, "node_modules", "prisma", "build", "index.js");
const result = spawnSync(process.execPath, [prismaCli, "generate", "--schema", path.join(erpDir, "prisma", "schema.prisma")], {
  cwd: erpDir,
  env: process.env,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
