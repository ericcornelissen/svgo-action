jest.mock("../../../src/parsers/builder");
jest.mock("../../../src/parsers/eval");

import * as builder from "../../../src/parsers/builder";
import { jsEval, yamlEval } from "../../../src/parsers/eval";
import parsers from "../../../src/parsers/index";

const buildSafeParser = builder.buildSafeParser as jest.MockedFunction<typeof builder.buildSafeParser>; // eslint-disable-line max-len

describe("parsers/index.js", () => {
  beforeEach(() => {
    buildSafeParser.mockClear();
  });

  describe("::NewJavaScript", () => {
    test("does use jsEval", () => {
      parsers.NewJavaScript();
      expect(buildSafeParser).toHaveBeenCalledWith(jsEval);
    });

    test("does not use yamlEval", () => {
      parsers.NewJavaScript();
      expect(buildSafeParser).not.toHaveBeenCalledWith(yamlEval);
    });
  });

  describe("::NewYaml", () => {
    test("does not use jsEval", () => {
      parsers.NewYaml();
      expect(buildSafeParser).toHaveBeenCalledWith(yamlEval);
    });

    test("does use yamlEval", () => {
      parsers.NewYaml();
      expect(buildSafeParser).not.toHaveBeenCalledWith(jsEval);
    });
  });
});
