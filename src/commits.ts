import * as core from "@actions/core";
import { Octokit } from "@octokit/core";

import { ActionConfig } from "./inputs";
import { SVGOptimizer } from "./svgo";


export default async function main(
  _: Octokit,
  __: ActionConfig,
  ___: SVGOptimizer,
): Promise<void> {
  core.setFailed("NOT YET SUPPORTED");
}
