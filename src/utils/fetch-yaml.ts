/* eslint-disable @typescript-eslint/no-explicit-any */

import * as core from "@actions/core";
import * as yaml from "js-yaml";

import { decode } from "../encoder";
import { getFile } from "../github-api";
import { Octokit } from "../types";


export async function fetchYamlFile(
  client: Octokit,
  ref: string,
  filePath: string,
): Promise<any> {
  try {
    const { content, encoding } = await getFile(client, ref, filePath);
    core.debug(`found '${filePath}', decoding and loading YAML`);

    const rawActionConfig: string = decode(content, encoding);
    return yaml.load(rawActionConfig);
  } catch(_) {
    core.debug(`file not found ('${filePath}')`);
    return { };
  }
}
