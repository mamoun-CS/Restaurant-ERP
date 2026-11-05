import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(workspace, "apps", "online-erp");
const apiOrigin = process.env.ONLINE_ERP_API_URL || "http://127.0.0.1:3010";
const cli = path.join(workspace, "node_modules", "next", "dist", "bin", "next");
const result = spawnSync(process.execPath, [cli, "build"], {
  cwd: appDir,
  env: { ...process.env, ONLINE_ERP_API_URL: apiOrigin },
  stdio: "inherit",
});
process.exit(result.status ?? 1);
