/* eslint-disable no-console */
/* eslint-disable security/detect-non-literal-fs-filename */

import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";

import { analyze } from "./main";


function getConfigObject(file: string): any {
  const configFile: string = path.resolve(__dirname, "../..", file);
  const configString: string = fs.readFileSync(configFile).toString();
  return yaml.safeLoad(configString);
}


function main(configFile: string): void {
  const rawConfigObject: any = getConfigObject(configFile);
  const { type, messages, comment, commit }= analyze(rawConfigObject);

  console.log(`${type} file detected`);
  console.log("\nReport:\n=======");
  console.log(messages.join("\n"));
  console.log("\nExample comment:\n================\n");
  console.log(`~~~\n${comment}\n~~~\n`);
  console.log("\nExample commit message:\n=======================\n");
  console.log(`~~~\n${commit}\n~~~`);
}

main(process.argv[2]);
