import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const here = new URL(".", import.meta.url).pathname;
const postPath = join(here, "POST.json");

let raw: string;
try {
  raw = readFileSync(postPath, "utf8");
} catch (err) {
  throw new Error(`cannot read POST.json: ${(err as Error).message}`);
}

let post: unknown;
try {
  post = JSON.parse(raw);
} catch (err) {
  throw new Error(`POST.json is not valid JSON: ${(err as Error).message}`);
}

if (typeof post !== "object" || post === null) {
  throw new Error("POST.json must be a JSON object");
}

const url = (post as { url?: unknown }).url;
if (typeof url !== "string" || url.length === 0) {
  throw new Error("POST.json must contain a non-empty string field 'url'");
}

const isXPost =
  (url.startsWith("https://x.com/") || url.startsWith("https://twitter.com/")) &&
  url.includes("/status/");
if (!isXPost) {
  throw new Error("POST.json url must be an X post address, like https://x.com/<handle>/status/<id>");
}

mkdirSync(outDir, { recursive: true });
copyFileSync(postPath, join(outDir, "POST.json"));
