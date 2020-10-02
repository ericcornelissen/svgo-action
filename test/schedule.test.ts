import contentPayloads from "./fixtures/contents-payloads.json";

import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";
import * as githubAPI from "./mocks/github-api.mock";
import * as inputs from "./mocks/inputs.mock";
import * as svgoImport from "./mocks/svgo.mock";

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);
jest.mock("../src/github-api", () => githubAPI);

import {
  INPUT_NAME_REPO_TOKEN,
  GIT_OBJECT_TYPE_DIR,
  GIT_OBJECT_TYPE_FILE,
  STATUS_ADDED,
} from "../src/constants";
import main from "../src/events/schedule";


const token = core.getInput(INPUT_NAME_REPO_TOKEN, { required: true });
const client = github.getOctokit(token);
const config = new inputs.ActionConfig();
const svgo = new svgoImport.SVGOptimizer();

const getContentMockBackup = client.repos.getContent;


beforeEach(() => {
  core.debug.mockClear();
  core.error.mockClear();
  core.info.mockClear();
  core.setFailed.mockClear();
  core.warning.mockClear();

  githubAPI.commitFiles.mockClear();
  githubAPI.createBlob.mockClear();

  svgoImport.OptimizerInstance.optimize.mockClear();
});

describe("Logging", () => {

  test("does some debug logging", async () => {
    await main(client, config, svgo);
    expect(core.debug).toHaveBeenCalled();
  });

  test("summary for commits with 1 optimized SVG", async () => {
    client.repos.getContent.mockImplementationOnce(({ path }) => {
      return{
        "": {
          data: [
            { path: "bar.svg", status: STATUS_ADDED, type: GIT_OBJECT_TYPE_FILE },
          ],
        },
      }[path];
    });

    await main(client, config, svgo);
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 1/1 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("0/1 SVG(s) skipped"));
  });

  test("summary for commits with 1 skipped SVG", async () => {
    client.repos.getContent.mockImplementationOnce(({ path }) => {
      return {
        "": {
          data: [
            { path: "optimized.svg", status: STATUS_ADDED, type: GIT_OBJECT_TYPE_FILE },
          ],
        },
      }[path];
    });

    await main(client, config, svgo);
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 0/1 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("1/1 SVG(s) skipped"));
  });

  test("summary for commits with many changes", async () => {
    client.repos.getContent.mockImplementation(({ path }) => {
      return {
        "": {
          data: [
            { path: "dir", status: STATUS_ADDED, type: GIT_OBJECT_TYPE_DIR },
            { path: "foo.svg", status: STATUS_ADDED, type: GIT_OBJECT_TYPE_FILE },
          ],
        },
        "dir": {
          data: [
            { path: "bar.svg", status: STATUS_ADDED, type: GIT_OBJECT_TYPE_FILE },
            { path: "optimized.svg", status: STATUS_ADDED, type: GIT_OBJECT_TYPE_FILE },
          ],
        },
        "foo.svg": {
          data: contentPayloads.files["foo.svg"],
        },
        "bar.svg": {
          data: contentPayloads.files["bar.svg"],
        },
        "optimized.svg": {
          data: contentPayloads.files["optimized.svg"],
        },
      }[path];
    });

    await main(client, config, svgo);
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 2/3 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("1/3 SVG(s) skipped"));
  });

  test("don't log an error when everything is fine", async () => {
    await main(client, config, svgo);
    expect(core.error).not.toHaveBeenCalled();
  });

  test("don't set a failed state when everything is fine", async () => {
    await main(client, config, svgo);
    expect(core.setFailed).not.toHaveBeenCalled();
  });

});

afterEach(() => {
  client.repos.getContent = getContentMockBackup;
});
