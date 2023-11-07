// SPDX-License-Identifier: MIT

import type {
  CommitsListFilesParams,
  PullsListFilesParams,
} from "../../../src/clients/types";

jest.mock("../../../src/errors");

import StubClient from "../../../src/clients/stub";

describe("clients/stub.ts", () => {
  describe("::commits", () => {
    describe("::listFiles", () => {
      const options: CommitsListFilesParams = {
        owner: "",
        ref: "",
        repo: "",
      };

      test("return an empty list", async () => {
        const [result] = await StubClient.commits.listFiles(options);
        expect(result).not.toBeNull();
        expect(result).toEqual([]);
      });

      test("return an error", async () => {
        const [, err] = await StubClient.commits.listFiles(options);
        expect(err).not.toBeNull();
        expect(err).toBe("invalid Client instance");
      });
    });
  });

  describe("::pulls", () => {
    describe("::listFiles", () => {
      const options: PullsListFilesParams = {
        owner: "",
        pullNumber: 0,
        repo: "",
      };

      test("return an empty list", async () => {
        const [result] = await StubClient.pulls.listFiles(options);
        expect(result).not.toBeNull();
        expect(result).toEqual([]);
      });

      test("return an error", async () => {
        const [, err] = await StubClient.pulls.listFiles(options);
        expect(err).not.toBeNull();
        expect(err).toBe("invalid Client instance");
      });
    });
  });
});
