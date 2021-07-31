const context = {
  eventName: "push",
  payload: { },
  repo: {
    owner: "pikachu",
    repo: "pokédex",
  },
};

const getOctokit = jest.fn()
  .mockImplementation(() => {
    return {
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
    };
  })
  .mockName("github.getOctokit");

export {
  context,
  getOctokit,
};
