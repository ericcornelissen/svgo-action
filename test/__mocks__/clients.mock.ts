import clients from "../../src/clients";

type NewMock = jest.MockedFunction<typeof clients.New>;

const New: NewMock = jest.fn()
  .mockReturnValue([{ }, null])
  .mockName("clients.New");

export default {
  New,
};

export const _sampleClient = {
  pulls: {
    listFiles: jest.fn()
      .mockName("GitHubClient.pulls.listFiles"),
  },
};
