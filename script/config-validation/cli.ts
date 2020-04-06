/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

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
  const [type, report] = analyze(rawConfigObject);

  console.log(`${type} file detected\n`);
  console.log("\nReport:\n=======");
  console.log(report.filter((x) => x !== "").join("\n"));
}

main(process.argv[2]);
