/* eslint-disable @typescript-eslint/explicit-function-return-type */

import * as prPayloads from "../../fixtures/pull-request-payloads.json";
import * as contentPayloads from "../../fixtures/contents-payloads.json";


export const PR_WITH_NO_CHANGES = 1;
export const PR_WITH_ONE_SVG_CHANGED = 2;

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
        if (prNumber === PR_WITH_ONE_SVG_CHANGED) {
          return { data: prPayloads["1 SVG added"] };
        } else {
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
