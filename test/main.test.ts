import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";
import { PR_NUMBER } from "./mocks/@actions/github.mock";
import * as encoder from "./mocks/encoder.mock";
import * as githubAPI from "./mocks/github-api.mock";
import SVGOptimizer, { optimizerInstance } from "./mocks/svgo.mock";

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);
jest.mock("../src/encoder", () => encoder);
jest.mock("../src/github-api", () => githubAPI);
jest.mock("../src/svgo", () => SVGOptimizer);

import contentPayloads from "./fixtures/contents-payloads.json";
import svgs from "./fixtures/svgs.json";

import { PR_NOT_FOUND } from "../src/github-api";
import main from "../src/main";


beforeEach(() => {
  core.debug.mockClear();
  core.error.mockClear();
  core.setFailed.mockClear();

  githubAPI.commit.mockClear();
  githubAPI.getPrFile.mockClear();
  githubAPI.getPrFiles.mockClear();
  githubAPI.getPrNumber.mockClear();

  encoder.decode.mockClear();
  encoder.encode.mockClear();

  optimizerInstance.optimize.mockClear();
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

  test("Pull Request with 1 new SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG);

    const filePath = "test.svg";

    await main();

    const { content, encoding } = contentPayloads[filePath];
    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(content, encoding);

    expect(optimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(optimizerInstance.optimize).toHaveBeenCalledWith(svgs[filePath]);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), encoding);

    expect(githubAPI.commit).toHaveBeenCalledTimes(1);
    expect(githubAPI.commit).toHaveBeenCalledWith(
      github.GitHubInstance,
      filePath,
      expect.any(String), // Optimized SVG
      encoding,
      expect.stringContaining(filePath), // Commit message
    );
  });

  test("Pull Request with 1 modified SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.MODIFY_SVG);

    const filePath = "foo.svg";

    await main();

    const { content, encoding } = contentPayloads[filePath];
    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(content, encoding);

    expect(optimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(optimizerInstance.optimize).toHaveBeenCalledWith(svgs[filePath]);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), encoding);

    expect(githubAPI.commit).toHaveBeenCalledTimes(1);
    expect(githubAPI.commit).toHaveBeenCalledWith(
      github.GitHubInstance,
      filePath,
      expect.any(String), // Optimized SVG
      encoding,
      expect.stringContaining(filePath), // Commit message
    );
  });

  test("Pull Request with 1 removed SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.REMOVE_SVG);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(0);
    expect(optimizerInstance.optimize).toHaveBeenCalledTimes(0);
    expect(encoder.encode).toHaveBeenCalledTimes(0);
    expect(githubAPI.commit).toHaveBeenCalledTimes(0);
  });

  test("Pull Request with 1 new, 1 modified, and 1 removed SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_MODIFY_REMOVE_SVG);

    const fooFilePath = "foo.svg";
    const barFilePath = "bar.svg";
    const fooSvgContent = contentPayloads[fooFilePath];
    const barSvgContent = contentPayloads[barFilePath];

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(2);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent.content, fooSvgContent.encoding);
    expect(encoder.decode).toHaveBeenCalledWith(barSvgContent.content, barSvgContent.encoding);

    expect(optimizerInstance.optimize).toHaveBeenCalledTimes(2);
    expect(optimizerInstance.optimize).toHaveBeenCalledWith(svgs[fooFilePath]);
    expect(optimizerInstance.optimize).toHaveBeenCalledWith(svgs[barFilePath]);

    expect(encoder.encode).toHaveBeenCalledTimes(2);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), fooSvgContent.encoding);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), barSvgContent.encoding);

    expect(githubAPI.commit).toHaveBeenCalledTimes(2);
    expect(githubAPI.commit).toHaveBeenCalledWith(
      github.GitHubInstance,
      fooFilePath,
      expect.any(String), // Optimized SVG
      fooSvgContent.encoding,
      expect.stringContaining(fooFilePath), // Commit message
    );
    expect(githubAPI.commit).toHaveBeenCalledWith(
      github.GitHubInstance,
      barFilePath,
      expect.any(String), // Optimized SVG
      barSvgContent.encoding,
      expect.stringContaining(barFilePath), // Commit message
    );
  });

  test("Pull Request with 1 new file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_FILE);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(0);
    expect(optimizerInstance.optimize).toHaveBeenCalledTimes(0);
    expect(encoder.encode).toHaveBeenCalledTimes(0);
    expect(githubAPI.commit).toHaveBeenCalledTimes(0);
  });

  test("Pull Request with 1 modified file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.MODIFY_FILE);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(0);
    expect(optimizerInstance.optimize).toHaveBeenCalledTimes(0);
    expect(encoder.encode).toHaveBeenCalledTimes(0);
    expect(githubAPI.commit).toHaveBeenCalledTimes(0);
  });

  test("Pull Request with 1 removed file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.REMOVE_FILE);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(0);
    expect(optimizerInstance.optimize).toHaveBeenCalledTimes(0);
    expect(encoder.encode).toHaveBeenCalledTimes(0);
    expect(githubAPI.commit).toHaveBeenCalledTimes(0);
  });

  test("Pull Request with 1 new SVG and 1 modified file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG_MODIFY_FILE);

    const filePath = "test.svg";

    await main();

    const { content, encoding } = contentPayloads[filePath];
    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(content, encoding);

    expect(optimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(optimizerInstance.optimize).toHaveBeenCalledWith(svgs[filePath]);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), encoding);

    expect(githubAPI.commit).toHaveBeenCalledTimes(1);
    expect(githubAPI.commit).toHaveBeenCalledWith(
      github.GitHubInstance,
      filePath,
      expect.any(String), // Optimized SVG
      encoding,
      expect.stringContaining(filePath), // Commit message
    );
  });

  test("Pull Request with 1 new file and 1 modified SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_FILE_MODIFY_SVG);

    const filePath = "test.svg";

    await main();

    const { content, encoding } = contentPayloads[filePath];
    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(content, encoding);

    expect(optimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(optimizerInstance.optimize).toHaveBeenCalledWith(svgs[filePath]);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), encoding);

    expect(githubAPI.commit).toHaveBeenCalledTimes(1);
    expect(githubAPI.commit).toHaveBeenCalledWith(
      github.GitHubInstance,
      filePath,
      expect.any(String), // Optimized SVG
      encoding,
      expect.stringContaining(filePath), // Commit message
    );
  });

  test("Pull Request with 1 new SVG and 1 deleted file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG_REMOVE_FILE);

    const filePath = "bar.svg";

    await main();

    const { content, encoding } = contentPayloads[filePath];
    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(content, encoding);

    expect(optimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(optimizerInstance.optimize).toHaveBeenCalledWith(svgs[filePath]);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), encoding);

    expect(githubAPI.commit).toHaveBeenCalledTimes(1);
    expect(githubAPI.commit).toHaveBeenCalledWith(
      github.GitHubInstance,
      filePath,
      expect.any(String), // Optimized SVG
      encoding,
      expect.stringContaining(filePath), // Commit message
    );
  });

  test("Pull Request with 1 new file and 1 deleted SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_FILE_REMOVE_SVG);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(0);
    expect(optimizerInstance.optimize).toHaveBeenCalledTimes(0);
    expect(encoder.encode).toHaveBeenCalledTimes(0);
    expect(githubAPI.commit).toHaveBeenCalledTimes(0);
  });

  test("Pull Request with multiple SVGs and multiple files", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.MANY_CHANGES);

    const fooFilePath = "foo.svg";
    const barFilePath = "bar.svg";
    const testFilePath = "test.svg";
    const fooSvgContent = contentPayloads["foo.svg"];
    const barSvgContent = contentPayloads[barFilePath];
    const testSvgContent = contentPayloads[testFilePath];

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(3);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent.content, fooSvgContent.encoding);
    expect(encoder.decode).toHaveBeenCalledWith(barSvgContent.content, barSvgContent.encoding);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent.content, testSvgContent.encoding);

    expect(optimizerInstance.optimize).toHaveBeenCalledTimes(3);
    expect(optimizerInstance.optimize).toHaveBeenCalledWith(svgs[fooFilePath]);
    expect(optimizerInstance.optimize).toHaveBeenCalledWith(svgs[barFilePath]);
    expect(optimizerInstance.optimize).toHaveBeenCalledWith(svgs[testFilePath]);

    expect(githubAPI.commit).toHaveBeenCalledTimes(3);
    expect(githubAPI.commit).toHaveBeenCalledWith(
      github.GitHubInstance,
      fooFilePath,
      expect.any(String), // Optimized SVG
      fooSvgContent.encoding,
      expect.stringContaining(fooFilePath), // Commit message
    );
    expect(githubAPI.commit).toHaveBeenCalledWith(
      github.GitHubInstance,
      barFilePath,
      expect.any(String), // Optimized SVG
      barSvgContent.encoding,
      expect.stringContaining(barFilePath), // Commit message
    );
    expect(githubAPI.commit).toHaveBeenCalledWith(
      github.GitHubInstance,
      testFilePath,
      expect.any(String), // Optimized SVG
      testSvgContent.encoding,
      expect.stringContaining(testFilePath), // Commit message
    );
  });

  test("Pull Request with 1 optimized SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_OPTIMIZED_SVG);

    await main();

    const { content, encoding } = contentPayloads["optimized.svg"];
    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(content, encoding);

    expect(optimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(optimizerInstance.optimize).toHaveBeenCalledWith(svgs["optimized.svg"]);

    // TODO: Should not commit, see:
    //   https://github.com/ericcornelissen/svgo-action/issues/45
  });

});
