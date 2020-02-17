/* eslint-disable @typescript-eslint/explicit-function-return-type */

import * as prPayloads from "../../fixtures/pull-request-payloads.json";
import * as contentPayloads from "../../fixtures/contents-payloads.json";


export enum PR_NUMBER {
  NO_CHANGES,
  MANY_CHANGES,
  ADD_SVG,
  MODIFY_SVG,
  REMOVE_SVG,
  ADD_MODIFY_REMOVE_SVG,
  ADD_FILE,
  MODIFY_FILE,
  REMOVE_FILE,
  ADD_SVG_MODIFY_FILE,
  ADD_FILE_MODIFY_SVG,
  ADD_SVG_REMOVE_FILE,
  ADD_FILE_REMOVE_SVG,
  ADD_OPTIMIZED_SVG,
}

export const context = {
  payload: {
    pull_request: { /* eslint-disable-line @typescript-eslint/camelcase */
      number: 36,
    },
  },
  repo: {
    owner: "pickachu",
    repo: "svgo-action",
  },
};

export const GitHubInstance = {
  pulls: {
    listFiles: async ({ pull_number: prNumber }) => {
      switch (prNumber) {
        case PR_NUMBER.ADD_SVG:
          return { data: prPayloads["add 1 SVG"] };
        case PR_NUMBER.MANY_CHANGES:
          return { data: prPayloads["add 1 SVG, modify 2 SVGs, remove 1 SVG, add 1 file, modify 1 file"] };
        case PR_NUMBER.MODIFY_SVG:
          return { data: prPayloads["modify 1 SVG"] };
        case PR_NUMBER.REMOVE_SVG:
          return { data: prPayloads["remove 1 SVG"] };
        case PR_NUMBER.ADD_MODIFY_REMOVE_SVG:
          return { data: prPayloads["add 1 SVG, modify 1 SVG, remove 1 SVG"] };
        case PR_NUMBER.ADD_FILE:
          return { data: prPayloads["add 1 file"] };
        case PR_NUMBER.MODIFY_FILE:
          return { data: prPayloads["modify 1 file"] };
        case PR_NUMBER.REMOVE_FILE:
          return { data: prPayloads["remove 1 file"] };
        case PR_NUMBER.ADD_SVG_MODIFY_FILE:
          return { data: prPayloads["add 1 SVG, modify 1 file"] };
        case PR_NUMBER.ADD_FILE_MODIFY_SVG:
          return { data: prPayloads["add 1 file, modify 1 SVG"] };
        case PR_NUMBER.ADD_SVG_REMOVE_FILE:
          return { data: prPayloads["add 1 SVG, remove 1 file"] };
        case PR_NUMBER.ADD_FILE_REMOVE_SVG:
          return { data: prPayloads["add 1 file, remove 1 SVG"] };
        case PR_NUMBER.ADD_OPTIMIZED_SVG:
          return { data: prPayloads["add 1 optimized SVG"] };
        default:
          return { data: [] };
      }
    },
  },
  repos: {
    getContents: async ({ path }) => {
      return { data: contentPayloads[path] };
    },
  },
};

export const GitHub = jest.fn().mockReturnValue(GitHubInstance).mockName("github.GitHub");
