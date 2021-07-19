import { Client } from "../../../src/types";

export const getOctokit = jest.fn()
  .mockImplementation((): Client => {
    return {
      rest: {
        pulls: {
          listFiles: jest.fn().mockName("client.rest.pulls.listFiles"),
        },
      },
    };
  })
  .mockName("github.getOctokit");
