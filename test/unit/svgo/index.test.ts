import type { AllowedSvgoVersions } from "../../../src/svgo";

import { when, resetAllWhenMocks } from "jest-when";

import { _sampleFs as fs } from "../../__mocks__/file-systems.mock";
import * as parsers from "../../__mocks__/parsers.mock";

const SVGOptimizerMock = jest.fn().mockName("SVGOptimizerMock constructor");
const SVGOWrapperMock = { SVGOptimizer: SVGOptimizerMock };

jest.mock("../../../src/parsers", () => parsers);
jest.mock("../../../src/svgo/svgo-wrapper", () => SVGOWrapperMock);

import svgo from "../../../src/svgo/index";
import errors from "../../../src/errors";

describe("svgo/index.ts", () => {
  describe("::New", () => {
    const v1Config = {
      svgoOptionsPath: ".svgo.yml",
      svgoVersion: 1 as AllowedSvgoVersions,
    };
    const v2Config = {
      svgoOptionsPath: "svgo.config.js",
      svgoVersion: 2 as AllowedSvgoVersions,
    };

    beforeEach(() => {
      fs.readFile.mockClear();
      parsers.parseYaml.mockClear();
      parsers.parseJavaScript.mockClear();

      resetAllWhenMocks();
    });

    test("new SVGO v1", async () => {
      const config = v1Config;

      const [result, err] = await svgo.New({ config, fs });
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(parsers.parseYaml).toHaveBeenCalledTimes(1);
    });

    test("new SVGO v2", async () => {
      const config = v2Config;

      const [result, err] = await svgo.New({ config, fs });
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(parsers.parseJavaScript).toHaveBeenCalledTimes(1);
    });

    test.each([
      v1Config,
      v2Config,
    ])("error reading configuration file", async (config) => {
      when(fs.readFile)
        .calledWith(config.svgoOptionsPath)
        .mockResolvedValueOnce(["", errors.New("reading error")]);

      const [result, err] = await svgo.New({ config, fs });
      expect(err).not.toBeNull();
      expect(result).not.toBeNull();
    });

    test.each([
      v1Config,
      v2Config,
    ])("error parsing configuration file", async (config) => {
      const parseErr = errors.New("parse error");

      parsers.parseJavaScript.mockReturnValueOnce([{}, parseErr]);
      parsers.parseYaml.mockReturnValueOnce([{}, parseErr]);

      const [result, err] = await svgo.New({ config, fs });
      expect(err).not.toBeNull();
      expect(result).not.toBeNull();
    });
  });
});
