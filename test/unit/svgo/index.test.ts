import type { SupportedSvgoVersions } from "../../../src/svgo";

import { mocked } from "ts-jest/utils";

jest.mock("../../../src/svgo/svgo-v1-wrapper");
jest.mock("../../../src/svgo/svgo-v2-wrapper");

import * as svgoV1Wrapper from "../../../src/svgo/svgo-v1-wrapper";
import * as svgoV2Wrapper from "../../../src/svgo/svgo-v2-wrapper";

const SVGOptimizerV1 = mocked(svgoV1Wrapper.default);
const SVGOptimizerV2 = mocked(svgoV2Wrapper.default);

import svgo from "../../../src/svgo/index";

describe("svgo/index.ts", () => {
  describe("::New", () => {
    const v1Config = {
      svgoConfigPath: {
        value: ".svgo.yml",
      },
      svgoVersion: {
        value: 1 as SupportedSvgoVersions,
      },
    };
    const v2Config = {
      svgoConfigPath: {
        value: "svgo.config.js",
      },
      svgoVersion: {
        value: 2 as SupportedSvgoVersions,
      },
    };
    const svgoConfig = {
      multipass: false,
    };

    beforeEach(() => {
      SVGOptimizerV1.mockClear();
      SVGOptimizerV2.mockClear();
    });

    test("version 1", () => {
      const config = v1Config;

      const [result, err] = svgo.New({ config, svgoConfig });
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SVGOptimizerV1).toHaveBeenCalledWith(svgoConfig);
    });

    test("version 2", () => {
      const config = v2Config;

      const [result, err] = svgo.New({ config, svgoConfig });
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SVGOptimizerV2).toHaveBeenCalledWith(svgoConfig);
    });
  });
});
