import { mocked } from "ts-jest/utils";

jest.mock("@actions/core");
jest.mock("import-from");
jest.mock("../../../src/errors");
jest.mock("../../../src/svgo/v1");
jest.mock("../../../src/svgo/v2");

import * as _core from "@actions/core";
import importFrom from "import-from";

import _svgoV1 from "../../../src/svgo/v1";
import _svgoV2 from "../../../src/svgo/v2";

const core = mocked(_core);
const importFromSilent = mocked(importFrom.silent);
const svgoV1 = mocked(_svgoV1);
const svgoV2 = mocked(_svgoV2);

import createSvgoForVersion from "../../../src/svgo/custom";

describe("svgo/custom.ts", () => {
  describe("::New", () => {
    const svgoConfig = {
      multipass: false,
    };

    const svgoV1Export = { };
    const svgoV2Export = { optimize: () => "" };

    beforeEach(() => {
      importFromSilent.mockReset();

      svgoV1.New.mockClear();
      svgoV2.New.mockClear();
    });

    test("tries to import 'svgo'", () => {
      const path = "foobar";

      core.getState.mockReturnValue(path);
      importFromSilent.mockReturnValue(undefined);

      createSvgoForVersion(core);
      expect(importFromSilent).toHaveBeenCalledWith(path, "svgo");
    });

    test("unsuccessful import", () => {
      importFromSilent.mockReturnValue(undefined);

      const [result, err] = createSvgoForVersion(core);
      expect(err).not.toBeNull();
      expect(err).toBe("custom SVGO not found");
      expect(result).toBeNull();
    });

    describe("successful import", () => {
      test("with config, SVGO v1", () => {
        importFromSilent.mockReturnValue(svgoV1Export);

        const [result, err] = createSvgoForVersion(core, svgoConfig);
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV1.NewFrom).toHaveBeenCalledWith(svgoV1Export, svgoConfig);
      });

      test("with config, SVGO v2", () => {
        importFromSilent.mockReturnValue(svgoV2Export);

        const [result, err] = createSvgoForVersion(core, svgoConfig);
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV2.NewFrom).toHaveBeenCalledWith(svgoV2Export, svgoConfig);
      });

      test("without config, SVGO v1", () => {
        importFromSilent.mockReturnValue(svgoV1Export);

        const [result, err] = createSvgoForVersion(core);
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV1.NewFrom).toHaveBeenCalledWith(svgoV1Export, { });
      });

      test("without config, SVGO v2", () => {
        importFromSilent.mockReturnValue(svgoV2Export);

        const [result, err] = createSvgoForVersion(core);
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV2.NewFrom).toHaveBeenCalledWith(svgoV2Export, { });
      });
    });
  });
});
