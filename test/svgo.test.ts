import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";
import * as encoder from "./mocks/encoder.mock";
import * as githubAPI from "./mocks/github-api.mock";

jest.mock("@actions/core", () => core);
jest.mock("../src/encoder", () => encoder);
jest.mock("../src/github-api", () => githubAPI);

import { SVGOptimizer, getDefaultConfig } from "../src/svgo";

import contentPayloads from "./fixtures/contents-payloads.json";
import svgoConfig from "./fixtures/svgo-config.json";
import files from "./fixtures/file-data.json";


describe("::getDefaultConfig", () => {

  const token = core.getInput("repo-token", { required: true });
  const client = new github.GitHub(token);

  beforeEach(() => {
    core.debug.mockClear();
  });

  describe("default configuration file exists", () => {

    test("the return value is defined", async () => {
      const result = await getDefaultConfig(client);
      expect(result).toBeDefined();
    });

    test("the return value is based on the file in the repository", async () => {
      const svgoConfigContent = contentPayloads[".svgo.yml"];
      const fileData = {
        path: svgoConfigContent.path,
        content: svgoConfigContent.content,
        encoding: svgoConfigContent.encoding,
      };

      githubAPI.getRepoFile.mockResolvedValueOnce(fileData);

      const result = await getDefaultConfig(client);
      expect(result).toEqual(svgoConfig);
    });

    test("debug logs that the default config file was found", async () => {
      await getDefaultConfig(client);
      expect(core.debug).toHaveBeenCalledTimes(1);
      expect(core.debug).toHaveBeenCalledWith(expect.stringMatching(/[^not] found/));
    });

  });

  describe("default configuration file doesn't exists", () => {

    beforeEach(() => githubAPI.getRepoFile.mockRejectedValueOnce(new Error("Not found")));

    test("the return value is defined", async () => {
      const result = await getDefaultConfig(client);
      expect(result).toBeDefined();
    });

    test("the return value is an empty object", async () => {
      const result = await getDefaultConfig(client);
      expect(result).toEqual({ });
    });

    test("debug logs that the default config file is missing", async () => {
      await getDefaultConfig(client);
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
    expect(() => new SVGOptimizer(svgoConfig)).not.toThrow();
  });

});

describe("SVGOptimizer.optimize", () => {

  const testSvgs = test.each(
    Object.entries(files)
      .filter(([key, _]) => key.endsWith(".svg"))
      .map(([_, value]) => value)
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
    const optimizer2: SVGOptimizer = new SVGOptimizer(svgoConfig);

    const optimized1 = await optimizer.optimize(files.complex);
    const optimized2 = await optimizer2.optimize(files.complex);
    expect(optimized1).not.toEqual(optimized2);
  });

});
