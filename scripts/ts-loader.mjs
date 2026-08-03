/** Lets the migration import data/site.ts directly, so there is one source of truth. */
export async function load(url, context, next) {
  if (!url.endsWith(".ts")) return next(url, context);
  const { readFile } = await import("node:fs/promises");
  const { transformSync } = await import("esbuild");
  const src = await readFile(new URL(url), "utf8");
  const { code } = transformSync(src, { loader: "ts", format: "esm", target: "es2022" });
  return { format: "module", source: code, shortCircuit: true };
}
export function resolve(spec, context, next) {
  if (spec.startsWith("../data/") || spec.startsWith("@/data/")) {
    return next(spec.replace("@/", "../"), context);
  }
  return next(spec, context);
}
