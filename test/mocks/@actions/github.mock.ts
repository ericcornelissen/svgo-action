/* eslint-disable @typescript-eslint/explicit-function-return-type */

import * as prPayloads from "../../fixtures/pull-request-payloads.json";
import * as contentPayloads from "../../fixtures/contents-payloads.json";


export const PR_NO_CHANGES = 1;
export const PR_ADD_SVG = 2;
export const PR_MODIFY_SVG = 3;
export const PR_REMOVE_SVG = 4;
export const PR_ADD_MODIFY_REMOVE_SVG = 5;
export const PR_ADD_SVG_MODIFY_FILE = 6;

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

export const GitHub = jest.fn(() => {
  return {
    pulls: {
      listFiles: async ({ pull_number: prNumber }) => {
        switch (prNumber) {
          case PR_ADD_SVG:
            return { data: prPayloads["1 SVG added"] };
          case PR_MODIFY_SVG:
            return { data: prPayloads["1 SVG modified"] };
          case PR_REMOVE_SVG:
            return { data: prPayloads["1 SVG removed"] };
          case PR_ADD_MODIFY_REMOVE_SVG:
            return { data: prPayloads["1 SVG added, 1 SVG modified, 1 SVG removed"] };
          case PR_ADD_SVG_MODIFY_FILE:
            return { data: prPayloads["1 SVG added, 1 file modified"] };
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
}).mockName("github.GitHub");
