import * as core from "@actions/core";
import * as github from "@actions/github";
import * as yaml from "js-yaml";
import SVGO from "svgo";

import { decode } from "./encoder";
import { getRepoFile } from "./github-api";


export async function getSvgoOptions(
  client: github.GitHub,
  path: string,
): Promise<SVGO.Options> {
  try {
    const { content, encoding } = await getRepoFile(client, path);
    core.debug(`options file for SVGO found ('${path}')`);

    const rawSvgoOptions = decode(content, encoding);
    return yaml.safeLoad(rawSvgoOptions);
  } catch(_) {
    core.debug(`options file for SVGO not found ('${path}')`);
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
