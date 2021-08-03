import { when, resetAllWhenMocks } from "jest-when";
import { mocked } from "ts-jest/utils";

import inp from "../../__common__/inputter.mock";

jest.mock("../../../src/clients/client");
jest.mock("../../../src/errors");

import _Client from "../../../src/clients/client";

const Client = mocked(_Client);

import clients from "../../../src/clients/index";

describe("clients/index.ts", () => {
  let github, getOctokit;

  beforeAll(() => {
    getOctokit = jest.fn().mockName("getOctokit");
    github = { getOctokit };
  });

  beforeEach(() => {
    inp.getInput.mockReset();
    getOctokit.mockReset();

    resetAllWhenMocks();
  });

  describe("::New", () => {
    function doMockGetInputRepoToken(fn: () => string): void {
      when(inp.getInput)
        .calledWith("repo-token", expect.anything())
        .mockImplementation(fn);
    }

    test("create client", () => {
      const client = { foo: "bar" };

      doMockGetInputRepoToken(() => "token");
      getOctokit.mockReturnValue(client);

      const [result, err] = clients.New({ github, inp });

      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(Client).toHaveBeenCalledTimes(1);
    });

    test.each(["foo", "bar"])("get repo-token (token: '%s')", (token) => {
      doMockGetInputRepoToken(() => token);

      const [, err] = clients.New({ github, inp });

      expect(err).toBeNull();
      expect(getOctokit).toHaveBeenCalledWith(token);
    });

    test("no repo-token", () => {
      doMockGetInputRepoToken(() => { throw new Error(); });

      const [, err] = clients.New({ github, inp });

      expect(err).not.toBeNull();
    });
  });
});
