import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
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
