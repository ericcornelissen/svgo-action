import { when } from "jest-when";

import inp from "../../__mocks__/inputter.mock";

const ClientMock = jest.fn().mockName("ClientMock constructor");

jest.mock("../../../src/clients/client", () => ClientMock);

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
      expect(ClientMock).toHaveBeenCalledTimes(1);
    });

    test.each(["foo", "bar"])("get repo-token (token: %s)", (token) => {
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
