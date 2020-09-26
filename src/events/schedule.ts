import * as core from "@actions/core";
import { Octokit } from "@octokit/core";

import { ActionConfig } from "../inputs";
import { SVGOptimizer } from "../svgo";

export default async function main(
  client: Octokit,
  config: ActionConfig,
  svgo: SVGOptimizer,
): Promise<void> {
  core.info("TO BE IMPLEMENTED");
}
