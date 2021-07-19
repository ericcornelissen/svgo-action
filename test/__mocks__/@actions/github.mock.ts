import { GitHub } from "../../../src/types";

type GitHubMock = jest.Mocked<GitHub>;

type Params = {
  readonly context?: {
    readonly eventName?: string;
  };
};

function createGitHubMock(params?: Params): GitHubMock {
  return {
    context: {
      eventName: params?.context?.eventName || "push",
      payload: {
        // TODO
      },
      repo: {
        owner: "pikachu",
        repo: "pokédex",
      },
    },
    getOctokit: jest.fn()
      .mockImplementation(() => {
        return {
          rest: {
            pulls: {
              listFiles: jest.fn()
                .mockReturnValue([])
                .mockName("client.rest.pulls.listFiles"),
            },
          },
        };
      })
      .mockName("github.getOctokit"),
  };
}

export {
  createGitHubMock,
};
