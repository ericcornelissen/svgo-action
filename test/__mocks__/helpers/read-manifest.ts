import * as yaml from "js-yaml";
import * as path from "path";
import * as fs from "fs";

type ActionManifest = {
  inputs: {
    [key: string]: {
      default: string,
    },
  },
};

const actionManifestFile = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "action.yml",
);
const rawActionManifest = fs.readFileSync(actionManifestFile).toString();
const actionManifest = yaml.load(rawActionManifest) as ActionManifest;

export { actionManifest };
