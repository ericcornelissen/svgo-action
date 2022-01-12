const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const nodeResolve = require("@rollup/plugin-node-resolve").nodeResolve;
const typescript = require("@rollup/plugin-typescript");
const terser = require("rollup-plugin-terser").terser;

module.exports = {
  input: "src/index.ts",
  output: {
    file: "lib/index.js",
    format: "cjs",
  },
  plugins: [
    commonjs(),
    json(),
    nodeResolve({ preferBuiltins: true }),
    terser(),
    typescript(),
  ],
};
