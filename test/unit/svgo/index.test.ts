// SPDX-License-Identifier: MIT

import type { SupportedSvgoVersions } from "../../../src/svgo";

jest.mock("@actions/core");
jest.mock("../../../src/errors");
jest.mock("../../../src/svgo/project");
jest.mock("../../../src/svgo/stub");
jest.mock("../../../src/svgo/v2");
jest.mock("../../../src/svgo/v3");

import errors from "../../../src/errors";
import svgo from "../../../src/svgo/index";
import _createSvgoOptimizerForProject from "../../../src/svgo/project";
import svgoV2 from "../../../src/svgo/v2";
import svgoV3 from "../../../src/svgo/v3";

const createSvgoOptimizerForProject = _createSvgoOptimizerForProject as jest.MockedFunction<typeof _createSvgoOptimizerForProject>; // eslint-disable-line max-len
const svgoV2New = svgoV2.New as jest.MockedFunction<typeof svgoV2.New>;
const svgoV3New = svgoV3.New as jest.MockedFunction<typeof svgoV3.New>;

describe("svgo/index.ts", () => {
  describe("::New", () => {
    const svgoConfig = {
      multipass: false,
    };

    describe("v2", () => {
      beforeEach(() => {
        svgoV2New.mockClear();
      });

      test("create instance", () => {
        const config = {
          svgoVersion: {
            value: "2" as SupportedSvgoVersions,
          },
        };

        const [result, err] = svgo.New({ config, svgoConfig });
        expect(err).toBeNull();
        expect(result).not.toBeNull();
        expect(svgoV2.New).toHaveBeenCalledWith(svgoConfig);
      });
    });

    describe("v3", () => {
      beforeEach(() => {
        svgoV3New.mockClear();
      });

      test("create instance", () => {
        const config = {
          svgoVersion: {
            value: "3" as SupportedSvgoVersions,
          },
        };

        const [result, err] = svgo.New({ config, svgoConfig });
        expect(err).toBeNull();
        expect(result).not.toBeNull();
        expect(svgoV3.New).toHaveBeenCalledWith(svgoConfig);
      });
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
