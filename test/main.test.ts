import { when } from "jest-when";
import { format as strFormat } from "util";

import actionOptions from "./fixtures/svgo-action.json";
import contentPayloads from "./fixtures/contents-payloads.json";
import files from "./fixtures/file-data.json";
import svgoOptions from "./fixtures/svgo-options.json";

import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";
import { PR_NUMBER } from "./mocks/@actions/github.mock";
import * as encoder from "./mocks/encoder.mock";
import * as githubAPI from "./mocks/github-api.mock";
import * as inputs from "./mocks/inputs.mock";
import * as svgo from "./mocks/svgo.mock";

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);
jest.mock("../src/encoder", () => encoder);
jest.mock("../src/github-api", () => githubAPI);
jest.mock("../src/inputs", () => inputs);
jest.mock("../src/svgo", () => svgo);

import { PR_NOT_FOUND } from "../src/github-api";
import main from "../src/main";


beforeEach(() => {
  core.debug.mockClear();
  core.error.mockClear();
  core.info.mockClear();
  core.setFailed.mockClear();

  encoder.decode.mockClear();
  encoder.encode.mockClear();

  githubAPI.commitFiles.mockClear();
  githubAPI.createBlob.mockClear();
  githubAPI.getPrFile.mockClear();
  githubAPI.getPrFiles.mockClear();
  githubAPI.getPrNumber.mockClear();

  inputs.ActionConfig.mockClear();

  svgo.SVGOptimizer.mockClear();
  svgo.OptimizerInstance.optimize.mockClear();
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

  test("summary for a Pull Request with 1 optimized SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG);

    await main();
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 1/1 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("0/1 SVG(s) skipped"));
  });

  test("summary for a Pull Request with 1 skipped SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_OPTIMIZED_SVG);

    await main();
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 0/1 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("1/1 SVG(s) skipped"));
  });

  test("summary for a Pull Request with many changes", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.MANY_CHANGES);

    await main();
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("optimized 3/4 SVG(s)"));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("1/4 SVG(s) skipped"));
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

describe("Configuration", () => {

  test("use custom configuration file", async () => {
    const actionConfigFilePath = "svgo-action.yml";
    inputs.getConfigFilePath.mockReturnValueOnce(actionConfigFilePath);

    await main();

    expect(inputs.ActionConfig).toHaveBeenCalledWith(actionOptions);
  });

  test("dry run enabled", async () => {
    const actionConfig = new inputs.ActionConfig();
    actionConfig.isDryRun = true;

    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG);
    inputs.ActionConfig.mockReturnValueOnce(actionConfig);

    await main();

    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("Dry mode enabled"));
  });

  test("dry run disabled", async () => {
    const actionConfig = new inputs.ActionConfig();
    actionConfig.isDryRun = false;

    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG);
    inputs.ActionConfig.mockReturnValueOnce(actionConfig);

    await main();

    expect(githubAPI.commitFiles).toHaveBeenCalled();
    expect(core.info).not.toHaveBeenCalledWith(expect.stringContaining("Dry mode enabled"));
  });

  test("use an SVGO options file in the repository", async () => {
    const svgoOptionsPath = ".svgo.yml";
    const actionConfig = new inputs.ActionConfig();
    actionConfig.svgoOptionsPath = svgoOptionsPath;

    inputs.ActionConfig.mockReturnValueOnce(actionConfig);
    when(githubAPI.getRepoFile)
      .calledWith(github.GitHubInstance, svgoOptionsPath)
      .mockResolvedValueOnce(contentPayloads[svgoOptionsPath]);

    await main();

    expect(svgo.SVGOptimizer).toHaveBeenCalledWith(svgoOptions);
  });

});

describe("Manipulation", () => {

  test.each([
    ["But why is the rum gone"],
    ["Asiimov", "It's dangerous to go alone!", "Praise the sun"],
    ["The Spanish Inquisition", "No this is Patrick!"],
  ])("comments on the Pull Request that don't disable the Action", async (...comments) => {
    githubAPI.getPrComments.mockImplementationOnce(() => ({
      [Symbol.asyncIterator](): unknown {
        return {
          async next(): Promise<unknown> {
            const comment = comments.pop();
            if (comment) {
              return { done: false, value: comment };
            } else {
              return { done: true };
            }
          },
        };
      },
    }));

    await main();
    expect(core.info).not.toHaveBeenCalledWith(expect.stringContaining("disabled"));
  });

  test.each([
    ["Let's disable the action! (%s)"],
    ["Hello world!", "%s"],
    ["foo", "foo %s bar", "bar"],
    ["%s", "Yip Yip!", "%s"],
  ])("comments on the Pull Request that do disable the Action", async (...baseComments) => {
    githubAPI.getPrComments.mockImplementationOnce(() => ({
      [Symbol.asyncIterator](): unknown {
        return {
          async next(): Promise<unknown> {
            const comment = baseComments.pop();
            if (comment) {
              return { done: false, value: strFormat(comment, "disable-svgo-action") };
            } else {
              return { done: true };
            }
          },
        };
      },
    }));

    const result = await main();

    expect(result).toBe(true);
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("disabled"));
  });

  test.each([
    "This is the commit title\n\nAnd this the message (%s)",
    "chore: make some changes\n\n- This isn't tennis\n- Praise the sun\n\n%s",
    "Added some SVGs to the website\n\n%s",
    "Double rainbow\n\nwhat does it %s mean?",
  ])("commit message that disables the Action", async (baseCommitMessage) => {
    const fullCommitMessage = strFormat(baseCommitMessage, "disable-svgo-action");
    githubAPI.getCommitMessage.mockResolvedValueOnce(fullCommitMessage);

    const result = await main();

    expect(result).toBe(true);
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("disabled"));
  });

});

describe("Payloads", () => {

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

  test("a Pull Request with 1 new SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

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
      expect.stringContaining("1"),
    );
  });

  test("a Pull Request with 1 modified SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.MODIFY_SVG);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent, fooSvgEncoding);

    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledWith(fooSvgData);

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
      expect.stringContaining("1"),
    );
  });

  test("a Pull Request with 1 removed SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.REMOVE_SVG);

    await main();

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgo.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("a Pull Request with 1 new, 1 modified, and 1 removed SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_MODIFY_REMOVE_SVG);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(2);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent, fooSvgEncoding);
    expect(encoder.decode).toHaveBeenCalledWith(barSvgContent, barSvgEncoding);

    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledTimes(2);
    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledWith(fooSvgData);
    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledWith(barSvgData);

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
      barFilePath,
      expect.any(String),
      barSvgEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: fooFilePath }),
        expect.objectContaining({ path: barFilePath }),
      ]),
      expect.stringMatching("2"),
    );
  });

  test("a Pull Request with 1 new file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_FILE);

    await main();

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgo.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("a Pull Request with 1 modified file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.MODIFY_FILE);

    await main();

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgo.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("a Pull Request with 1 removed file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.REMOVE_FILE);

    await main();

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgo.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("a Pull Request with 1 new SVG and 1 modified file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG_MODIFY_FILE);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

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
      expect.stringContaining("1"),
    );
  });

  test("a Pull Request with 1 new file and 1 modified SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_FILE_MODIFY_SVG);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

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
      expect.stringContaining("1"),
    );
  });

  test("a Pull Request with 1 new SVG and 1 deleted file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG_REMOVE_FILE);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(complexSvgContent, complexSvgEncoding);

    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledTimes(1);
    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledWith(complexSvgData);

    expect(encoder.encode).toHaveBeenCalledTimes(1);
    expect(encoder.encode).toHaveBeenCalledWith(expect.any(String), complexSvgEncoding);

    expect(githubAPI.createBlob).toHaveBeenCalledTimes(1);
    expect(githubAPI.createBlob).toHaveBeenCalledWith(
      github.GitHubInstance,
      complexFilePath,
      expect.any(String),
      complexSvgEncoding,
    );

    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(githubAPI.commitFiles).toHaveBeenCalledWith(
      github.GitHubInstance,
      expect.arrayContaining([
        expect.objectContaining({ path: complexFilePath }),
      ]),
      expect.stringContaining("1"),
    );
  });

  test("a Pull Request with 1 new file and 1 deleted SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_FILE_REMOVE_SVG);

    await main();

    expect(encoder.decode).not.toHaveBeenCalled();
    expect(svgo.OptimizerInstance.optimize).not.toHaveBeenCalled();
    expect(encoder.encode).not.toHaveBeenCalled();
    expect(githubAPI.createBlob).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
  });

  test("a Pull Request with multiple SVGs and multiple files", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.MANY_CHANGES);

    await main();

    expect(encoder.decode).toHaveBeenCalledTimes(4);
    expect(encoder.decode).toHaveBeenCalledWith(fooSvgContent, fooSvgEncoding);
    expect(encoder.decode).toHaveBeenCalledWith(barSvgContent, barSvgEncoding);
    expect(encoder.decode).toHaveBeenCalledWith(testSvgContent, testSvgEncoding);

    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledTimes(4);
    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledWith(fooSvgData);
    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledWith(barSvgData);
    expect(svgo.OptimizerInstance.optimize).toHaveBeenCalledWith(testSvgData);

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
      expect.stringContaining("3"),
    );
  });

  test("a Pull Request with 1 optimized SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_OPTIMIZED_SVG);

    await main();

    expect(githubAPI.commitFiles).not.toHaveBeenCalled();
    expect(core.debug).toHaveBeenCalledWith(expect.stringMatching(/skipping.*optimized.svg/));
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

  test("the SVGO options file does not exist", async () => {
    const { svgoOptionsPath } = new inputs.ActionConfig();

    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG);
    when(githubAPI.getRepoFile)
      .calledWith(github.GitHubInstance, svgoOptionsPath)
      .mockRejectedValueOnce(new Error("Not found"));

    await main();

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(core.debug).toHaveBeenCalledWith(expect.stringMatching(`not found.*${svgoOptionsPath}`));
  });

  test("the Action configuration file does not exist", async () => {
    const actionConfigPath = inputs.getConfigFilePath();

    githubAPI.getPrNumber.mockReturnValueOnce(PR_NUMBER.ADD_SVG);
    when(githubAPI.getRepoFile)
      .calledWith(github.GitHubInstance, actionConfigPath)
      .mockRejectedValueOnce(new Error("Not found"));

    await main();

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(githubAPI.commitFiles).toHaveBeenCalledTimes(1);
    expect(core.debug).toHaveBeenCalledWith(expect.stringMatching(`not found.*${actionConfigPath}`));
  });

});
