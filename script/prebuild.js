#!/usr/bin/env node
/**
 * @fileoverview
 * Script to be run before bundling with NCC. Currently, it fixes a minor issue
 * in SVGO v2's source that causes NCC to error.
 */

const fs = require("fs");
const path = require("path");

const problemFile = path.resolve(
  __dirname,
  "..",
  "node_modules",
  "svgo-v2",
  "lib",
  "svgo-node.js",
);

const content = fs.readFileSync(problemFile).toString();
const newContent = content.replace(
  "async configFile => {",
  "async (configFile) => {",
);
fs.writeFileSync(problemFile, newContent);
