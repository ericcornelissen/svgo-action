// SPDX-License-Identifier: MIT

jest.mock("@actions/core");
jest.mock("@actions/github");
jest.mock("../../src/main");

import * as core from "@actions/core";
import * as github from "@actions/github";

import main from  "../../src/main";
import "../../src/index"; // eslint-disable-line import/order

describe("index.ts", () => {
  test("action initialization", () => {
    expect(main).toHaveBeenCalledWith({
      core,
      github,
    });
  });
});
