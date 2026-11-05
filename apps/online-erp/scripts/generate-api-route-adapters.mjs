import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "apps", "api", "src", "modules", "route-handlers");
const targetRoot = path.join(root, "apps", "api", "src", "app", "api");
const legacyTargetRoot = path.join(root, "src", "app", "api");
const methods = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
const configs = new Set(["dynamic", "dynamicParams", "revalidate", "fetchCache", "runtime", "preferredRegion", "maxDuration"]);
let count = 0;

for (const source of walk(sourceRoot)) {
  if (path.basename(source) !== "route.ts") continue;
  if (!exportsFor(source).length) continue;
  const destination = path.join(targetRoot, path.relative(sourceRoot, source));
  writeAdapter(destination, source, "API route adapter: business handler is owned by apps/api.");
  const legacyDestination = path.join(legacyTargetRoot, path.relative(sourceRoot, source));
  writeAdapter(legacyDestination, source, "Compatibility adapter: handler implementation is owned by apps/api.");
  count++;
}
console.log(`Generated ${count} API route adapters.`);

function writeAdapter(destination, source, comment) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const relativeImport = path.relative(path.dirname(destination), source).replaceAll(path.sep, "/").replace(/\.ts$/, "");
  const specifier = relativeImport.startsWith(".") ? relativeImport : `./${relativeImport}`;
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
