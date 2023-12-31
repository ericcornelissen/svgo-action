// SPDX-License-Identifier: MIT

jest.mock("../../../src/parsers/builder");
jest.mock("../../../src/parsers/eval");

import * as builder from "../../../src/parsers/builder";
import { jsEval } from "../../../src/parsers/eval";
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
  });
});
