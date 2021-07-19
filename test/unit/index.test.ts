import * as core from "../__mocks__/@actions/core.mock";
import * as github from "../__mocks__/@actions/github.mock";

const mainMock = jest.fn().mockName("main");

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);
jest.mock("../../src/main", () => mainMock);

import "../../src/index";

test("action initialization", () => {
  expect(mainMock).toHaveBeenCalledWith({
    core,
    github,
  });
});
