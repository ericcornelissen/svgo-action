import contentPayloads from "./fixtures/contents-payloads.json";
import files from "./fixtures/file-data.json";

import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";
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

import {
  INPUT_NAME_REPO_TOKEN,
  GIT_OBJECT_TYPE_DIR,
  GIT_OBJECT_TYPE_FILE,
  OUTPUT_NAME_DID_OPTIMIZE,
  OUTPUT_NAME_OPTIMIZED_COUNT,
  OUTPUT_NAME_SKIPPED_COUNT,
  OUTPUT_NAME_SVG_COUNT,
  STATUS_ADDED,
} from "../src/constants";
import main from "../src/events/schedule";


function mockGetContentsForFiles(files: string[]) {
  const divider = "/";
  const root = "";
  const repo = {};
  repo[root] = { data: [] };

  for (const file of files) {
    const parts = file.split(divider);

    // Add file's first part to the root of the repo
    const first = parts[0];
    if (parts.length === 1) {
      repo[root].data.push({
        path: file,
        status: STATUS_ADDED,
        type: GIT_OBJECT_TYPE_FILE,
      });
    } else if (repo[root].data.findIndex(({ path }) => path === first) === -1) {
      repo[root].data.push({
        path: first,
        status: STATUS_ADDED,
        type: GIT_OBJECT_TYPE_DIR,
      });
    }

    // Add every directory leading up to the file to the repo.
    parts.slice(0, -1).forEach((_, index) => {
      const path = parts.slice(0, index + 1).join(divider);
      if (repo[path] === undefined) {
        repo[path] = { data: [] };
      }

      const childPath = parts.slice(0, index + 2).join(divider);
      if (index < parts.length - 2) {
        repo[path].data.push({
          path: childPath,
          status: STATUS_ADDED,
          type: GIT_OBJECT_TYPE_DIR,
        });
      } else if (repo[path].data.findIndex(({ path }) => path === childPath) === -1) {
        repo[path].data.push({
          path: childPath,
          status: STATUS_ADDED,
          type: GIT_OBJECT_TYPE_FILE,
        });
      }
    });

    // Add th file itself to the repo.
    const fileName: string = parts.pop() as string;
    let fileDir = parts.join(divider);
    if (parts.length > 0) fileDir += divider;
    repo[`${fileDir}${fileName}`] = { data: contentPayloads.files[fileName] };
  }

  return ({ path }) => repo[path];
}

const token = core.getInput(INPUT_NAME_REPO_TOKEN, { required: true });
const client = github.getOctokit(token);
const config = new inputs.ActionConfig();
const svgo = new svgoImport.SVGOptimizer();

const barFilePath = "bar.svg";
const fakeFilePath = "fake.svg";
const fooFilePath = "foo.svg";
const optimizedFilePath = "optimized.svg";
const testFilePath = "test.svg";

const getContentMockBackup = client.repos.getContent;


describe("Logging", () => {

  beforeEach(() => {
    core.debug.mockClear();
    core.error.mockClear();
    core.info.mockClear();
  });

  test("does some debug logging", async () => {
    await main(client, config, svgo);
    expect(core.debug).toHaveBeenCalled();
  });

  test("summary for commits with 1 optimized SVG", async () => {
    const getContentsMock = mockGetContentsForFiles([barFilePath]);
    client.repos.getContent.mockImplementation(getContentsMock);

    await main(client, config, svgo);
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 1/1 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("0/1 SVG(s) skipped"));
  });

  test("summary for commits with 1 skipped SVG", async () => {
    const getContentsMock = mockGetContentsForFiles([optimizedFilePath]);
    client.repos.getContent.mockImplementation(getContentsMock);

    await main(client, config, svgo);
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 0/1 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("1/1 SVG(s) skipped"));
  });

  test("summary for commits with many changes", async () => {
    const getContentsMock = mockGetContentsForFiles([
      fooFilePath,
      `dir/${barFilePath}`,
      `dir/${optimizedFilePath}`,
    ]);
    client.repos.getContent.mockImplementation(getContentsMock);

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

describe("Configuration", () => {

  beforeEach(() => {
    encoder.decode.mockClear();
    encoder.encode.mockClear();

    githubAPI.commitFiles.mockClear();
    githubAPI.createBlob.mockClear();

    svgoImport.OptimizerInstance.optimize.mockClear();

    templating.formatCommitMessage.mockClear();
  });

  test("custom branch", async () => {
    const actionConfig = new inputs.ActionConfig();
    actionConfig.branch = "foobar";

    await main(client, actionConfig, svgo);

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      client,
      expect.any(Object),
      `heads/${actionConfig.branch}`,
      expect.any(String),
    );
  });

  test("dry mode enabled", async () => {
    const actionConfig = new inputs.ActionConfig();
    actionConfig.isDryRun = true;

    await main(client, actionConfig, svgo);

    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("dry mode disabled", async () => {
    const actionConfig = new inputs.ActionConfig();
    actionConfig.isDryRun = false;

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

    await main(client, actionConfig, svgo);

    expect(templating.formatCommitMessage).toHaveBeenCalledWith(
      actionConfig.commitTitle,
      expect.any(String),
      expect.any(Object),
    );
  });

  test("configure a glob to ignore files", async () => {
    const fileContent = contentPayloads.files["foo.svg"].content;
    const fileEncoding = contentPayloads.files["foo.svg"].encoding;

    const getContentsMock = mockGetContentsForFiles([
      fooFilePath,
      `dir/${barFilePath}`,
      `dir/${optimizedFilePath}`,
    ]);
    client.repos.getContent.mockImplementation(getContentsMock);

    const actionConfig = new inputs.ActionConfig();
    actionConfig.ignoreGlob = "dir/*";

    await main(client, actionConfig, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(fileContent, fileEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(githubAPI.createBlob).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
  });

});

describe("Outputs", () => {

  const OUTPUTS_COUNT = 4;

  beforeEach(() => {
    core.setOutput.mockClear();
  });

  test(`${OUTPUT_NAME_DID_OPTIMIZE} is set to "true"`, async () => {
    const getContentsMock = mockGetContentsForFiles([fooFilePath]);
    client.repos.getContent.mockImplementation(getContentsMock);

    await main(client, config, svgo);

    expect(core.setOutput).toHaveBeenCalledTimes(OUTPUTS_COUNT);
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_DID_OPTIMIZE,
      "true",
    );
  });

  test(`${OUTPUT_NAME_DID_OPTIMIZE} is set to "false"`, async () => {
    const getContentsMock = mockGetContentsForFiles([]);
    client.repos.getContent.mockImplementation(getContentsMock);

    await main(client, config, svgo);

    expect(core.setOutput).toHaveBeenCalledTimes(OUTPUTS_COUNT);
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_DID_OPTIMIZE,
      "false",
    );
  });

  test(`${OUTPUT_NAME_OPTIMIZED_COUNT} is set correctly`, async () => {
    const getContentsMock = mockGetContentsForFiles([fooFilePath, barFilePath]);
    client.repos.getContent.mockImplementation(getContentsMock);

    await main(client, config, svgo);

    expect(core.setOutput).toHaveBeenCalledTimes(OUTPUTS_COUNT);
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_OPTIMIZED_COUNT,
      "2",
    );
  });

  test.each([
    [[fooFilePath, barFilePath], 0],
    [[optimizedFilePath], 1],
  ])(`${OUTPUT_NAME_SKIPPED_COUNT} is set correctly`, async (files, count) => {
    const getContentsMock = mockGetContentsForFiles(files);
    client.repos.getContent.mockImplementation(getContentsMock);

    await main(client, config, svgo);

    expect(core.setOutput).toHaveBeenCalledTimes(OUTPUTS_COUNT);
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_SKIPPED_COUNT,
      `${count}`,
    );
  });

  test(`${OUTPUT_NAME_SVG_COUNT} is set correctly`, async () => {
    const getContentsMock = mockGetContentsForFiles([fooFilePath, barFilePath]);
    client.repos.getContent.mockImplementation(getContentsMock);

    await main(client, config, svgo);

    expect(core.setOutput).toHaveBeenCalledTimes(OUTPUTS_COUNT);
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_SVG_COUNT,
      "2",
    );
  });

});

describe("Payloads", () => {

  const { content: barSvgContent, encoding: barSvgEncoding } = contentPayloads.files[barFilePath];
  const { content: fooSvgContent, encoding: fooSvgEncoding } = contentPayloads.files[fooFilePath];
  const { content: testSvgContent, encoding: testSvgEncoding } = contentPayloads.files[testFilePath];

  const barSvgData = files[barFilePath];
  const fooSvgData = files[fooFilePath];
  const testSvgData = files[testFilePath];

  beforeEach(() => {
    encoder.decode.mockClear();
    encoder.encode.mockClear();

    githubAPI.commitFiles.mockClear();
    githubAPI.createBlob.mockClear();

    svgoImport.OptimizerInstance.optimize.mockClear();
  });

  test("empty repository", async () => {
    const getContentsMock = mockGetContentsForFiles([]);
    client.repos.getContent.mockImplementation(getContentsMock);

    await main(client, config, svgo);

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgoImport.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("repository without SVGs", async () => {
    const getContentsMock = mockGetContentsForFiles(["README.md", "LICENSE"]);
    client.repos.getContent.mockImplementation(getContentsMock);

    await main(client, config, svgo);

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgoImport.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("repository with 1 SVG", async () => {
    const getContentsMock = mockGetContentsForFiles([fooFilePath]);
    client.repos.getContent.mockImplementation(getContentsMock);

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
      expect.any(String),
      expect.any(String),
    );
  });

  test("repository with files and 1 SVG", async () => {
    const getContentsMock = mockGetContentsForFiles([
      "README.md",
      "LICENSE",
      fooFilePath,
    ]);
    client.repos.getContent.mockImplementation(getContentsMock);

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
      expect.any(String),
      expect.any(String),
    );
  });

  test("repository with files and 1 SVG in a subdirectory", async () => {
    const getContentsMock = mockGetContentsForFiles([
      "README.md",
      "LICENSE",
      `foo/${barFilePath}`,
    ]);
    client.repos.getContent.mockImplementation(getContentsMock);

    await main(client, config, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(barSvgContent, barSvgEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(barSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), barSvgEncoding);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(1);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      barFilePath,
      expect.any(String),
      barSvgEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: barFilePath }),
      ]),
      expect.any(String),
      expect.any(String),
    );
  });

  test("repository with many SVGs in various subdirectory", async () => {
    const getContentsMock = mockGetContentsForFiles([
      `.hidden/${testFilePath}`,
      `foo/${barFilePath}`,
      fooFilePath,
    ]);
    client.repos.getContent.mockImplementation(getContentsMock);

    await main(client, config, svgo);

    expect(encoder.decode).toHaveBeenCalledTimes(3);
    expect(encoder.decode).toHaveBeenCalledWith(barSvgContent, barSvgEncoding);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent, fooSvgEncoding);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(3);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(barSvgData);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(fooSvgData);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(3);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), barSvgEncoding);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), fooSvgEncoding);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), testSvgEncoding);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(3);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      barFilePath,
      expect.any(String),
      barSvgEncoding,
    );
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
        expect.objectContaining({ path: barFilePath }),
        expect.objectContaining({ path: fooFilePath }),
        expect.objectContaining({ path: testFilePath }),
      ]),
      expect.any(String),
      expect.any(String),
    );
  });
});

describe("Error scenarios", () => {

  beforeEach(() => {
    core.setFailed.mockClear();
    core.warning.mockClear();

    encoder.decode.mockClear();

    githubAPI.commitFiles.mockClear();
    githubAPI.createBlob.mockClear();
    githubAPI.getFile.mockClear();
    githubAPI.getPrFiles.mockClear();

    svgoImport.OptimizerInstance.optimize.mockClear();

    templating.formatCommitMessage.mockClear();
  });

  test("the commit files could not be found", async () => {
    githubAPI.getContent.mockRejectedValueOnce(new Error("Not found"));

    await expect(main(client, config, svgo)).rejects.toBeDefined();
  });

  test("an SVG file that does not contain SVG content", async () => {
    const getContentsMock = mockGetContentsForFiles([fakeFilePath]);
    client.repos.getContent.mockImplementation(getContentsMock);

    await main(client, config, svgo);

    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("cannot optimize"));

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(svgoImport.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(githubAPI.createBlob).toHaveBeenCalledTimes(0);
    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(0);
  });

  test("blob size is too large", async () => {
    const getContentsMock = mockGetContentsForFiles([barFilePath, fooFilePath]);
    client.repos.getContent.mockImplementation(getContentsMock);

    githubAPI.getFile.mockImplementationOnce(() => { throw new Error("Blob too large"); });

    await main(client, config, svgo);

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.warning).toHaveBeenCalledWith(expect.stringMatching("SVG content .*could not be obtained"));

    expect(templating.formatCommitMessage).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        warnings: expect.arrayContaining([
          expect.stringMatching("SVG content .*could not be obtained"),
        ]),
      }),
    );
  });

  test("optimized blob size is too large", async () => {
    const getContentsMock = mockGetContentsForFiles([barFilePath, fooFilePath]);
    client.repos.getContent.mockImplementation(getContentsMock);

    githubAPI.createBlob.mockImplementationOnce(() => { throw new Error("Blob too large"); });

    await main(client, config, svgo);

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.warning).toHaveBeenCalledWith(expect.stringMatching("Blob.* could not be created"));

    expect(templating.formatCommitMessage).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        warnings: expect.arrayContaining([
          expect.stringMatching("Blob.* could not be created"),
        ]),
      }),
    );
  });

});

afterEach(() => {
  client.repos.getContent = getContentMockBackup;
});
