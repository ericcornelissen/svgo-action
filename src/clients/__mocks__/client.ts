// SPDX-License-Identifier: MIT

const files: Iterable<never> = [];

const Client = jest.fn()
  .mockReturnValue({
    commits: {
      listFiles: jest.fn()
        .mockReturnValue([files, null])
        .mockName("clients.Client.commits.listFiles"),
    },
    pulls: {
      listFiles: jest.fn()
        .mockReturnValue([files, null])
        .mockName("clients.Client.pulls.listFiles"),
    },
  })
  .mockName("clients.Client.[constructor]");

export default Client;
