import { mocked } from "ts-jest/utils";

jest.mock("import-cwd");
jest.mock("../../../src/errors");
jest.mock("../../../src/svgo/v1");
jest.mock("../../../src/svgo/v2");

import importCwd from "import-cwd";

import _svgoV1 from "../../../src/svgo/v1";
import _svgoV2 from "../../../src/svgo/v2";

const importCwdSilent = mocked(importCwd.silent);
const svgoV1 = mocked(_svgoV1);
const svgoV2 = mocked(_svgoV2);

import createSvgoOptimizerForProject from "../../../src/svgo/project";

describe("svgo/project.ts", () => {
  describe("::New", () => {
    const svgoConfig = {
      multipass: false,
    };

    const svgoV1Export = { };
    const svgoV2Export = { optimize: () => "" };

    beforeEach(() => {
      importCwdSilent.mockReset();

      svgoV1.New.mockClear();
      svgoV2.New.mockClear();
    });

    test("unsuccessful import", () => {
      importCwdSilent.mockReturnValue(undefined);

      const [result, err] = createSvgoOptimizerForProject();
      expect(err).not.toBeNull();
      expect(err).toEqual("package-local SVGO not found");
      expect(result).toBeNull();
    });

    describe("successful import", () => {
      test("with config, SVGO v1", () => {
        importCwdSilent.mockReturnValue(svgoV1Export);

        const [result, err] = createSvgoOptimizerForProject(svgoConfig);
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV1.NewFrom).toHaveBeenCalledWith(svgoV1Export, svgoConfig);
      });

      test("with config, SVGO v2", () => {
        importCwdSilent.mockReturnValue(svgoV2Export);

        const [result, err] = createSvgoOptimizerForProject(svgoConfig);
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV2.NewFrom).toHaveBeenCalledWith(svgoV2Export, svgoConfig);
      });

      test("without config, SVGO v1", () => {
        importCwdSilent.mockReturnValue(svgoV1Export);

        const [result, err] = createSvgoOptimizerForProject();
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV1.NewFrom).toHaveBeenCalledWith(svgoV1Export, { });
      });

      test("without config, SVGO v2", () => {
        importCwdSilent.mockReturnValue(svgoV2Export);

        const [result, err] = createSvgoOptimizerForProject();
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV2.NewFrom).toHaveBeenCalledWith(svgoV2Export, { });
      });
    });
  });
});
