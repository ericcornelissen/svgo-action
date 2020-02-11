import * as core from "./mocks/@actions/core.mock";
import { PR_ADD_SVG, PR_ADD_SVG_MODIFY_FILE } from "./mocks/@actions/github.mock";
import * as githubAPI from "./mocks/github-api.mock";
import SVGOptimizer, { svgo } from "./mocks/svgo.mock";
import * as encoder from "./mocks/encoder.mock";

jest.mock("@actions/core", () => core);
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

  githubAPI.getPrFile.mockClear();
  githubAPI.getPrFiles.mockClear();
  githubAPI.getPrNumber.mockClear();

  encoder.decode.mockClear();

  svgo.optimize.mockClear();
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
    githubAPI.getPrNumber.mockReturnValueOnce(PR_ADD_SVG);

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

describe("scenarios", () => {

  test("Pull Request with 1 new SVG", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_ADD_SVG);

    await main();

    const { content, encoding } = contentPayloads["test.svg"];
    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(content, encoding);

    expect(svgo.optimize).toHaveBeenCalledTimes(1);
    expect(svgo.optimize).toHaveBeenCalledWith(svgs["test.svg"]);
  });

  test.skip("Pull Request with 1 modified SVG", () => true);

  test.skip("Pull Request with 1 removed SVG", () => true);

  test.skip("Pull Request with 1 new, 1 modified, and 1 removed SVG", () => true);

  test.skip("Pull Request with 1 new non-SVG", () => true);

  test("Pull Request with 1 new SVG and 1 modified file", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_ADD_SVG_MODIFY_FILE);

    await main();

    const { content, encoding } = contentPayloads["test.svg"];
    expect(encoder.decode).toHaveBeenCalledTimes(1);
    expect(encoder.decode).toHaveBeenCalledWith(content, encoding);

    expect(svgo.optimize).toHaveBeenCalledTimes(1);
    expect(svgo.optimize).toHaveBeenCalledWith(svgs["test.svg"]);
  });

  test.skip("Pull Request with 1 optimized SVG", () => true);

});
