import { execSync } from "child_process";
import { writeFileSync } from "fs";
import fetch from "node-fetch";
import { join } from "path";

// todo: strip regex entries
const sourceUrl = "https://raw.githubusercontent.com/filebot/data/master/release-groups.txt";
const outputPath = join(__dirname, "../src/data/release-groups.ts");

const headerDate = new Date().toISOString();
const header = `// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT IT DIRECTLY.\n// Last updated: ${headerDate}\n\nexport const RELEASE_GROUPS = [\n`;
const footer = `];\n`;

async function main() {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const releaseGroups = text.split("\n");
  const middle = releaseGroups.map((item) => `"${item}",`).join("\n");
  const output = header + middle + footer;
  writeFileSync(outputPath, output);
  execSync(`prettier --write ${outputPath}`, {
    stdio: "inherit",
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});