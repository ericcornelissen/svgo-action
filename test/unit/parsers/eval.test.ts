jest.mock("eval");
jest.mock("js-yaml");

import _jsEval from "eval";
import * as yaml from "js-yaml";

import * as evaluate from "../../../src/parsers/eval";

const jsEval = _jsEval as jest.MockedFunction<typeof _jsEval>;
const yamlLoad = yaml.load as jest.MockedFunction<typeof yaml.load>;

describe("parsers/eval.js", () => {
  beforeEach(() => {
    jsEval.mockClear();
    yamlLoad.mockClear();
  });

  describe("::jsEval", () => {
    const content = "module.exports = { foo: 'bar' };";

    test("does use eval", () => {
      evaluate.jsEval(content);
      expect(jsEval).toHaveBeenCalledWith(content, expect.stringMatching(".+"));
    });

    test("does not use js-yaml", () => {
      evaluate.jsEval(content);
      expect(yaml.load).not.toHaveBeenCalled();
    });
  });

  describe("::yamlEval", () => {
    const content = "foo: bar";

    test("does not use eval", () => {
      evaluate.yamlEval(content);
      expect(jsEval).not.toHaveBeenCalled();
    });

    test("does use js-yaml", () => {
      evaluate.yamlEval(content);
      expect(yaml.load).toHaveBeenCalledWith(content);
    });
  });
});
