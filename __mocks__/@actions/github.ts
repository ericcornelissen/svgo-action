const context = {
  eventName: "push",
  payload: { },
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
          .mockReturnValue({ })
          .mockName("Octokit.rest.repos.getCommit"),
      },
      pulls: {
        listFiles: jest.fn()
          .mockReturnValue([])
          .mockName("Octokit.rest.pulls.listFiles"),
      },
    },
  })
  .mockName("github.getOctokit");

export {
  context,
  getOctokit,
};
