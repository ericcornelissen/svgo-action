/* eslint-disable @typescript-eslint/no-explicit-any */

import * as core from "@actions/core";
import { Octokit } from "@octokit/core";
import * as yaml from "js-yaml";

import { decode } from "../encoder";
import { getFile } from "../github-api";


export async function fetchYamlFile(
  client: Octokit,
  filePath: string,
): Promise<any> {
  try {
    const { content, encoding } = await getFile(client, filePath);
    core.debug(`found '${filePath}', decoding and loading YAML`);

    const rawActionConfig: string = decode(content, encoding);
    return yaml.load(rawActionConfig);
  } catch(_) {
    core.debug(`file not found ('${filePath}')`);
    return { };
  }
}
