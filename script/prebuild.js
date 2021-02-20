#!/usr/bin/env node
/**
 * @fileoverview
 * Adjusts a
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
