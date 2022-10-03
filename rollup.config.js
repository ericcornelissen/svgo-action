// Check out rollup.js at: https://rollupjs.org

import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  output: {
    file: "lib/index.cjs",
    format: "cjs",
  },
  plugins: [
    typescript(),
    commonjs({ ignoreDynamicRequires: true }),
    json(),
    nodeResolve({ preferBuiltins: true }),
    terser(),
  ],
};
