jest.mock("eval");
jest.mock("js-yaml");
jest.mock("../../../src/parsers/builder");

import jsEval from "eval";
import * as yaml from "js-yaml";

import * as builder from "../../../src/parsers/builder";
import parsers from "../../../src/parsers/index";

const buildSafeParser = builder.buildSafeParser as jest.MockedFunction<typeof builder.buildSafeParser>; // eslint-disable-line max-len

describe("parsers/index.js", () => {
  beforeEach(() => {
    buildSafeParser.mockClear();
  });

  describe("::NewJavaScript", () => {
    test("does use eval", () => {
      parsers.NewJavaScript();
      expect(buildSafeParser).toHaveBeenCalledWith(jsEval);
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

    test("does not use eval", () => {
      parsers.NewYaml();
      expect(buildSafeParser).not.toHaveBeenCalledWith(jsEval);
    });
  });
});
