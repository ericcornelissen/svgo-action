// SPDX-License-Identifier: MIT

jest.dontMock("svgo-v2");
jest.dontMock("svgo-v3");

jest.mock("@actions/core");
jest.mock("import-cwd");
jest.mock("../../../src/errors");
jest.mock("../../../src/svgo/stub");
jest.mock("../../../src/svgo/v2");
jest.mock("../../../src/svgo/v3");

import * as core from "@actions/core";
import importCwd from "import-cwd";
import svgoV2Export from "svgo-v2"; // eslint-disable-line import/default
import svgoV3Export from "svgo-v3"; // eslint-disable-line import/default

import createSvgoOptimizerForProject from "../../../src/svgo/project";
import svgoV2 from "../../../src/svgo/v2";
import svgoV3 from "../../../src/svgo/v3";

const coreWarning = core.warning as jest.MockedFunction<typeof core.warning>;
const importCwdSilent = importCwd.silent as jest.MockedFunction<typeof importCwd.silent>; // eslint-disable-line max-len
const svgoV2New = svgoV2.New as jest.MockedFunction<typeof svgoV2.New>;
const svgoV3New = svgoV3.New as jest.MockedFunction<typeof svgoV3.New>;

describe("svgo/project.ts", () => {
  describe("::New", () => {
    const svgoConfig = {
      multipass: false,
    };

    class svgoV1Export { }

    beforeEach(() => {
      coreWarning.mockClear();

      importCwdSilent.mockReset();

      svgoV2New.mockClear();
      svgoV3New.mockClear();
    });

    test("tries to import 'svgo'", () => {
      importCwdSilent.mockReturnValue(undefined);

      createSvgoOptimizerForProject(undefined);
      expect(importCwdSilent).toHaveBeenCalledWith("svgo");
    });

    test("unexpected import", () => {
      importCwdSilent.mockReturnValue(3.14);

      const [result, err] = createSvgoOptimizerForProject(undefined);
      expect(result).not.toBeNull();
      expect(err).not.toBeNull();
      expect(err).toMatch(/^unexpected SVGO import/);
    });

    describe("unsuccessful import", () => {
      test("with config, SVGO v1", () => {
        importCwdSilent.mockReturnValue(svgoV1Export);

        const [result, err] = createSvgoOptimizerForProject(svgoConfig);
        expect(result).not.toBeNull();
        expect(err).not.toBeNull();
        expect(err).toBe("SVGO v1 detected, not supported");
      });

      test("without config, SVGO v1", () => {
        importCwdSilent.mockReturnValue(svgoV1Export);

        const [result, err] = createSvgoOptimizerForProject(undefined);
        expect(result).not.toBeNull();
        expect(err).not.toBeNull();
        expect(err).toBe("SVGO v1 detected, not supported");
      });

      test.each([null, undefined])("%s", (v) => {
        importCwdSilent.mockReturnValue(v);

        const [result, err] = createSvgoOptimizerForProject(undefined);
        expect(result).not.toBeNull();
        expect(err).not.toBeNull();
        expect(err).toBe("package-local SVGO not found");
      });
    });

    describe("successful import", () => {
      test("with config, SVGO v2", () => {
        importCwdSilent.mockReturnValue(svgoV2Export);

        const [result, err] = createSvgoOptimizerForProject(svgoConfig);
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV2.NewFrom).toHaveBeenCalledWith(svgoV2Export, svgoConfig);
      });

      test("with config, SVGO v3", () => {
        importCwdSilent.mockReturnValue(svgoV3Export);

        const [result, err] = createSvgoOptimizerForProject(svgoConfig);
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV3.NewFrom).toHaveBeenCalledWith(svgoV3Export, svgoConfig);
      });

      test("without config, SVGO v2", () => {
        importCwdSilent.mockReturnValue(svgoV2Export);

        const [result, err] = createSvgoOptimizerForProject(undefined);
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV2.NewFrom).toHaveBeenCalledWith(svgoV2Export, { });
      });

      test("without config, SVGO v3", () => {
        importCwdSilent.mockReturnValue(svgoV3Export);

        const [result, err] = createSvgoOptimizerForProject(undefined);
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV3.NewFrom).toHaveBeenCalledWith(svgoV3Export, { });
      });

      test("no deprecation warning for SVGO v2", () => {
        importCwdSilent.mockReturnValue(svgoV2Export);

        const [, err] = createSvgoOptimizerForProject(svgoConfig);
        expect(err).toBeNull(); // check for unexpected errors

        expect(core.warning).not.toHaveBeenCalled();
      });

      test("no deprecation warning for SVGO v3", () => {
        importCwdSilent.mockReturnValue(svgoV3Export);

        const [, err] = createSvgoOptimizerForProject(svgoConfig);
        expect(err).toBeNull(); // check for unexpected errors

        expect(core.warning).not.toHaveBeenCalled();
      });
    });
  });
});
