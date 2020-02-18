/* eslint-disable @typescript-eslint/explicit-function-return-type */

import * as contentPayloads from "../../fixtures/contents-payloads.json";
import * as prPayloads from "../../fixtures/pull-request-payloads.json";


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
      head: {
        ref: "branch-name",
      },
      number: 36,
    },
    repository: {
      commits_url: "https://api.github.com/repos/ericcornelissen/svgo-action/git/commits{/sha}", /* eslint-disable-line @typescript-eslint/camelcase */
    },
  },
  repo: {
    owner: "pickachu",
    repo: "svgo-action",
  },
};

export const GitHubInstance = {
  git: {
    createBlob: jest.fn()
      .mockImplementation(async () => {
        return {
          data: {
            sha: "b23aa12490660754aff4920ff23909dc324cc1dd",
          },
        };
      })
      .mockName("GitHub.git.createBlob"),
    createCommit: jest.fn()
      .mockImplementation(async () => {
        return {
          data: {
            sha: "8482592589d34923489284f3940776702123aaf3",
          },
        };
      })
      .mockName("GitHub.git.createCommit"),
    createTree: jest.fn()
      .mockImplementation(async () => {
        return {
          data: {
            sha: "ccaf32432ff32754aff4920ff23909dc33788965",
          },
        };
      })
      .mockName("GitHub.git.createTree"),
    getCommit: jest.fn()
      .mockImplementation(async () => {
        return {
          data: {
            tree: {
              sha: "298affe25970000345fadcc342ccc34234ff23ab",
            },
          },
        };
      })
      .mockName("GitHub.git.getCommit"),
    getRef: jest.fn()
      .mockImplementation(async () => {
        return {
          data: {
            object: {
              sha: "b7d615e1cc52b25023c4bd1cbad1a2ce246009cd",
            },
          },
        };
      })
      .mockName("GitHub.git.getRef"),
    updateRef: jest.fn()
      .mockImplementation(async () => {
        return {
          data: {
            object: {
              sha: "298344829ff134aafdddc342cc324da2334faaaa",
            },
          },
        };
      })
      .mockName("GitHub.git.updateRef"),
  },
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

export const GitHub = jest.fn()
  .mockReturnValue(GitHubInstance)
  .mockName("github.GitHub");
