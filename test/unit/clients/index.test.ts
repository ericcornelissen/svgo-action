import { when, resetAllWhenMocks } from "jest-when";

jest.mock("../../../src/clients/client");
jest.mock("../../../src/errors");

import Client from "../../../src/clients/client";
import clients from "../../../src/clients/index";
import inp from "../../__common__/inputter.mock";

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
        .calledWith("repo-token", expect.objectContaining({ required: true }))
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
      expect(err).toContain("missing");
    });
  });
});
