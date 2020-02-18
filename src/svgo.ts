import * as core from "@actions/core";
import * as github from "@actions/github";
import * as yaml from "js-yaml";
import SVGO from "svgo";

import { decode } from "./encoder";
import { getRepoFile } from "./github-api";


const DEFAULT_CONFIG_FILE = ".svgo.yml";


export async function getDefaultSvgoOptions(
  client: github.GitHub,
): Promise<SVGO.Options> {
  try {
    const { content, encoding } = await getRepoFile(
      client,
      DEFAULT_CONFIG_FILE,
    );

    core.debug(`default SVGO configuration found ('${DEFAULT_CONFIG_FILE}')`);

    const rawSvgoOptions = decode(content, encoding);
    return yaml.safeLoad(rawSvgoOptions);
  } catch(_) {
    core.debug("default SVGO configuration not found");
    return { };
  }
}

export class SVGOptimizer {

  private svgo: SVGO;

  constructor(options?: SVGO.Options) {
    this.svgo = new SVGO(options || {});
  }

  async optimize(originalSvg: string): Promise<string> {
    const { data: optimizedSvg } = await this.svgo.optimize(originalSvg);
    return optimizedSvg;
  }

}
