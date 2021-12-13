jest.mock("js-yaml");
jest.mock("node-eval");
jest.mock("../../../src/parsers/builder");

import * as yaml from "js-yaml";
import nodeEval from "node-eval";

import * as builder from "../../../src/parsers/builder";
import parsers from "../../../src/parsers/index";

const buildSafeParser = builder.buildSafeParser as jest.MockedFunction<typeof builder.buildSafeParser>; // eslint-disable-line max-len

describe("parsers/index.js", () => {
  beforeEach(() => {
    buildSafeParser.mockClear();
  });

  describe("::NewJavaScript", () => {
    test("does use node-eval", () => {
      parsers.NewJavaScript();
      expect(buildSafeParser).toHaveBeenCalledWith(nodeEval);
    });

    test("does not use js-yaml", () => {
      parsers.NewJavaScript();
      expect(buildSafeParser).not.toHaveBeenCalledWith(yaml.load);
    });
  });

  describe("::NewYaml", () => {
    test("does use js-yaml", () => {
      parsers.NewYaml();
      expect(buildSafeParser).toHaveBeenCalledWith(yaml.load);
    });

    test("does not use node-eval", () => {
      parsers.NewYaml();
      expect(buildSafeParser).not.toHaveBeenCalledWith(nodeEval);
    });
  });
});
