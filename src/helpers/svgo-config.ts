import type { error } from "../types";

import parsers from "../parsers";

interface Config {
  readonly svgoVersion: {
    readonly value: number;
  };
}

interface Params {
  readonly config: Config;
  readonly rawConfig: string;
}

function parseRawSvgoConfig({
  config,
  rawConfig,
}: Params): [unknown, error] {
  if (config.svgoVersion.value === 1) {
    const parseYaml = parsers.NewYaml();
    return parseYaml(rawConfig);
  } else {
    const parseJavaScript = parsers.NewJavaScript();
    return parseJavaScript(rawConfig);
  }
}

export {
  parseRawSvgoConfig,
};
