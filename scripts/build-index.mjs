#!/usr/bin/env node
// Builds index.json for the skills catalog.
// Walks every top-level skill folder, parses the SKILL.md frontmatter, hashes every
// file and writes a sorted index. No dependencies.
//
// Fails (exit 1) when:
//   - a folder has no SKILL.md or no frontmatter
//   - the frontmatter `name` differs from the folder name, or is not a valid skill name
//   - the description is missing
//   - a file inside a skill folder is not a .md file

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "index.json");
// Top-level folders that are not skills.
const IGNORED_DIRS = new Set(["scripts", "img", "node_modules"]);
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const errors = [];

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else if (entry.isFile()) out.push(full);
    else errors.push(`${relative(ROOT, full)}: not a regular file`);
  }
  return out;
}

function unquote(s) {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function parseValue(raw) {
  const v = raw.trim();
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    return inner ? inner.split(",").map((x) => unquote(x)).filter(Boolean) : [];
  }
  return unquote(v);
}

// Minimal YAML subset: top-level `key: value`, one nested map level (two-space indent),
// inline lists `[a, b]`, and folded continuation lines for long scalars.
function parseFrontmatter(text) {
  const normalized = text.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const m = normalized.match(/^---\n([\s\S]*?)\n---(\n|$)/);
  if (!m) return null;
  const data = {};
  let parent = null;
  let lastKey = null; // [container, key] for continuation lines
  for (const line of m[1].split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const top = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    const nested = line.match(/^ {2}([A-Za-z0-9_-]+):\s*(.*)$/);
    if (top) {
      const [, key, value] = top;
      if (value === "") {
        data[key] = {};
        parent = data[key];
        lastKey = null;
      } else {
        data[key] = parseValue(value);
        parent = null;
        lastKey = [data, key];
      }
    } else if (nested && parent) {
      const [, key, value] = nested;
      parent[key] = parseValue(value);
      lastKey = [parent, key];
    } else if (/^\s+\S/.test(line) && lastKey && typeof lastKey[0][lastKey[1]] === "string") {
      lastKey[0][lastKey[1]] += " " + line.trim();
    } else {
      return { __error: `cannot parse frontmatter line: ${JSON.stringify(line)}` };
    }
  }
  return data;
}

const skills = [];

const topDirs = readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith(".") && !IGNORED_DIRS.has(d.name))
  .map((d) => d.name)
  .sort();

for (const folder of topDirs) {
  const dir = join(ROOT, folder);
  const skillPath = join(dir, "SKILL.md");
  let text;
  try {
    text = readFileSync(skillPath, "utf8");
  } catch {
    errors.push(`${folder}: missing SKILL.md`);
    continue;
  }

  const fm = parseFrontmatter(text);
  if (!fm) {
    errors.push(`${folder}/SKILL.md: missing YAML frontmatter`);
    continue;
  }
  if (fm.__error) {
    errors.push(`${folder}/SKILL.md: ${fm.__error}`);
    continue;
  }

  const name = typeof fm.name === "string" ? fm.name : "";
  if (name !== folder) errors.push(`${folder}: frontmatter name "${name}" does not match folder name`);
  if (!NAME_RE.test(folder) || folder.length > 64) errors.push(`${folder}: invalid skill name`);

  const description = typeof fm.description === "string" ? fm.description.trim() : "";
  if (!description) errors.push(`${folder}: description is missing`);
  else if (description.length > 1024) errors.push(`${folder}: description longer than 1024 characters`);

  const meta = fm.metadata && typeof fm.metadata === "object" ? fm.metadata : {};
  const tools = Array.isArray(meta.tools) ? meta.tools : [];

  const files = [];
  for (const full of listFiles(dir)) {
    const rel = relative(dir, full).split(sep).join("/");
    if (!rel.toLowerCase().endsWith(".md")) {
      errors.push(`${folder}/${rel}: only .md files are allowed`);
      continue;
    }
    const buf = readFileSync(full);
    files.push({
      path: rel,
      sha256: createHash("sha256").update(buf).digest("hex"),
      size: statSync(full).size,
    });
  }
  files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  skills.push({
    name,
    description,
    author: typeof meta.author === "string" ? meta.author : "",
    version: typeof meta.version === "string" ? meta.version : "",
    tools,
    files,
  });
}

if (errors.length) {
  console.error("build-index: validation failed:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}

skills.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

const index = { schema: 1, generatedAt: new Date().toISOString(), skills };
writeFileSync(OUT, JSON.stringify(index, null, 2) + "\n");
console.log(`build-index: wrote ${relative(ROOT, OUT)} with ${skills.length} skills`);
