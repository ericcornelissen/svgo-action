import type { SupportedSvgoVersions } from "../../../src/svgo";

import { mocked } from "ts-jest/utils";

jest.mock("../../../src/errors");
jest.mock("../../../src/svgo/project");
jest.mock("../../../src/svgo/v1");
jest.mock("../../../src/svgo/v2");

import errors from "../../../src/errors";
import svgo from "../../../src/svgo/index";
import _project from "../../../src/svgo/project";
import _svgoV1 from "../../../src/svgo/v1";
import _svgoV2 from "../../../src/svgo/v2";

const createSvgoOptimizerForProject = mocked(_project);
const svgoV1 = mocked(_svgoV1);
const svgoV2 = mocked(_svgoV2);

describe("svgo/index.ts", () => {
  describe("::New", () => {
    const svgoConfig = {
      multipass: false,
    };

    beforeEach(() => {
      svgoV1.New.mockClear();
      svgoV2.New.mockClear();
    });

    test("version 1", () => {
      const config = {
        svgoVersion: {
          value: "1" as SupportedSvgoVersions,
        },
      };

      const [result, err] = svgo.New({ config, svgoConfig });
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(svgoV1.New).toHaveBeenCalledWith(svgoConfig);
    });

    test("version 2", () => {
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

    test.each([
      "foobar",
      "Hello world!",
    ])("unknown string ('%s')", (svgoVersionValue) => {
      const config = {
        svgoVersion: {
          value: svgoVersionValue as SupportedSvgoVersions,
        },
      };

      const [, err] = svgo.New({ config, svgoConfig });
      expect(err).not.toBeNull();
      expect(err).toEqual(expect.stringContaining("unknown value"));
    });
  });
});
