import { format as strFormat } from "util";

import contentPayloads from "./fixtures/contents-payloads.json";
import files from "./fixtures/file-data.json";

import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";
import { COMMIT_SHA } from "./mocks/@actions/github.mock";
import * as encoder from "./mocks/encoder.mock";
import * as githubAPI from "./mocks/github-api.mock";
import * as inputs from "./mocks/inputs.mock";
import * as svgoImport from "./mocks/svgo.mock";
import * as templating from "./mocks/templating.mock";

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);
jest.mock("../src/encoder", () => encoder);
jest.mock("../src/github-api", () => githubAPI);
jest.mock("../src/templating", () => templating);

import { INPUT_NAME_REPO_TOKEN } from "../src/constants";
import main from "../src/events/push";


const token = core.getInput(INPUT_NAME_REPO_TOKEN, { required: true });
const client = github.getOctokit(token);
const config = new inputs.ActionConfig();
const svgo = new svgoImport.SVGOptimizer();
const headRef = github.context.payload.ref.replace("refs/", "");


beforeEach(() => {
  core.debug.mockClear();
  core.error.mockClear();
  core.info.mockClear();
  core.setFailed.mockClear();
  core.warning.mockClear();

  encoder.decode.mockClear();
  encoder.encode.mockClear();

  githubAPI.commitFiles.mockClear();
  githubAPI.createBlob.mockClear();

  svgoImport.OptimizerInstance.optimize.mockClear();
});

describe("Logging", () => {

  test("does some debug logging", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];

    await main(client, config, svgo);
    expect(core.debug).toHaveBeenCalled();
  });

  test("summary for commits with 1 optimized SVG", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];

    await main(client, config, svgo);
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 1/1 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("0/1 SVG(s) skipped"));
  });

  test("summary for commits with 1 skipped SVG", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_OPTIMIZED_SVG }];

    await main(client, config, svgo);
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 0/1 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("1/1 SVG(s) skipped"));
  });

  test("summary for commits with many changes", async () => {
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

describe("Configuration", () => {

  test("dry mode enabled", async () => {
    const actionConfig = new inputs.ActionConfig();
    actionConfig.isDryRun = true;

    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];

    await main(client, actionConfig, svgo);

    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("dry mode disabled", async () => {
    const actionConfig = new inputs.ActionConfig();
    actionConfig.isDryRun = false;

    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];

    await main(client, actionConfig, svgo);

    expect(githubAPI.commitFiles).toHaveBeenCalled();
  });

  test.each([
    "This should be a commit title",
    "Why not Zoidberg",
    "A templated commit title? {{optimizedCount}}",
  ])("custom commit message title (%s)", async (commitTitle) => {
    const actionConfig = new inputs.ActionConfig();
    actionConfig.commitTitle = commitTitle;

    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];

    await main(client, actionConfig, svgo);

    expect(templating.formatCommitMessage).toHaveBeenCalledWith(
      commitTitle,
      expect.any(String),
      expect.any(Object),
    );
  });

  test.each([
    "This should be a commit body",
    "Shut up and take my money",
    "A templated commit title? {{filesList}}",
  ])("custom commit message body (%s)", async (commitBody) => {
    const actionConfig = new inputs.ActionConfig();
    actionConfig.commitBody = commitBody;

    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];

    await main(client, actionConfig, svgo);

    expect(templating.formatCommitMessage).toHaveBeenCalledWith(
      expect.any(String),
      commitBody,
      expect.any(Object),
    );
  });

  test("conventional-commits are enabled", async () => {
    const actionConfig = new inputs.ActionConfig();
    actionConfig.commitTitle = "chore: optimize {{optimizedCount}} SVG(s)";

    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];

    await main(client, actionConfig, svgo);

    expect(templating.formatCommitMessage).toHaveBeenCalledWith(
      actionConfig.commitTitle,
      expect.any(String),
      expect.any(Object),
    );
  });

  test("configure a glob to ignore files", async () => {
    const filePath = "foo.svg";
    const { content: fileContent, encoding: fileEncoding } = contentPayloads[filePath];
    const fooSvgData = files[filePath];

    const actionConfig = new inputs.ActionConfig();
    actionConfig.ignoreGlob = "foo/*";

    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG_AND_SVG_IN_DIR }];

    await main(client, actionConfig, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(fileContent, fileEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(fooSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), fileEncoding);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(1);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      filePath,
      expect.any(String),
      fileEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: filePath }),
      ]),
      headRef,
      expect.any(String),
    );
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

describe("Payloads", () => {

  const barFilePath = "bar.svg";
  const fooFilePath = "foo.svg";
  const testFilePath = "test.svg";

  const { content: barSvgContent, encoding: barSvgEncoding } = contentPayloads[barFilePath];
  const { content: fooSvgContent, encoding: fooSvgEncoding } = contentPayloads[fooFilePath];
  const { content: testSvgContent, encoding: testSvgEncoding } = contentPayloads[testFilePath];

  const barSvgData = files[barFilePath];
  const fooSvgData = files[fooFilePath];
  const testSvgData = files[testFilePath];

  test("commits with 1 new SVG", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];

    await main(client, config, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), testSvgEncoding);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(1);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      testFilePath,
      expect.any(String),
      testSvgEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: testFilePath }),
      ]),
      headRef,
      expect.any(String),
    );
  });

  test("commits with 1 modified SVG", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.MODIFY_SVG }];

    await main(client, config, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent, fooSvgEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(fooSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), fooSvgEncoding);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(1);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      fooFilePath,
      expect.any(String),
      fooSvgEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: fooFilePath }),
      ]),
      headRef,
      expect.any(String),
    );
  });

  test("commits with 1 removed SVG", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.REMOVE_SVG }];

    await main(client, config, svgo);

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgoImport.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("commits with 1 new, 1 modified, and 1 removed SVG", async () => {
    github.context.payload.commits = [
      { id: COMMIT_SHA.ADD_SVG },
      { id: COMMIT_SHA.MODIFY_SVG },
      { id: COMMIT_SHA.REMOVE_SVG },
    ];

    await main(client, config, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(2);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent, fooSvgEncoding);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(2);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(fooSvgData);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(2);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), fooSvgEncoding);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), testSvgEncoding);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(2);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      fooFilePath,
      expect.any(String),
      fooSvgEncoding,
    );
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      testFilePath,
      expect.any(String),
      testSvgEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: fooFilePath }),
        expect.objectContaining({ path: testFilePath }),
      ]),
      headRef,
      expect.any(String),
    );
  });

  test("commits with 1 new SVG and one new SVG in a directory", async () => {
    const foobarFilePath = "foo/bar.svg";

    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG_AND_SVG_IN_DIR }];

    await main(client, config, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(2);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent, fooSvgEncoding);
    expect(encoder.decode).toHaveBeenCalledWith(barSvgContent, barSvgEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(2);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(fooSvgData);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(barSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(2);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), fooSvgEncoding);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), barSvgEncoding);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(2);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      fooFilePath,
      expect.any(String),
      fooSvgEncoding,
    );
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      foobarFilePath,
      expect.any(String),
      barSvgEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: fooFilePath }),
        expect.objectContaining({ path: foobarFilePath }),
      ]),
      headRef,
      expect.any(String),
    );
  });

  test("commits with 1 new file", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_FILE }];

    await main(client, config, svgo);

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgoImport.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("commits with 1 modified file", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.MODIFY_FILE }];

    await main(client, config, svgo);

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgoImport.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("commits with 1 removed file", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.REMOVE_FILE }];

    await main(client, config, svgo);

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgoImport.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("commits with 1 new SVG and 1 modified file", async () => {
    github.context.payload.commits = [
      { id: COMMIT_SHA.ADD_SVG },
      { id: COMMIT_SHA.MODIFY_FILE },
    ];

    await main(client, config, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), testSvgEncoding);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(1);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      testFilePath,
      expect.any(String),
      testSvgEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: testFilePath }),
      ]),
      headRef,
      expect.any(String),
    );
  });

  test("commits with 1 new file and 1 modified SVG", async () => {
    github.context.payload.commits = [
      { id: COMMIT_SHA.ADD_FILE },
      { id: COMMIT_SHA.MODIFY_SVG },
    ];

    await main(client, config, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent, fooSvgEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(fooSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), fooSvgEncoding);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(1);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      fooFilePath,
      expect.any(String),
      fooSvgEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: fooFilePath }),
      ]),
      headRef,
      expect.any(String),
    );
  });

  test("commits with 1 new SVG and 1 deleted file", async () => {
    github.context.payload.commits = [
      { id: COMMIT_SHA.ADD_SVG },
      { id: COMMIT_SHA.REMOVE_FILE },
    ];

    await main(client, config, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), testSvgEncoding);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(1);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      testFilePath,
      expect.any(String),
      testSvgEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: testFilePath }),
      ]),
      headRef,
      expect.any(String),
    );
  });

  test("commits with 1 new file and 1 deleted SVG", async () => {
    github.context.payload.commits = [
      { id: COMMIT_SHA.ADD_FILE },
      { id: COMMIT_SHA.REMOVE_SVG },
    ];

    await main(client, config, svgo);

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgoImport.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("commits with multiple SVGs and multiple files", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.MANY_CHANGES }];

    await main(client, config, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(4);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent, fooSvgEncoding);
    expect(encoder.decode).toHaveBeenCalledWith(barSvgContent, barSvgEncoding);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(4);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(fooSvgData);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(barSvgData);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(3);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      fooFilePath,
      expect.any(String),
      fooSvgEncoding,
    );
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      barFilePath,
      expect.any(String),
      barSvgEncoding,
    );
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      testFilePath,
      expect.any(String),
      testSvgEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: fooFilePath }),
        expect.objectContaining({ path: barFilePath }),
        expect.objectContaining({ path: testFilePath }),
      ]),
      headRef,
      expect.any(String),
    );
  });

  test("commits with 1 optimized SVG", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_OPTIMIZED_SVG }];

    await main(client, config, svgo);

    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
    expect(core.debug).toHaveBeenCalledWith(expect.stringMatching(/skipping.*optimized.svg/));
  });

  test.each([
    COMMIT_SHA.NO_CHANGES,
    COMMIT_SHA.REMOVE_SVG,
    COMMIT_SHA.ADD_FILE,
    COMMIT_SHA.MODIFY_FILE,
  ])("no new or changed SVGs (%s)", async (commitId) => {
    github.context.payload.commits = [{ id: commitId }];

    await main(client, config, svgo);

    expect(svgoImport.OptimizerInstance.optimize).not.toHaveBeenCalled();
  });

  test("commits with a file removed THEN added", async () => {
    github.context.payload.commits = [
      { id: COMMIT_SHA.REMOVE_SVG_X },
      { id: COMMIT_SHA.ADD_SVG_X },
    ];

    await main(client, config, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), testSvgEncoding);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(1);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      testFilePath,
      expect.any(String),
      testSvgEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: testFilePath }),
      ]),
      headRef,
      expect.any(String),
    );
  });

  test("commits with a file added THEN removed", async () => {
    github.context.payload.commits = [
      { id: COMMIT_SHA.ADD_SVG_X },
      { id: COMMIT_SHA.REMOVE_SVG_X },
    ];

    await main(client, config, svgo);

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgoImport.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("commits with a file removed THEN added THEN removed", async () => {
    github.context.payload.commits = [
      { id: COMMIT_SHA.REMOVE_SVG_X },
      { id: COMMIT_SHA.ADD_SVG_X },
      { id: COMMIT_SHA.REMOVE_SVG_X },
    ];

    await main(client, config, svgo);

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgoImport.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("commits with a file added THEN modified", async () => {
    github.context.payload.commits = [
      { id: COMMIT_SHA.ADD_SVG_X },
      { id: COMMIT_SHA.MODIFY_SVG_X },
    ];

    await main(client, config, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), testSvgEncoding);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(1);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      testFilePath,
      expect.any(String),
      testSvgEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: testFilePath }),
      ]),
      headRef,
      expect.any(String),
    );
  });

});

describe("Error scenarios", () => {

  test("the commit files could not be found", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];
    githubAPI.getCommitFiles.mockRejectedValueOnce(new Error("Not found"));

    await expect(main(client, config, svgo)).rejects.toBeDefined();
  });

  test("an SVG file that does not contain SVG content", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_FAKE_SVG }];

    await main(client, config, svgo);

    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("cannot optimize"));

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(githubAPI.createBlob).toHaveBeenCalledTimes(0);
    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(0);
  });

  test("blob size is too large", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];
    githubAPI.getPrFile.mockImplementationOnce(() => { throw new Error("Blob too large"); });

    await main(client, config, svgo);

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining("SVG content could not be obtained"));
  });

  test("optimized blob size is too large", async () => {
    github.context.payload.commits = [{ id: COMMIT_SHA.ADD_SVG }];
    githubAPI.createBlob.mockImplementationOnce(() => { throw new Error("Blob too large"); });

    await main(client, config, svgo);

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining("Blob could not be created"));
  });

});
