/**
 * # Maybe Run JS
 *
 * Run a tool if it is present on the PATH, otherwise output a warning.
 *
 * Retrieved from (and updates available at):
 * https://gist.github.com/ericcornelissen/6253b63db8c6f6ec6a58cb4d36c8e989
 *
 * ## Installation
 *
 * This script is intended to be vendored:
 *
 * - Add `is-ci` as a development dependency (if it is not already) using
 *   `npm install --save-dev is-ci`.
 * - Create a new file in your project, e.g. `script/maybe-run.js`, and copy
 *   this code into it.
 * - Use as `$ node script/maybe-run.js`.
 *
 * ## Description
 *
 * A helper script for Node.js projects to aid in continuously running optional
 * tooling (without errors if it is missing). When used it will run the given
 * command if and only if it is available on the current system, outputting a
 * warning when the command is not found. In a continuous integration context
 * the script will still exit with a non-zero exit code if the command is not
 * found.
 *
 * The target command will be executed in the working directory where this
 * script is invoked. That is, when running `node path/to/maybe-run.js CMD`, the
 * command will be invoked in the directory where `node` is being invoked.
 *
 * For instructions on how to use this script run `node maybe-run.js` (without
 * any further arguments).
 *
 * ## License
 *
 * MIT No Attribution
 *
 * Copyright 2023 Eric Cornelissen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import cp from "node:child_process";
import process from "node:process";

import isCI from "is-ci";

if (process.argv.length < 3) {
  console.info(
    "Provide a command to try and execute.",
    "\n",
    "\nUsage:",
    "\n  node path/to/maybe-run.js [CMD] [ARGS...]",
  );
  process.exit(1);
}

const cmd = process.argv[2];
const args = process.argv.slice(3 /*, end */);
const { status } = cp.spawnSync(cmd, args, {
  cwd: "./",
  stdio: "inherit",
});

if (status === null) {
  if (isCI) {
    console.error("Command", `'${cmd}'`, "not found.");
    process.exit(1);
  } else {
    console.warn(
      "Command", `'${cmd}'`, "not found, it will not be run.",
      "Install it to make this warning go away.",
    );
    process.exit(0);
  }
} else {
  process.exit(status);
}
