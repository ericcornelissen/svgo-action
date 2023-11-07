// SPDX-License-Identifier: MIT

const context = {
  eventName: "push",
  payload: {
    commits: [
      { id: "commit-1" },
    ],
    pull_request: {
      number: 42,
    },
  },
  repo: {
    owner: "pikachu",
    repo: "pokédex",
  },
};

const getOctokit = jest.fn()
  .mockReturnValue({
    rest: {
      repos: {
        getCommit: jest.fn()
          .mockReturnValue({ data: { files: [] } })
          .mockName("Octokit.rest.repos.getCommit"),
      },
      pulls: {
        listFiles: jest.fn()
          .mockReturnValue({ data: [] })
          .mockName("Octokit.rest.pulls.listFiles"),
      },
    },
  })
  .mockName("github.getOctokit");

export {
  context,
  getOctokit,
};
