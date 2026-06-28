import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { denyPatterns, skippedCurrentFiles } from "./open-source-denylist.mjs";

const trackedFiles = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean)
  .filter((file) => !skippedCurrentFiles.has(file))
  .filter((file) => existsSync(file));

const findings = [];
const localeForbiddenKeys = [
  "filePage",
  "logsPage",
  "syncPage",
  "sharePage",
  "archivePage",
  "themeSettingPage",
  "apiSettingPage",
  "moreSettingPage",
  "aboutUsPage",
  "codePage",
  "magicPath",
];
const localeForbiddenPatterns = [
  [/\bGist\b/gi, "removed Gist sync locale text"],
  [/\bgist(Token|Upload)?\b/gi, "removed Gist sync locale key"],
  [/\bgithub(User|Proxy|Api|Config)\b/gi, "removed GitHub sync locale key"],
  [/\bsyncConfig\b/g, "removed sync locale key"],
  [/\bshareManage\b/g, "removed share locale key"],
  [/\bshareEditor\b/g, "removed share locale key"],
  [/\barchive\b/g, "removed archive locale key"],
  [/\blogs\b/g, "removed logs locale key"],
  [/\bapiSetting\b/g, "removed API setting locale key"],
  [/\bmoreSetting\b/g, "removed more setting locale key"],
  [/\bthemeSetting\b/g, "removed theme setting locale key"],
  [/\beditScript\b/g, "removed script editor locale key"],
  [/\bfileEditor\b/g, "removed file editor locale key"],
  [/\bsyncEditor\b/g, "removed sync editor locale key"],
];

for (const file of trackedFiles) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const lines = text.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const [pattern, label] of denyPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        findings.push(`${file}:${index + 1}: ${label}: ${line.trim()}`);
      }
    }
  }

  if (/^frontend\/src\/locales\/(zh|en|ru)\.ts$/.test(file)) {
    const localeKeyPattern = new RegExp(`^\\s{2}(${localeForbiddenKeys.join("|")}):`);
    for (const [index, line] of lines.entries()) {
      if (localeKeyPattern.test(line)) {
        findings.push(`${file}:${index + 1}: removed locale section: ${line.trim()}`);
      }

      for (const [pattern, label] of localeForbiddenPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(line)) {
          findings.push(`${file}:${index + 1}: ${label}: ${line.trim()}`);
        }
      }
    }
  }
}

if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log("Open-source scan passed.");
