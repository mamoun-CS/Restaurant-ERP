import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const legacyRoot = path.join(root, "src", "app", "api");
const moduleRoot = path.join(root, "apps", "api", "src", "modules", "route-handlers");
const routes = [...walk(legacyRoot)].filter((file) => path.basename(file) === "route.ts");

for (const source of routes) {
  const modulePath = path.join(moduleRoot, path.relative(legacyRoot, source));
  if (fs.existsSync(modulePath)) throw new Error(`Refusing to overwrite extracted handler: ${modulePath}`);
}

for (const source of routes) {
  const modulePath = path.join(moduleRoot, path.relative(legacyRoot, source));
  fs.mkdirSync(path.dirname(modulePath), { recursive: true });
  fs.renameSync(source, modulePath);
  const code = fs.readFileSync(modulePath, "utf8");
  const { methods, configs } = routeExports(code);
  if (!methods.length) continue;
  writeAdapter(modulePath, source, modulePath, methods, configs, "Compatibility adapter: handler implementation is owned by apps/api.");
  const apiRoute = path.join(root, "apps", "api", "src", "app", "api", path.relative(legacyRoot, source));
  writeAdapter(modulePath, apiRoute, modulePath, methods, configs, "API route adapter: business handler is in apps/api/src/modules/route-handlers.");
}

console.log(`Extracted ${routes.length} route modules into apps/api; legacy route paths remain as compatibility adapters.`);

function routeExports(code) {
  const methods = [];
  const configs = [];
  const methodNames = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
  const configNames = new Set(["dynamic", "dynamicParams", "revalidate", "fetchCache", "runtime", "preferredRegion", "maxDuration"]);
  for (const match of code.matchAll(/export\s+(?:(?:async\s+)?function|const|let|var)\s+([A-Za-z_$][\w$]*)/g)) {
    if (methodNames.has(match[1])) methods.push(match[1]);
    if (configNames.has(match[1])) {
      const literal = code.match(new RegExp(`export\\s+const\\s+${match[1]}\\s*=\\s*("[^"\\n]*"|'[^'\\n]*'|[0-9]+|true|false|null)\\s*;`));
      if (literal) configs.push(`export const ${match[1]} = ${literal[1]};`);
    }
  }
  for (const match of code.matchAll(/export\s*\{([^}]+)\}\s*from/g)) {
    for (const value of match[1].split(",")) {
      const name = value.trim().split(/\s+as\s+/)[0];
      if (methodNames.has(name)) methods.push(name);
    }
  }
  return { methods: [...new Set(methods)], configs: [...new Set(configs)] };
}

function writeAdapter(modulePath, target, importPath, methods, configs, comment) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const relative = path.relative(path.dirname(target), importPath).replaceAll(path.sep, "/").replace(/\.ts$/, "");
  const specifier = relative.startsWith(".") ? relative : `./${relative}`;
  fs.writeFileSync(target, `// ${comment}\n${configs.join("\n")}\nexport { ${methods.join(", ")} } from ${JSON.stringify(specifier)};\n`);
}

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(absolute); else yield absolute;
  }
}
