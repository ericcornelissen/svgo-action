import type { error } from "../types";

import parsers from "../parsers";

interface Params {
  readonly rawConfig: string;
  readonly svgoVersion: number;
}

function parseRawSvgoConfig({
  rawConfig,
  svgoVersion,
}: Params): [unknown, error] {
  if (svgoVersion === 1) {
    const parseYaml = parsers.NewYaml();
    return parseYaml(rawConfig);
  } else {
    const parseJavaScript = parsers.NewJavaScript();
    return parseJavaScript(rawConfig);
  }
}

export default parseRawSvgoConfig;