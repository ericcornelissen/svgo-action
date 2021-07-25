import type { SupportedSvgoVersions } from "../../../src/svgo";

import { mocked } from "ts-jest/utils";

jest.mock("../../../src/svgo/svgo-v1-wrapper");
jest.mock("../../../src/svgo/svgo-v2-wrapper");

import * as svgoV1Wrapper from "../../../src/svgo/svgo-v1-wrapper";
import * as svgoV2Wrapper from "../../../src/svgo/svgo-v2-wrapper";
import svgo from "../../../src/svgo/index";

const SVGOptimizerV1 = mocked(svgoV1Wrapper.default);
const SVGOptimizerV2 = mocked(svgoV2Wrapper.default);

describe("svgo/index.ts", () => {
  describe("::New", () => {
    const v1Config = {
      svgoConfigPath: ".svgo.yml",
      svgoVersion: 1 as SupportedSvgoVersions,
    };
    const v2Config = {
      svgoConfigPath: "svgo.config.js",
      svgoVersion: 2 as SupportedSvgoVersions,
    };
    const svgoConfig = {
      multipass: false,
    };

    beforeEach(() => {
      SVGOptimizerV1.mockClear();
      SVGOptimizerV2.mockClear();
    });

    test("new SVGOptimizer for SVGO v1", () => {
      const config = v1Config;

      const [result, err] = svgo.New({ config, svgoConfig });
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SVGOptimizerV1).toHaveBeenCalledWith(svgoConfig);
    });

    test("new SVGOptimizer for SVGO v2", () => {
      const config = v2Config;

      const [result, err] = svgo.New({ config, svgoConfig });
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SVGOptimizerV2).toHaveBeenCalledWith(svgoConfig);
    });
  });
});
