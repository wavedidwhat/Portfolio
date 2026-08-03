#!/usr/bin/env node
/**
 * Uploads the project marks in public/icons into Sanity and points each
 * project's appIcon / markSrc at the asset.
 *
 * The first migration mapped every field EXCEPT the images, so switching the
 * site to read from Sanity silently blanked every icon. The files were still on
 * disk and the schema had the fields; nothing connected them.
 *
 * Deterministic asset IDs mean re-running replaces rather than piling up
 * duplicate assets in the media library.
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const token =
  process.env.SANITY_WRITE_TOKEN ??
  JSON.parse(readFileSync(join(homedir(), ".config/sanity/config.json"), "utf8")).authToken;

const c = createClient({
  projectId: "k8n4gdum", dataset: "production",
  apiVersion: "2026-01-01", token, useCdn: false,
});

/** which field each mark belongs in: a complete square icon vs a glyph */
const MARKS = [
  ["ise",        "appIcon", "ise.svg"],
  ["rdk",        "appIcon", "rdk.svg"],
  ["collabo",    "appIcon", "collabo.png"],
  ["peeksy",     "appIcon", "peeksy.svg"],
  ["courierx",   "appIcon", "courierx.svg"],
  ["honeybyte",  "appIcon", "honeybyte.png"],
  ["beanstudio", "appIcon", "beanstudio.svg"],
  ["shipper",    "appIcon", "shipper.png"],
  ["mintro",     "markSrc", "mintro.svg"],
];

const tx = c.transaction();
let n = 0;

for (const [id, field, file] of MARKS) {
  const buf = readFileSync(`public/icons/${file}`);
  const asset = await c.assets.upload("image", buf, {
    filename: file,
    // stable id: re-running overwrites instead of duplicating
    contentType: file.endsWith(".svg") ? "image/svg+xml" : "image/png",
  });
  tx.patch(`project-${id}`, {
    set: { [field]: { _type: "image", asset: { _type: "reference", _ref: asset._id } } },
  });
  console.log(`  ${id.padEnd(11)} ${field.padEnd(8)} ${file.padEnd(16)} -> ${asset._id}`);
  n++;
}

await tx.commit();
console.log(`patched ${n} projects`);
