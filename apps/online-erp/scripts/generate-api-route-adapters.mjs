import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(appDirectory, "../..");
const sourceRoot = path.join(appDirectory, "src", "lib", "backend-api", "route-handlers");
const targetRoots = [
  path.join(root, "apps", "api", "src", "app", "api"),
  path.join(appDirectory, "src", "app", "api"),
];
const erpOwnedRoutes = new Set(["auth/login/route.ts", "auth/logout/route.ts", "auth/session/route.ts"]);
const methods = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
const configs = new Set(["dynamic", "dynamicParams", "revalidate", "fetchCache", "runtime", "preferredRegion", "maxDuration"]);
let count = 0;

for (const source of walk(sourceRoot)) {
  if (path.basename(source) !== "route.ts") continue;
  if (!exportsFor(source).length) continue;
  const relative = path.relative(sourceRoot, source);
  const handlerImport = `@/lib/backend-api/route-handlers/${relative.replaceAll(path.sep, "/").replace(/\.ts$/, "")}`;
  for (const [index, targetRoot] of targetRoots.entries()) {
    const destination = path.join(targetRoot, relative);
    if (index === 1 && erpOwnedRoutes.has(relative.replaceAll(path.sep, "/"))) continue;
    writeAdapter(destination, source, handlerImport, index === 0 ? "Backend API compatibility route." : "Online ERP full-stack API route.");
    count++;
  }
}
console.log(`Generated ${count} API route adapters for the ERP and backend compatibility app.`);

function writeAdapter(destination, source, specifier, comment) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `// ${comment}\n${configLinesFor(source).join("\n")}\nexport { ${exportsFor(source).join(", ")} } from ${JSON.stringify(specifier)};\n`);
}

function exportsFor(source) {
  const code = fs.readFileSync(source, "utf8");
  const names = [];
  for (const match of code.matchAll(/export\s+(?:(?:async\s+)?function|const|let|var)\s+([A-Za-z_$][\w$]*)/g)) if (methods.has(match[1])) names.push(match[1]);
  for (const match of code.matchAll(/export\s*\{([^}]+)\}\s*from/g)) {
    for (const name of match[1].split(",").map((value) => value.trim().split(/\s+as\s+/)[0])) if (methods.has(name)) names.push(name);
  }
  return [...new Set(names)];
}

function configLinesFor(source) {
  const code = fs.readFileSync(source, "utf8");
  const lines = [];
  for (const match of code.matchAll(/export\s+(?:(?:async\s+)?function|const|let|var)\s+([A-Za-z_$][\w$]*)/g)) {
    if (!configs.has(match[1])) continue;
    const literal = code.match(new RegExp(`export\\s+const\\s+${match[1]}\\s*=\\s*("[^"\\n]*"|'[^'\\n]*'|[0-9]+|true|false|null)\\s*;`));
    if (literal) lines.push(`export const ${match[1]} = ${literal[1]};`);
  }
  return [...new Set(lines)];
}

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(absolute);
    else yield absolute;
  }
}
