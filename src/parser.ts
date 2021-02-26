/* eslint-disable @typescript-eslint/no-explicit-any */

import * as yaml from "js-yaml";


export function parseAny(
  type: "js" | "yaml",
  raw: string,
): any {
  switch (type) {
    case "js":
      return parseJavaScript(raw);
    case "yaml":
      return parseYaml(raw);
    default:
      throw new Error(`unsupported type ${type}`);
  }
}

export function parseJavaScript(rawJavaScript: string): any {
  try {
    // eslint-disable-next-line security/detect-eval-with-expression
    return eval(rawJavaScript);
  } catch (_) {
    return null;
  }
}

export function parseYaml(rawYaml: string): any {
  try {
    return yaml.load(rawYaml);
  } catch (_) {
    return null;
  }
}
