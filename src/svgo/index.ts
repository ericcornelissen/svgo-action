import type { FileSystem } from "../file-systems";
import type { error } from "../types";
import type { AllowedSvgoVersions } from "./types";

import parsers from "../parsers";
import { SVGOptimizer } from "./svgo-wrapper";

interface Params {
  readonly config: {
    svgoOptionsPath: string;
    svgoVersion: AllowedSvgoVersions;
  };
  readonly fs: FileSystem;
}

function parseRawConfig({ rawConfig, svgoVersion } : {
  rawConfig: string,
  svgoVersion: AllowedSvgoVersions,
}): [unknown, error] {
  if (svgoVersion === 1) {
    const parseYaml = parsers.NewYaml();
    return parseYaml(rawConfig);
  } else {
    const parseJavaScript = parsers.NewJavaScript();
    return parseJavaScript(rawConfig);
  }
}

async function New({ config, fs }: Params): Promise<[SVGOptimizer, error]> {
  const { svgoOptionsPath: configPath, svgoVersion } = config;

  const [rawConfig, err1] = await fs.readFile(configPath); // eslint-disable-line security/detect-non-literal-fs-filename
  if (err1 !== null) {
    return [new SVGOptimizer(svgoVersion), err1];
  }

  const [svgoConfig, err2] = parseRawConfig({ rawConfig, svgoVersion });
  if (err2 !== null) {
    return [new SVGOptimizer(svgoVersion), err2];
  }

  return [new SVGOptimizer(svgoVersion, svgoConfig), null];
}

export default {
  New,
};

export type {
  AllowedSvgoVersions,
  SVGOptimizer,
};
