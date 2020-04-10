/* eslint-disable @typescript-eslint/no-explicit-any */

import * as core from "@actions/core";
import { GitHub } from "@actions/github";
import * as yaml from "js-yaml";

import { decode } from "../encoder";
import { getRepoFile } from "../github-api";


export async function fetchYamlFile(
  client: GitHub,
  filePath: string,
): Promise<any> {
  try {
    const { content, encoding } = await getRepoFile(client, filePath);
    core.debug(`found '${filePath}', decoding and loading YAML`);

    const rawActionConfig: string = decode(content, encoding);
    return yaml.safeLoad(rawActionConfig);
  } catch(_) {
    core.debug(`file not found ('${filePath}')`);
    return { };
  }
}
