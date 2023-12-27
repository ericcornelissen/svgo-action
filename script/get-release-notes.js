// SPDX-License-Identifier: MIT-0

import process from "node:process";

import {
  getChangelog,
  getCurrentVersionHeader,
  isCurrentVersionReleased,
} from "./helpers.js";

if (!isCurrentVersionReleased()) {
  throw new Error("The current version in the manifest hasn't been released");
}

const changelog = getChangelog();
const versionHeader = getCurrentVersionHeader();

const startIndex = changelog.indexOf(versionHeader)
  + versionHeader.length
  + " - 2022-01-01".length;
const endIndex = startIndex
  + changelog.substring(startIndex).indexOf("## [");

const releaseNotes = changelog.substring(startIndex, endIndex);
process.stdout.write(releaseNotes);
process.stdout.write("\n");
