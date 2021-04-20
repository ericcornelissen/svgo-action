/* eslint-disable @typescript-eslint/explicit-function-return-type */

import type { Context } from "@actions/github/lib/context";

import { Octokit } from "@octokit/core";

import { EVENT_PULL_REQUEST } from "../../../src/constants";

const BASE_CONTEXT: Context = {
  action: "bar",
  actor: "Foobar",
  eventName: EVENT_PULL_REQUEST,
  issue: {
    owner: "pickachu",
    repo: "svgo-action",
    number: 36,
  },
  job: "foobar",
  runNumber: 42,
  runId: 3.14,
  payload: {
    commits: [{}],
    pull_request: {
      head: {
        ref: "branch-name",
        sha: "60e82798538f1853144300adaaa00650c9a6ab4d",
      },
      number: 0,
    },
    ref: "refs/head/develop",
  },
  repo: {
    owner: "pickachu",
    repo: "svgo-action",
  },
  ref: "branch-name",
  sha: "60e82798538f1853144300adaaa00650c9a6ab4d",
  workflow: "foo",
};

function anyAreUndefined(values: unknown[]): boolean {
  for (const value of values) {
    if (value === undefined) {
      return true;
    }
  }

  return false;
}

export enum PR_NUMBER {
  NO_COMMENTS,
  ONE_COMMENT,
  TEN_COMMENTS,
  ELEVEN_COMMENTS,
  SEVENTEEN_COMMENTS,
  ONE_HUNDRED_AND_THREE_COMMENTS,
}

export const GitHubInstance = {
  git: {
    getCommit: jest.fn()
      .mockImplementation(async ({ owner, repo, commit_sha }) => {
        if (anyAreUndefined([owner, repo, commit_sha])) {
          throw Error("Missing parameter(s)");
        }

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
      .mockImplementation(async ({ owner, repo, ref }) => {
        if (anyAreUndefined([owner, repo, ref])) {
          throw Error("Missing parameter(s)");
        }

        if (ref.endsWith("undefined")) {
          throw new Error("Invalid ref");
        }

        return {
          data: {
            object: {
              sha: "b7d615e1cc52b25023c4bd1cbad1a2ce246009cd",
            },
          },
        };
      })
      .mockName("GitHub.git.getRef"),
  },
  issues: {
    createComment: jest.fn()
      .mockImplementation(async ({ owner, repo, issue_number, body }) => {
        if (anyAreUndefined([owner, repo, issue_number, body])) {
          throw Error("Missing parameter(s)");
        }
      })
      .mockName("GitHub.issues.createComment"),
    listComments: jest.fn()
      .mockImplementation(async ({
        owner,
        repo,
        issue_number: prNumber,
        per_page: perPage,
        page,
      }) => {
        if (anyAreUndefined([owner, repo, prNumber, perPage, page])) {
          throw Error("Missing parameter(s)");
        }

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
      .mockImplementation(async ({ owner, repo, pull_number: prNumber }) => {
        if (anyAreUndefined([owner, repo, prNumber])) {
          throw Error("Missing parameter(s)");
        }

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
  },
};

export function getOctokit(_: string): Octokit {
  return GitHubInstance as unknown as Octokit;
}

export function MockContext(values?: {
  eventName?: string,
  payload?: {
    commits?: { message: string }[],
    pull_request?: null | {
      number?: number,
    },
  },
}): Context {
  return Object.assign(BASE_CONTEXT, values);
}
