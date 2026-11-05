import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const apiDirectory = path.join(workspace, "apps", "api");
const server = path.join(apiDirectory, ".next", "standalone", "apps", "api", "server.js");
const child = spawn(process.execPath, [server], {
  cwd: apiDirectory,
  env: { ...process.env, PORT: process.env.PORT || "3010", HOSTNAME: process.env.HOSTNAME || "0.0.0.0" },
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code ?? 1));
