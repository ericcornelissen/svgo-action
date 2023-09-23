import type { error } from "../errors";

import parsers from "../parsers";

interface Config {
  readonly svgoConfigPath: {
    readonly value: string;
  };
}

interface Params {
  readonly config: Config;
  readonly rawConfig: string;
}

function parseRawSvgoConfig({
  rawConfig,
}: Params): [unknown, error] {
  const parseJavaScript = parsers.NewJavaScript();
  return parseJavaScript(rawConfig);
}

export {
  parseRawSvgoConfig,
};
