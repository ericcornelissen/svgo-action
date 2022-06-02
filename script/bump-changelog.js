const fs = require("node:fs");
const path = require("node:path");

const STR_UNRELEASED = "## [Unreleased]";
const STR_NO_CHANGES = "- _No changes yet_";

const manifestFile = path.resolve("./package.json");
const changelogFile = path.resolve("./CHANGELOG.md");

const manifestRaw = fs.readFileSync(manifestFile).toString();
const manifest = JSON.parse(manifestRaw);
const version = manifest.version;

const changelog = fs.readFileSync(changelogFile).toString();
if (changelog.includes(`## [${version}]`)) {
  throw new Error(`${version} already in CHANGELOG`);
}

const unreleasedTitleIndex = changelog.indexOf(STR_UNRELEASED);
if (unreleasedTitleIndex === -1) {
  throw new Error("The CHANGELOG is invalid");
}

if (changelog.includes(STR_NO_CHANGES)) {
  throw new Error("No changes to release in the CHANGELOG");
}

const date = new Date();
const year = date.getFullYear();
const _month = date.getMonth() + 1;
const month = _month < 10 ? `0${_month}` : _month;
const _day = date.getDate();
const day = _day < 10 ? `0${_day}` : _day;

const newChangelog =
  changelog.slice(0, unreleasedTitleIndex + STR_UNRELEASED.length) +
  `\n\n${STR_NO_CHANGES}` +
  `\n\n## [${version}] - ${year}-${month}-${day}` +
  changelog.slice(unreleasedTitleIndex + STR_UNRELEASED.length);

fs.writeFileSync(changelogFile, newChangelog);
