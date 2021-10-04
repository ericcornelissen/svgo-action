import type { SupportedSvgoVersions } from "../../../src/svgo";

import { mocked } from "ts-jest/utils";

jest.mock("../../../src/errors");
jest.mock("../../../src/svgo/project");
jest.mock("../../../src/svgo/svgo-v1-wrapper");
jest.mock("../../../src/svgo/svgo-v2-wrapper");

import errors from "../../../src/errors";
import * as project from "../../../src/svgo/project";
import * as svgoV1Wrapper from "../../../src/svgo/svgo-v1-wrapper";
import * as svgoV2Wrapper from "../../../src/svgo/svgo-v2-wrapper";

const createSvgoOptimizerForProject = mocked(project.default);
const SVGOptimizerV1 = mocked(svgoV1Wrapper.default);
const SVGOptimizerV2 = mocked(svgoV2Wrapper.default);

import svgo from "../../../src/svgo/index";

describe("svgo/index.ts", () => {
  describe("::New", () => {
    const svgoConfig = {
      multipass: false,
    };

    beforeEach(() => {
      SVGOptimizerV1.mockClear();
      SVGOptimizerV2.mockClear();
    });

    test("version 1", () => {
      const config = {
        svgoVersion: {
          value: 1 as SupportedSvgoVersions,
        },
      };

      const [result, err] = svgo.New({ config, svgoConfig });
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SVGOptimizerV1).toHaveBeenCalledWith(svgoConfig);
    });

    test("version 2", () => {
      const config = {
        svgoVersion: {
          value: 2 as SupportedSvgoVersions,
        },
      };

      const [result, err] = svgo.New({ config, svgoConfig });
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SVGOptimizerV2).toHaveBeenCalledWith(svgoConfig);
    });

    describe("project", () => {
      const config = {
        svgoVersion: {
          value: "project",
        },
      } as {
        readonly svgoVersion: {
          readonly value: "project";
        },
      };

      beforeEach(() => {
        createSvgoOptimizerForProject.mockClear();
      });

      test("no error", () => {
        const [svgOptimizer] = createSvgoOptimizerForProject({ });
        createSvgoOptimizerForProject.mockReturnValueOnce([svgOptimizer, null]);

        const [result, err] = svgo.New({ config, svgoConfig });
        expect(err).toBeNull();
        expect(result).not.toBeNull();
        expect(createSvgoOptimizerForProject).toHaveBeenCalledWith(svgoConfig);
      });

      test("an error", () => {
        const [svgOptimizer] = createSvgoOptimizerForProject({ });
        createSvgoOptimizerForProject.mockReturnValueOnce([
          svgOptimizer,
          errors.New("failed to import the project's svgo"),
        ]);

        const [, err] = svgo.New({ config, svgoConfig });
        expect(err).not.toBeNull();
        expect(createSvgoOptimizerForProject).toHaveBeenCalledWith(svgoConfig);
      });
    });
  });
});
