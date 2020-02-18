import * as core from "@actions/core";
import * as github from "@actions/github";
import * as yaml from "js-yaml";
import SVGO from "svgo";

import { decode } from "./encoder";
import { getRepoFile } from "./github-api";


const DEFAULT_CONFIG_FILE = ".svgo.yml";


export async function getDefaultConfig(
  client: github.GitHub,
): Promise<SVGO.Options> {
  try {
    const { content, encoding } = await getRepoFile(
      client,
      DEFAULT_CONFIG_FILE,
    );

    core.debug(`default configuration ${DEFAULT_CONFIG_FILE} found`);

    const rawSvgoConfig = decode(content, encoding);
    return yaml.safeLoad(rawSvgoConfig);
  } catch(_) {
    core.debug("default configuration not found");
    return { };
  }
}

export class SVGOptimizer {

  private svgo: SVGO;

  constructor(config?: object) {
    this.svgo = new SVGO(config || {});
  }

  async optimize(originalSvg: string): Promise<string> {
    const { data: optimizedSvg } = await this.svgo.optimize(originalSvg);
    return optimizedSvg;
  }

}
