// SPDX-License-Identifier: MIT

import fs from "node:fs";
import path from "node:path";

/**
 * Get the project's changelog.
 *
 * @returns {string} The changelog.
 */
export function getChangelog() {
  const changelogFilePath = getPathTo("CHANGELOG.md");
  const changelogRaw = readFile(changelogFilePath);
  return changelogRaw;
}

/**
 * Get the changelog version header for the current version
 *
 * @returns {string} The version header.
 */
export function getCurrentVersionHeader() {
  const manifest = getManifest();
  const version = manifest.version;
  const versionHeader = `## [${version}]`;
  return versionHeader;
}

/**
 * Get the project's manifest.
 *
 * @returns {Record<string, any>} The manifest as a JavaScript.
 */
function getManifest() {
  const manifestFilePath = getPathTo("package.json");
  const manifestRaw = readFile(manifestFilePath);
  const manifest = JSON.parse(manifestRaw);
  return manifest;
}

/**
 * Get the path to a file in the project.
 *
 * @param {string} relativePath A project-root relative file path.
 * @returns {string} The absolute path
 */
function getPathTo(relativePath) {
  const absolutePath = path.resolve(".", relativePath);
  return absolutePath;
}

/**
 * Check if the current version stated in the package manifest has been
 * released according to the changelog.
 *
 * @returns {boolean} `true` if released, `false` otherwise.
 */
export function isCurrentVersionReleased() {
  const changelog = getChangelog();
  const versionHeader = getCurrentVersionHeader();
  return changelog.includes(versionHeader);
}

/**
 * Read a file.
 *
 * @param {string} file An absolute file path.
 * @returns {string} The file contents.
 */
function readFile(filepath) {
  const content = fs.readFileSync(filepath).toString();
  return content;
}

/**
 * Rewrite the project's changelog.
 *
 * @param {string} changelog The new changelog contents.
 */
export function writeChangelog(changelog) {
  const changelogFile = getPathTo("CHANGELOG.md");
  fs.writeFileSync(changelogFile, changelog);
}
