/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { Octokit } from "@octokit/core";

import * as contentPayloads from "../../fixtures/contents-payloads.json";
import * as prPayloads from "../../fixtures/pull-request-payloads.json";


export enum PR_NUMBER {
  NO_CHANGES,
  MANY_CHANGES,
  ADD_SVG,
  MODIFY_SVG,
  REMOVE_SVG,
  ADD_MODIFY_REMOVE_SVG,
  ADD_SVG_AND_SVG_IN_DIR,
  ADD_FILE,
  MODIFY_FILE,
  REMOVE_FILE,
  ADD_SVG_MODIFY_FILE,
  ADD_FILE_MODIFY_SVG,
  ADD_SVG_REMOVE_FILE,
  ADD_FILE_REMOVE_SVG,
  ADD_OPTIMIZED_SVG,
  ADD_FAKE_SVG,

  NO_COMMENTS,
  ONE_COMMENT,
  TEN_COMMENTS,
  ELEVEN_COMMENTS,
  SEVENTEEN_COMMENTS,
  ONE_HUNDRED_AND_THREE_COMMENTS,
}

export const context = {
  payload: {
    pull_request: {
      head: {
        ref: "branch-name",
      },
      number: PR_NUMBER.NO_CHANGES,
    },
    repository: {
      commits_url: "https://api.github.com/repos/pikachu/svgo-action/git/commits{/sha}",
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
            message: "This is a commit message",
            tree: {
              sha: "298affe25970000345fadcc342ccc34234ff23ab",
            },
          },
        };
      })
      .mockName("GitHub.git.getCommit"),
    getRef: jest.fn()
      .mockImplementation(async ({ ref }) => {
        if (ref.endsWith("undefined")) throw new Error("Invalid ref");

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
  issues: {
    createComment: jest.fn()
      .mockName("GitHub.issues.createComment"),
    listComments: jest.fn()
      .mockImplementation(async ({
        issue_number: prNumber,
        per_page: perPage,
        page,
      }) => {
        const generateComments = function(length) {
          return Array.from({ length }).map((_, i) => ({ body: `${i}` }));
        };

        let allComments: unknown[];
        switch (prNumber) {
          case PR_NUMBER.NO_COMMENTS:
            allComments = [ ];
            break;
          case PR_NUMBER.ONE_COMMENT:
            allComments = generateComments(1);
            break;
          case PR_NUMBER.TEN_COMMENTS:
            allComments = generateComments(10);
            break;
          case PR_NUMBER.ELEVEN_COMMENTS:
            allComments = generateComments(11);
            break;
          case PR_NUMBER.SEVENTEEN_COMMENTS:
            allComments = generateComments(17);
            break;
          case PR_NUMBER.ONE_HUNDRED_AND_THREE_COMMENTS:
            allComments = generateComments(103);
            break;
          default:
            return { };
        }

        const sliceStart = page * perPage;
        const sliceEnd = (page + 1) * perPage;
        return { data: allComments.slice(sliceStart, sliceEnd) };
      })
      .mockName("GitHub.issues.listComments"),
  },
  pulls: {
    get: jest.fn()
      .mockImplementation(async ({ pull_number: prNumber }) => {
        switch (prNumber) {
          case PR_NUMBER.NO_COMMENTS:
            return { data: { comments: 0 } };
          case PR_NUMBER.ONE_COMMENT:
            return { data: { comments: 1 } };
          case PR_NUMBER.TEN_COMMENTS:
            return { data: { comments: 10 } };
          case PR_NUMBER.ELEVEN_COMMENTS:
            return { data: { comments: 11 } };
          case PR_NUMBER.SEVENTEEN_COMMENTS:
            return { data: { comments: 17 } };
          case PR_NUMBER.ONE_HUNDRED_AND_THREE_COMMENTS:
            return { data: { comments: 103 } };
          default:
            return { };
        }
      })
      .mockName("GitHub.pulls.get"),
    listFiles: jest.fn()
      .mockImplementation(async ({ pull_number: prNumber }) => {
        switch (prNumber) {
          case PR_NUMBER.NO_CHANGES:
            return { data: [ ] };
          case PR_NUMBER.MANY_CHANGES:
            return { data: prPayloads["many changes"] };
          case PR_NUMBER.ADD_SVG:
            return { data: prPayloads["add 1 SVG"] };
          case PR_NUMBER.MODIFY_SVG:
            return { data: prPayloads["modify 1 SVG"] };
          case PR_NUMBER.REMOVE_SVG:
            return { data: prPayloads["remove 1 SVG"] };
          case PR_NUMBER.ADD_MODIFY_REMOVE_SVG:
            return { data: prPayloads["add 1 SVG, modify 1 SVG, remove 1 SVG"] };
          case PR_NUMBER.ADD_SVG_AND_SVG_IN_DIR:
            return { data: prPayloads["add 1 SVG, add 1 SVG in dir"] };
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
          case PR_NUMBER.ADD_FAKE_SVG:
            return { data: prPayloads["add fake SVG"] };
          default:
            return { };
        }
      })
      .mockName("GitHub.pulls.listFiles"),
  },
  repos: {
    getContents: jest.fn()
      .mockImplementation(async ({ path }) => {
        return { data: contentPayloads[path] };
      })
      .mockName("GitHub.repos.getContents"),
  },
};

export function getOctokit(_: string): Octokit {
  return (GitHubInstance as unknown) as Octokit;
}
