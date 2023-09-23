jest.mock("eval");

import _jsEval from "eval";

import * as evaluate from "../../../src/parsers/eval";

const jsEval = _jsEval as jest.MockedFunction<typeof _jsEval>;

describe("parsers/eval.js", () => {
  beforeEach(() => {
    jsEval.mockClear();
  });

  describe("::jsEval", () => {
    const content = "module.exports = { foo: 'bar' };";

    test("does use eval", () => {
      evaluate.jsEval(content);
      expect(jsEval).toHaveBeenCalledWith(content, expect.stringMatching(".+"));
    });
  });
});
