import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiOrigin = process.env.ONLINE_ERP_API_URL;
if (!apiOrigin) {
  console.error("Set ONLINE_ERP_API_URL to the separately deployed backend API origin before building the Online ERP.");
  process.exit(1);
}
try { new URL(apiOrigin); }
catch { console.error("ONLINE_ERP_API_URL must be an absolute URL."); process.exit(1); }

const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");
const result = spawnSync(process.execPath, [nextCli, "build"], {
  cwd: root,
  env: { ...process.env, ONLINE_ERP_API_URL: apiOrigin.replace(/\/$/, "") },
  stdio: "inherit",
});
process.exit(result.status ?? 1);
