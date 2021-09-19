#!/usr/bin/env node
/**
 * @fileoverview
 * Script to be run after bundling with rollup.js. Currently, it fixes a minor
 * problem where SVGO v1 tries to read a file at a relative path that does not
 * exist.
 */

const fs = require("fs");
const path = require("path");

const problemFile = path.resolve(
  __dirname,
  "..",
  "lib",
  "index.js",
);

const content = fs.readFileSync(problemFile).toString();
const newContent = content.replace(
  "/../../.svgo.yml",
  "/.svgo.yml",
);
fs.writeFileSync(problemFile, newContent);
