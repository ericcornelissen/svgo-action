import type { error } from "../types";

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

const yamlExtensions = [
  "yaml",
  "yml",
];

function isYamlFile(filePath: string): boolean {
  return yamlExtensions.some((extension) => filePath.endsWith(extension));
}

function parseRawSvgoConfig({
  config,
  rawConfig,
}: Params): [unknown, error] {
  if (isYamlFile(config.svgoConfigPath.value)) {
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
