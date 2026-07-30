import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";

const root = process.cwd();
const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".agents", ".local"].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith(".html")) files.push(path);
  }
}
walk(root);

const failures = [];
const links = [];
for (const file of files) {
  const html = readFileSync(file, "utf8");
  const label = relative(root, file);
  for (const requirement of [
    ["doctype", /<!doctype html>/i],
    ["title", /<title>.+?<\/title>/is],
    ["main landmark", /<main\b/i],
    ["shared design", /assets\/academic\.css/],
  ]) {
    if (!requirement[1].test(html)) failures.push(`${label}: missing ${requirement[0]}`);
  }
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = match[1];
    if (/^(https?:|mailto:|#)/.test(href)) continue;
    const path = href.split("#")[0].split("?")[0];
    if (!path) continue;
    const target = normalize(join(dirname(file), path));
    links.push([label, href]);
    if (!existsSync(target)) failures.push(`${label}: broken link ${href}`);
  }
}

for (const topic of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  if (topic.name.startsWith(".") || ["assets", "scripts"].includes(topic.name)) continue;
  for (const required of ["MISSION.md", "RESOURCES.md", "NOTES.md", "lessons", "reference", "learning-records"]) {
    if (!existsSync(join(root, topic.name, required))) failures.push(`${topic.name}: missing ${required}`);
  }
}

console.log(JSON.stringify({ htmlFiles: files.length, localLinksChecked: links.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
