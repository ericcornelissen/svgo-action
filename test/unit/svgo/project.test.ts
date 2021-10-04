import { mocked } from "ts-jest/utils";

jest.mock("../../../src/svgo/svgo-v2-wrapper");

import * as svgoV2Wrapper from "../../../src/svgo/svgo-v2-wrapper";

const SVGOptimizerV2 = mocked(svgoV2Wrapper.default);

import createSvgoOptimizerForProject from "../../../src/svgo/project";

describe("svgo/project.ts", () => {
  describe("::New", () => {
    const svgoConfig = {
      multipass: false,
    };

    beforeEach(() => {
      SVGOptimizerV2.mockClear();
    });

    test("with config", () => {
      const [result, err] = createSvgoOptimizerForProject(svgoConfig);
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SVGOptimizerV2).toHaveBeenCalledWith(svgoConfig);
    });

    test("without config", () => {
      const [result, err] = createSvgoOptimizerForProject();
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SVGOptimizerV2).toHaveBeenCalledWith({ });
    });
  });
});
