/* eslint-disable security/detect-eval-with-expression */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as core from "@actions/core";

import nodeEval from "node-eval";

import { decode } from "../encoder";
import { getFile } from "../github-api";
import { Octokit } from "../types";


export async function fetchJsFile(
  client: Octokit,
  ref: string,
  filePath: string,
): Promise<any> {
  try {
    const { content, encoding } = await getFile(client, ref, filePath);
    core.debug(`found '${filePath}', decoding and loading JavaScript`);

    const rawJavaScript: string = decode(content, encoding);
    return nodeEval(rawJavaScript);
  } catch (_) {
    core.debug(`file not found ('${filePath}')`);
    return {};
  }
}
