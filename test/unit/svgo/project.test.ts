import { mocked } from "ts-jest/utils";

jest.mock("import-cwd");
jest.mock("../../../src/svgo/svgo-v1-wrapper");
jest.mock("../../../src/svgo/svgo-v2-wrapper");

import importCwd from "import-cwd";

import * as svgoV1Wrapper from "../../../src/svgo/svgo-v1-wrapper";
import * as svgoV2Wrapper from "../../../src/svgo/svgo-v2-wrapper";

const importCwdSilent = mocked(importCwd.silent);
const SVGOptimizerV1 = mocked(svgoV1Wrapper.default);
const SVGOptimizerV2 = mocked(svgoV2Wrapper.default);

import createSvgoOptimizerForProject from "../../../src/svgo/project";

describe("svgo/project.ts", () => {
  describe("::New", () => {
    const svgoConfig = {
      multipass: false,
    };

    const svgoV1 = { };
    const svgoV2 = { optimize: () => "" };

    beforeEach(() => {
      importCwdSilent.mockReset();

      SVGOptimizerV1.mockClear();
      SVGOptimizerV2.mockClear();
    });

    test("unsuccessful import", () => {
      importCwdSilent.mockReturnValue(undefined);

      const [, err] = createSvgoOptimizerForProject();
      expect(err).not.toBeNull();
    });

    describe("successful import", () => {
      test("with config, SVGO v1", () => {
        importCwdSilent.mockReturnValue(svgoV1);

        const [result, err] = createSvgoOptimizerForProject(svgoConfig);
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(SVGOptimizerV1).toHaveBeenCalledWith(svgoConfig);
      });

      test("with config, SVGO v2", () => {
        importCwdSilent.mockReturnValue(svgoV2);

        const [result, err] = createSvgoOptimizerForProject(svgoConfig);
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(SVGOptimizerV2).toHaveBeenCalledWith(svgoConfig);
      });

      test("without config, SVGO v1", () => {
        importCwdSilent.mockReturnValue(svgoV1);

        const [result, err] = createSvgoOptimizerForProject();
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(SVGOptimizerV1).toHaveBeenCalledWith({ });
      });

      test("without config, SVGO v2", () => {
        importCwdSilent.mockReturnValue(svgoV2);

        const [result, err] = createSvgoOptimizerForProject();
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(SVGOptimizerV2).toHaveBeenCalledWith({ });
      });
    });
  });
});
