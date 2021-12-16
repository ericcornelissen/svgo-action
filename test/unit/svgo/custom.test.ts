jest.mock("@actions/core");
jest.mock("import-from");
jest.mock("../../../src/errors");
jest.mock("../../../src/svgo/v1");
jest.mock("../../../src/svgo/v2");

import * as core from "@actions/core";
import importFrom from "import-from";

import createSvgoForVersion from "../../../src/svgo/custom";
import svgoV1 from "../../../src/svgo/v1";
import svgoV2 from "../../../src/svgo/v2";

const coreGetState = core.getState as jest.MockedFunction<typeof core.getState>;
const importFromSilent = importFrom.silent as jest.MockedFunction<typeof importFrom.silent>; // eslint-disable-line max-len
const svgoV1New = svgoV1.New as jest.MockedFunction<typeof svgoV1.New>;
const svgoV2New = svgoV2.New as jest.MockedFunction<typeof svgoV2.New>;

describe("svgo/custom.ts", () => {
  describe("::New", () => {
    const svgoConfig = {
      multipass: false,
    };

    const svgoV1Export = { };
    const svgoV2Export = { optimize: () => "" };

    beforeEach(() => {
      importFromSilent.mockReset();

      svgoV1New.mockClear();
      svgoV2New.mockClear();
    });

    test("tries to import 'svgo'", () => {
      const path = "foobar";

      coreGetState.mockReturnValue(path);
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
