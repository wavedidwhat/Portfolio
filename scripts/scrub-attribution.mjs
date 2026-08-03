#!/usr/bin/env node
/**
 * Strips AI attribution from commit messages and source comments.
 *
 * Two different jobs, deliberately handled differently:
 *
 *   commit messages — stripped silently. "Co-Authored-By: Claude", "Generated
 *   with Claude Code" and friends are trailers; removing them can't break
 *   anything, so it happens without asking.
 *
 *   source files — a whole-line comment is stripped and re-staged. A line with
 *   code AND a trailing mention is NOT auto-edited; it's reported and the
 *   commit is blocked, because silently rewriting a line that contains code is
 *   how you corrupt a file at 2am. You fix those two by hand.
 *
 * Usage:
 *   node scripts/scrub-attribution.mjs --msg <file>   (commit-msg hook)
 *   node scripts/scrub-attribution.mjs --staged       (pre-commit hook)
 *   node scripts/scrub-attribution.mjs --all          (sweep the repo)
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";

/** anything that attributes authorship to an assistant */
const MENTION =
  /\b(claude|anthropic|copilot|chatgpt|openai codex|cursor ai)\b/i;

/** trailer lines that exist only to credit a tool */
const TRAILER =
  /^\s*(co-authored-by:\s*(claude|.*anthropic).*|.*generated with \[?claude.*|.*🤖 generated with.*|assisted-by:\s*(claude|copilot).*)$/i;

const COMMENT_ONLY = [
  /^\s*\/\/.*$/, // // ...
  /^\s*#(?!!).*$/, // # ...  (not a shebang)
  /^\s*\*.*$/, // continuation of a block comment
  /^\s*\/\*.*\*\/\s*$/, // /* ... */ on one line
  /^\s*<!--.*-->\s*$/, // <!-- ... -->
];

const SKIP_EXT = /\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|mp4|webm|lock|vsix|zip)$/i;

/**
 * Skip our own machinery. This file and the hooks necessarily contain the very
 * words they match on, so without this the scrubber deletes its own patterns
 * the first time it runs — which it did, on the first test.
 */
const SKIP_PATH = /(^|\/)(\.githooks\/|scripts\/scrub-attribution\.mjs$)/;

const isCommentOnly = (line) => COMMENT_ONLY.some((re) => re.test(line));

function scrubMessage(file) {
  const before = readFileSync(file, "utf8");
  const after = before
    .split("\n")
    .filter((l) => !TRAILER.test(l))
    .join("\n")
    .replace(/\n{3,}$/, "\n");
  if (after !== before) {
    writeFileSync(file, after);
    console.log("scrub: removed AI attribution from the commit message");
  }
}

function scrubFiles(files) {
  const blocked = [];
  let changed = 0;

  for (const f of files) {
    if (!existsSync(f) || SKIP_EXT.test(f) || SKIP_PATH.test(f)) continue;
    try {
      if (statSync(f).size > 2_000_000) continue;
    } catch {
      continue;
    }

    let text;
    try {
      text = readFileSync(f, "utf8");
    } catch {
      continue; // binary
    }
    if (!MENTION.test(text)) continue;

    const out = [];
    let touched = false;

    text.split("\n").forEach((line, i) => {
      if (!MENTION.test(line)) return out.push(line);
      if (isCommentOnly(line)) {
        touched = true;
        return; // drop the line entirely
      }
      blocked.push(`${f}:${i + 1}: ${line.trim().slice(0, 88)}`);
      out.push(line);
    });

    if (touched) {
      writeFileSync(f, out.join("\n"));
      changed++;
      console.log(`scrub: cleaned ${f}`);
    }
  }

  return { blocked, changed };
}

const mode = process.argv[2];

if (mode === "--msg") {
  scrubMessage(process.argv[3]);
} else {
  const files =
    mode === "--all"
      ? execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter(Boolean)
      : execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACM"], {
          encoding: "utf8",
        })
          .split("\n")
          .filter(Boolean);

  const { blocked, changed } = scrubFiles(files);

  if (changed && mode !== "--all") {
    execFileSync("git", ["add", ...files.filter((f) => existsSync(f))]);
  }

  if (blocked.length) {
    console.error("\nAI attribution on lines that also contain code:\n");
    blocked.forEach((b) => console.error("  " + b));
    console.error("\nThese are not auto-edited — rewriting a line with code in it\nis too easy to get wrong. Remove the mention and commit again.\n");
    process.exit(1);
  }
}
