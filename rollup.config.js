const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const nodeResolve = require("@rollup/plugin-node-resolve").nodeResolve;
const typescript = require("@rollup/plugin-typescript");
const terser = require("rollup-plugin-terser").terser;

module.exports = {
  input: "src/index.ts",
  output: {
    dir: "lib",
    format: "cjs",
  },
  external: ["node:fs", "node:path"],
  plugins: [
    typescript(),
    commonjs({ ignoreDynamicRequires: true }),
    json(),
    nodeResolve({ preferBuiltins: true }),
    terser(),
  ],
};
