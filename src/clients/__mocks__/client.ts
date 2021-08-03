const Client = jest.fn()
  .mockReturnValue({
    commits: {
      listFiles: jest.fn()
        .mockReturnValue([[], null])
        .mockName("Client.commits.listFiles"),
    },
    pulls: {
      listFiles: jest.fn()
        .mockReturnValue([[], null])
        .mockName("Client.pulls.listFiles"),
    },
  })
  .mockName("Client.[constructor]");

export default Client;
