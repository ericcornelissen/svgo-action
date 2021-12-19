jest.mock("@actions/core");
jest.mock("../../../src/errors");
jest.mock("../../../src/svgo/custom");
jest.mock("../../../src/svgo/project");
jest.mock("../../../src/svgo/stub");
jest.mock("../../../src/svgo/v1");
jest.mock("../../../src/svgo/v2");

import * as core from "@actions/core";

import errors from "../../../src/errors";
import _createSvgoForVersion from "../../../src/svgo/custom";
import svgo from "../../../src/svgo/index";
import _createSvgoOptimizerForProject from "../../../src/svgo/project";
import svgoV1 from "../../../src/svgo/v1";
import svgoV2 from "../../../src/svgo/v2";

const createSvgoForVersion = _createSvgoForVersion as jest.MockedFunction<typeof _createSvgoForVersion>; // eslint-disable-line max-len
const createSvgoOptimizerForProject = _createSvgoOptimizerForProject as jest.MockedFunction<typeof _createSvgoOptimizerForProject>; // eslint-disable-line max-len
const svgoV1New = svgoV1.New as jest.MockedFunction<typeof svgoV1.New>;
const svgoV2New = svgoV2.New as jest.MockedFunction<typeof svgoV2.New>;

describe("svgo/index.ts", () => {
  describe("::New", () => {
    const svgoConfig = {
      multipass: false,
    };

    beforeEach(() => {
      svgoV1New.mockClear();
      svgoV2New.mockClear();
    });

    test("version 1", () => {
      const config = {
        svgoVersion: {
          value: "1",
        },
      };

      const [result, err] = svgo.New({ config, core, svgoConfig });
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(svgoV1.New).toHaveBeenCalledWith(svgoConfig);
    });

    test("version 2", () => {
      const config = {
        svgoVersion: {
          value: "2",
        },
      };

      const [result, err] = svgo.New({ config, core, svgoConfig });
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(svgoV2.New).toHaveBeenCalledWith(svgoConfig);
    });

    describe("custom", () => {
      const config = {
        svgoVersion: {
          value: "2.1.0",
        },
      };

      beforeEach(() => {
        createSvgoForVersion.mockClear();
      });

      test("no error", () => {
        const [svgOptimizer] = createSvgoForVersion(core, { });
        createSvgoForVersion.mockReturnValueOnce([svgOptimizer, null]);

        const [result, err] = svgo.New({ config, core, svgoConfig });
        expect(err).toBeNull();
        expect(result).not.toBeNull();
        expect(createSvgoForVersion).toHaveBeenCalledWith(
          core,
          svgoConfig,
        );
      });

      test("an error", () => {
        const [svgOptimizer] = createSvgoForVersion(core, { });
        createSvgoForVersion.mockReturnValueOnce([
          svgOptimizer,
          errors.New("failed to import the project's svgo"),
        ]);

        const [, err] = svgo.New({ config, core, svgoConfig });
        expect(err).not.toBeNull();
        expect(createSvgoForVersion).toHaveBeenCalledWith(
          core,
          svgoConfig,
        );
      });
    });

    describe("project", () => {
      const config = {
        svgoVersion: {
          value: "project",
        },
      };

      beforeEach(() => {
        createSvgoOptimizerForProject.mockClear();
      });

      test("no error", () => {
        const [svgOptimizer] = createSvgoOptimizerForProject({ });
        createSvgoOptimizerForProject.mockReturnValueOnce([svgOptimizer, null]);

        const [result, err] = svgo.New({ config, core, svgoConfig });
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

        const [, err] = svgo.New({ config, core, svgoConfig });
        expect(err).not.toBeNull();
        expect(createSvgoOptimizerForProject).toHaveBeenCalledWith(svgoConfig);
      });
    });
  });
});
