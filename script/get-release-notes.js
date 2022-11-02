import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const manifestFile = path.resolve("./package.json");
const changelogFile = path.resolve("./CHANGELOG.md");

const manifestRaw = fs.readFileSync(manifestFile).toString();
const manifest = JSON.parse(manifestRaw);
const version = manifest.version;
const versionHeader = `## [${version}]`;

const changelog = fs.readFileSync(changelogFile).toString();
if (!changelog.includes(versionHeader)) {
  throw new Error(`${version} missing from CHANGELOG`);
}

const startIndex = changelog.indexOf(versionHeader) + versionHeader.length + 13;
const endIndex = startIndex + (
  changelog
    .substring(startIndex)
    .indexOf("## [")
);

const releaseNotes = changelog.substring(startIndex, endIndex);
process.stdout.write(releaseNotes);
process.stdout.write("\n");
