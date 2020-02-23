import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";
import { PR_NUMBER } from "./mocks/@actions/github.mock";
import * as encoder from "./mocks/encoder.mock";
import * as githubAPI from "./mocks/github-api.mock";
import * as svgo from "./mocks/svgo.mock";

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);
jest.mock("../src/encoder", () => encoder);
jest.mock("../src/github-api", () => githubAPI);
jest.mock("../src/svgo", () => svgo);

import contentPayloads from "./fixtures/contents-payloads.json";
import files from "./fixtures/file-data.json";
import svgoOptions from "./fixtures/svgo-options.json";

import { PR_NOT_FOUND } from "../src/github-api";
import main from "../src/main";


beforeEach(() => {
  core.debug.mockClear();
  core.error.mockClear();
  core.info.mockClear();
  core.setFailed.mockClear();

  githubAPI.commitFile.mockClear();
  githubAPI.getPrFile.mockClear();
  githubAPI.getPrFiles.mockClear();
  githubAPI.getPrNumber.mockClear();

  encoder.decode.mockClear();
  encoder.encode.mockClear();

  svgo.SVGOptimizer.mockClear();
  svgo.optimizerInstance.optimize.mockClear();
});

describe("Return value", () => {

  test("return success if everything is OK", async () => {
    const result: boolean = await main();
    expect(result).toBeTruthy();
  });

  test("return failure when Pull Request number as not found", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NOT_FOUND);

    const result: boolean = await main();
    expect(result).toBeFalsy();
  });

});

describe("Function usage", () => {

  test("gets the Pull Request number", async () => {
    await main();
    expect(githubAPI.getPrNumber).toHaveBeenCalledTimes(1);
  });

  test("gets the changed files in the Pull Request", async () => {
    await main();
    expect(githubAPI.getPrFiles).toHaveBeenCalledTimes(1);
  });

  test("gets the contents of at least one of the files in the Pull Request", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG);

    await main();
    expect(githubAPI.getPrFile).toHaveBeenCalledTimes(1);
  });

});

describe("Logging", () => {

  test("does some debug logging", async () => {
    await main();
    expect(core.debug).toHaveBeenCalled();
  });

  test("summary when everything is fine", async () => {
    await main();
    expect(core.info).toHaveBeenCalled();
  });

  test("summary for 1 optimized SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG);

    await main();
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 1/1 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("0/1 SVG(s) skipped"));
  });

  test("summary for 1 skipped file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_OPTIMIZED_SVG);

    await main();
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 0/1 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("1/1 SVG(s) skipped"));
  });

  test("summary for many changes", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.MANY_CHANGES);

    await main();
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 3/3 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("0/3 SVG(s) skipped"));
  });

  test("don't log an error when everything is fine", async () => {
    await main();
    expect(core.error).not.toHaveBeenCalled();
  });

  test("don't set a failed state when everything is fine", async () => {
    await main();
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  test("log an error when Pull Request number could not be found", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NOT_FOUND);

    await main();
    expect(core.error).toHaveBeenCalled();
  });

});

describe("Scenarios", () => {

  const barFilePath = "bar.svg";
  const complexFilePath = "complex.svg";
  const fooFilePath = "foo.svg";
  const testFilePath = "test.svg";

  const { content: barSvgContent, encoding: barSvgEncoding } = contentPayloads[barFilePath];
  const { content: complexSvgContent, encoding: complexSvgEncoding } = contentPayloads[complexFilePath];
  const { content: fooSvgContent, encoding: fooSvgEncoding } = contentPayloads[fooFilePath];
  const { content: testSvgContent, encoding: testSvgEncoding } = contentPayloads[testFilePath];

  const barSvgData = files[barFilePath];
  const complexSvgData = files[complexFilePath];
  const fooSvgData = files[fooFilePath];
  const testSvgData = files[testFilePath];

  test("pull Request with 1 new SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), testSvgEncoding);

    expect(githubAPI.commitFile).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFile).toHaveBeenCalledWith(
      github.GitHubInstance,
      testFilePath,
      expect.any(String),
      testSvgEncoding,
      expect.stringContaining(testFilePath),
    );
  });

  test("pull Request with 1 modified SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.MODIFY_SVG);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent, fooSvgEncoding);

    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledWith(fooSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), fooSvgEncoding);

    expect(githubAPI.commitFile).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFile).toHaveBeenCalledWith(
      github.GitHubInstance,
      fooFilePath,
      expect.any(String),
      fooSvgEncoding,
      expect.stringContaining(fooFilePath),
    );
  });

  test("pull Request with 1 removed SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.REMOVE_SVG);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(0);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledTimes(0);
    expect(encoder.encode).toHaveBeenCalledTimes(0);
    expect(githubAPI.commitFile).toHaveBeenCalledTimes(0);
  });

  test("pull Request with 1 new, 1 modified, and 1 removed SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_MODIFY_REMOVE_SVG);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(2);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent, fooSvgEncoding);
    expect(encoder.decode).toHaveBeenCalledWith(barSvgContent, barSvgEncoding);

    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledTimes(2);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledWith(fooSvgData);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledWith(barSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(2);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), fooSvgEncoding);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), barSvgEncoding);

    expect(githubAPI.commitFile).toHaveBeenCalledTimes(2);
    expect(githubAPI.commitFile).toHaveBeenCalledWith(
      github.GitHubInstance,
      fooFilePath,
      expect.any(String),
      fooSvgEncoding,
      expect.stringContaining(fooFilePath),
    );
    expect(githubAPI.commitFile).toHaveBeenCalledWith(
      github.GitHubInstance,
      barFilePath,
      expect.any(String),
      barSvgEncoding,
      expect.stringContaining(barFilePath),
    );
  });

  test("pull Request with 1 new file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_FILE);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(0);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledTimes(0);
    expect(encoder.encode).toHaveBeenCalledTimes(0);
    expect(githubAPI.commitFile).toHaveBeenCalledTimes(0);
  });

  test("pull Request with 1 modified file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.MODIFY_FILE);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(0);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledTimes(0);
    expect(encoder.encode).toHaveBeenCalledTimes(0);
    expect(githubAPI.commitFile).toHaveBeenCalledTimes(0);
  });

  test("pull Request with 1 removed file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.REMOVE_FILE);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(0);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledTimes(0);
    expect(encoder.encode).toHaveBeenCalledTimes(0);
    expect(githubAPI.commitFile).toHaveBeenCalledTimes(0);
  });

  test("pull Request with 1 new SVG and 1 modified file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG_MODIFY_FILE);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), testSvgEncoding);

    expect(githubAPI.commitFile).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFile).toHaveBeenCalledWith(
      github.GitHubInstance,
      testFilePath,
      expect.any(String),
      testSvgEncoding,
      expect.stringContaining(testFilePath),
    );
  });

  test("pull Request with 1 new file and 1 modified SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_FILE_MODIFY_SVG);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), testSvgEncoding);

    expect(githubAPI.commitFile).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFile).toHaveBeenCalledWith(
      github.GitHubInstance,
      testFilePath,
      expect.any(String),
      testSvgEncoding,
      expect.stringContaining(testFilePath),
    );
  });

  test("pull Request with 1 new SVG and 1 deleted file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG_REMOVE_FILE);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(complexSvgContent, complexSvgEncoding);

    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledWith(complexSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), complexSvgEncoding);

    expect(githubAPI.commitFile).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFile).toHaveBeenCalledWith(
      github.GitHubInstance,
      complexFilePath,
      expect.any(String),
      complexSvgEncoding,
      expect.stringContaining(complexFilePath),
    );
  });

  test("pull Request with 1 new file and 1 deleted SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_FILE_REMOVE_SVG);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(0);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledTimes(0);
    expect(encoder.encode).toHaveBeenCalledTimes(0);
    expect(githubAPI.commitFile).toHaveBeenCalledTimes(0);
  });

  test("pull Request with multiple SVGs and multiple files", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.MANY_CHANGES);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(3);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent, fooSvgEncoding);
    expect(encoder.decode).toHaveBeenCalledWith(barSvgContent, barSvgEncoding);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledTimes(3);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledWith(fooSvgData);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledWith(barSvgData);
    expect(svgo.optimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

    expect(githubAPI.commitFile).toHaveBeenCalledTimes(3);
    expect(githubAPI.commitFile).toHaveBeenCalledWith(
      github.GitHubInstance,
      fooFilePath,
      expect.any(String),
      fooSvgEncoding,
      expect.stringContaining(fooFilePath),
    );
    expect(githubAPI.commitFile).toHaveBeenCalledWith(
      github.GitHubInstance,
      barFilePath,
      expect.any(String),
      barSvgEncoding,
      expect.stringContaining(barFilePath),
    );
    expect(githubAPI.commitFile).toHaveBeenCalledWith(
      github.GitHubInstance,
      testFilePath,
      expect.any(String),
      testSvgEncoding,
      expect.stringContaining(testFilePath),
    );
  });

  test("pull Request with 1 optimized SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_OPTIMIZED_SVG);

    await main();

    expect(githubAPI.commitFile).toHaveBeenCalledTimes(0);
    expect(core.debug).toHaveBeenCalledWith(expect.stringMatching(/skipping.*optimized.svg/));
  });

  test("use a configuration file in the repository", async () => {
    svgo.getDefaultSvgoOptions.mockReturnValueOnce(svgoOptions);

    await main();

    expect(svgo.SVGOptimizer).toHaveBeenCalledWith(svgoOptions);
  });

});

describe("Error scenarios", () => {

  test("the Pull Request files could not be found", async () => {
    githubAPI.getPrFiles.mockRejectedValueOnce(new Error("Not found"));

    await main();

    expect(core.setFailed).toHaveBeenCalledTimes(1);
  });

  test("a particular file could not be found", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG);
    githubAPI.getPrFile.mockRejectedValueOnce(new Error("Not found"));

    await main();

    expect(core.setFailed).toHaveBeenCalledTimes(1);
  });

  test("there is no configuration file in repository", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG);
    svgo.getDefaultSvgoOptions.mockResolvedValueOnce({ });

    await main();

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(githubAPI.commitFile).toHaveBeenCalledTimes(1);
  });

});
