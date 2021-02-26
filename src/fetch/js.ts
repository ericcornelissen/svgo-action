/* eslint-disable security/detect-eval-with-expression */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as core from "@actions/core";
import { Octokit } from "@octokit/core";

import { decode } from "../encoder";
import { getFile } from "../github-api";


export async function fetchJsFile(
  client: Octokit,
  ref: string,
  filePath: string,
): Promise<any> {
  try {
    const { content, encoding } = await getFile(client, ref, filePath);
    core.debug(`found '${filePath}', decoding and loading JavaScript`);

    const rawJavaScript: string = decode(content, encoding);
    return eval(rawJavaScript);
  } catch (_) {
    core.debug(`file not found ('${filePath}')`);
    return {};
  }
}
