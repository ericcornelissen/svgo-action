import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";
import * as encoder from "./mocks/encoder.mock";
import * as githubAPI from "./mocks/github-api.mock";

jest.mock("@actions/core", () => core);
jest.mock("../src/encoder", () => encoder);
jest.mock("../src/github-api", () => githubAPI);

import SVGO from "svgo";

import { SVGOptimizer, getDefaultSvgoOptions } from "../src/svgo";

import contentPayloads from "./fixtures/contents-payloads.json";
import files from "./fixtures/file-data.json";
import svgoOptions from "./fixtures/svgo-options.json";


describe("::getDefaultSvgoOptions", () => {

  const token = core.getInput("repo-token", { required: true });
  const client = new github.GitHub(token);

  beforeEach(() => {
    core.debug.mockClear();
  });

  describe("default configuration file exists", () => {

    test("the return value is defined", async () => {
      const result = await getDefaultSvgoOptions(client);
      expect(result).toBeDefined();
    });

    test("the return value is based on the file in the repository", async () => {
      const svgoOptionsContent = contentPayloads[".svgo.yml"];
      const fileData = {
        path: svgoOptionsContent.path,
        content: svgoOptionsContent.content,
        encoding: svgoOptionsContent.encoding,
      };

      githubAPI.getRepoFile.mockResolvedValueOnce(fileData);

      const result = await getDefaultSvgoOptions(client);
      expect(result).toEqual(svgoOptions);
    });

    test("debug logs that the default config file was found", async () => {
      await getDefaultSvgoOptions(client);
      expect(core.debug).toHaveBeenCalledTimes(1);
      expect(core.debug).toHaveBeenCalledWith(expect.stringMatching(/((?!not)) found/));
    });

  });

  describe("default configuration file doesn't exists", () => {

    beforeEach(() => githubAPI.getRepoFile.mockRejectedValueOnce(new Error("Not found")));

    test("the return value is defined", async () => {
      const result = await getDefaultSvgoOptions(client);
      expect(result).toBeDefined();
    });

    test("the return value is an empty object", async () => {
      const result = await getDefaultSvgoOptions(client);
      expect(result).toEqual({ });
    });

    test("debug logs that the default config file is missing", async () => {
      await getDefaultSvgoOptions(client);
      expect(core.debug).toHaveBeenCalledTimes(1);
      expect(core.debug).toHaveBeenCalledWith(expect.stringContaining("not found"));
    });

  });

});

describe("SVGOptimizer::constructor", () => {

  test("does not throw when given no configuration", () => {
    expect(() => new SVGOptimizer()).not.toThrow();
  });

  test("does not throw when given empty configuration", () => {
    expect(() => new SVGOptimizer({})).not.toThrow();
  });

  test("does not throw when given configuration", () => {
    expect(() => new SVGOptimizer(svgoOptions as SVGO.Options)).not.toThrow();
  });

});

describe("SVGOptimizer.optimize", () => {

  const testSvgs = test.each(
    Object.entries(files)
      .filter(([key, _]) => key.endsWith(".svg"))
      .map(([_, value]) => value),
  );

  const optimizer: SVGOptimizer = new SVGOptimizer({});

  testSvgs("return a (string) value", async (svg: string) => {
    const result = await optimizer.optimize(svg);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  testSvgs("change a (not optimized) SVG", async (svg: string) => {
    const result = await optimizer.optimize(svg);
    expect(result).not.toEqual(svg);
  });

  test("return value for a previously optimized SVG", async () => {
    const optimized = await optimizer.optimize(files["test.svg"]);
    const result = await optimizer.optimize(optimized);
    expect(result).toEqual(optimized);
  });

  test("optimizing with different configurations (default vs. fixture)", async () => {
    const optimizer2: SVGOptimizer = new SVGOptimizer(svgoOptions as SVGO.Options);

    const optimized1 = await optimizer.optimize(files.complex);
    const optimized2 = await optimizer2.optimize(files.complex);
    expect(optimized1).not.toEqual(optimized2);
  });

});
