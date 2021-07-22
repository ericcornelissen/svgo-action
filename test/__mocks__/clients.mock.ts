import clients from "../../src/clients";

type NewMock = jest.MockedFunction<typeof clients.New>;

const New: NewMock = jest.fn()
  .mockReturnValue([{ }, null])
  .mockName("clients.New");

export default {
  New,
};

export const _sampleClient = {
  commits: {
    listFiles: jest.fn()
      .mockResolvedValue([[], null])
      .mockName("GitHubClient.commits.listFiles"),
  },
  pulls: {
    listFiles: jest.fn()
      .mockResolvedValue([[], null])
      .mockName("GitHubClient.pulls.listFiles"),
  },
};
