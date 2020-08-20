import { format as strFormat } from "util";

import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";
import { COMMIT_SHA } from "./mocks/@actions/github.mock";
import * as githubAPI from "./mocks/github-api.mock";
import * as inputs from "./mocks/inputs.mock";
import * as svgoImport from "./mocks/svgo.mock";

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);
jest.mock("../src/github-api", () => githubAPI);

import { INPUT_NAME_REPO_TOKEN } from "../src/constants";
import main from "../src/events/push";


const token = core.getInput(INPUT_NAME_REPO_TOKEN, { required: true });
const client = github.getOctokit(token);
const config = new inputs.ActionConfig();
const svgo = new svgoImport.SVGOptimizer();


beforeEach(() => {
  core.debug.mockClear();
  core.error.mockClear();
  core.info.mockClear();
  core.setFailed.mockClear();

  githubAPI.commitFiles.mockClear();
});

describe("Logging", () => {

  test("does some debug logging", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];

    await main(client, config, svgo);
    expect(core.debug).toHaveBeenCalled();
  });

  test("summary for a Pull Request with 1 optimized SVG", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];

    await main(client, config, svgo);
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 1/1 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("0/1 SVG(s) skipped"));
  });

  test("summary for a Pull Request with 1 skipped SVG", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_OPTIMIZED_SVG }];

    await main(client, config, svgo);
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 0/1 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("1/1 SVG(s) skipped"));
  });

  test("summary for a Pull Request with many changes", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.MANY_CHANGES }];

    await main(client, config, svgo);
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 3/4 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("1/4 SVG(s) skipped"));
  });

  test("don't log an error when everything is fine", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];

    await main(client, config, svgo);
    expect(core.error).not.toHaveBeenCalled();
  });

  test("don't set a failed state when everything is fine", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];

    await main(client, config, svgo);
    expect(core.setFailed).not.toHaveBeenCalled();
  });

});

describe("Manual Action control", () => {

  test.each([
    ["But why is the rum gone"],
    ["It's dangerous to go alone!"],
    ["Praise the sun"],
  ])("commit messages that don't disable the Action", async (message) => {
    github.context.payload.commits = [{
      id: COMMIT_SHA.ADD_SVG,
      message: message,
    }];

    await main(client, config, svgo);
    expect(core.info).not.toHaveBeenCalledWith(expect.stringContaining("disabled"));
  });

  test.each([
    ["%s"],
    ["Let's disable the action! (%s)"],
    ["Hello %s world!"],
    ["%s\nYip Yip!"],
  ])("commit messages that *do* disable the Action", async (messageTemplate) => {
    github.context.payload.commits = [{
      id: COMMIT_SHA.ADD_SVG,
      message: strFormat(messageTemplate, "disable-svgo-action"),
    }];

    await main(client, config, svgo);
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("disabled"));
  });

});
