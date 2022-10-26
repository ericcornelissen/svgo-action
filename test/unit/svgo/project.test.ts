jest.mock("import-cwd");
jest.mock("../../../src/errors");
jest.mock("../../../src/svgo/stub");
jest.mock("../../../src/svgo/v1");
jest.mock("../../../src/svgo/v2");
jest.mock("../../../src/svgo/v3");

import importCwd from "import-cwd";

import createSvgoOptimizerForProject from "../../../src/svgo/project";
import svgoV1 from "../../../src/svgo/v1";
import svgoV2 from "../../../src/svgo/v2";
import svgoV3 from "../../../src/svgo/v3";

const importCwdSilent = importCwd.silent as jest.MockedFunction<typeof importCwd.silent>; // eslint-disable-line max-len
const svgoV2New = svgoV2.New as jest.MockedFunction<typeof svgoV2.New>;
const svgoV3New = svgoV3.New as jest.MockedFunction<typeof svgoV3.New>;

describe("svgo/project.ts", () => {
  describe("::New", () => {
    const svgoConfig = {
      multipass: false,
    };

    const svgoV1Export = { };
    const svgoV2Export = { extendDefaultPlugins: () => "" };
    const svgoV3Export = { loadConfig: () => "" };

    beforeEach(() => {
      importCwdSilent.mockReset();

      svgoV2New.mockClear();
      svgoV3New.mockClear();
    });

    test("tries to import 'svgo'", () => {
      importCwdSilent.mockReturnValue(undefined);

      createSvgoOptimizerForProject();
      expect(importCwdSilent).toHaveBeenCalledWith("svgo");
    });

    test("unsuccessful import", () => {
      importCwdSilent.mockReturnValue(undefined);

      const [result, err] = createSvgoOptimizerForProject();
      expect(result).not.toBeNull();
      expect(err).not.toBeNull();
      expect(err).toBe("package-local SVGO not found");
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

      test("with config, SVGO v3", () => {
        importCwdSilent.mockReturnValue(svgoV3Export);

        const [result, err] = createSvgoOptimizerForProject(svgoConfig);
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV3.NewFrom).toHaveBeenCalledWith(svgoV3Export, svgoConfig);
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

      test("without config, SVGO v3", () => {
        importCwdSilent.mockReturnValue(svgoV3Export);

        const [result, err] = createSvgoOptimizerForProject();
        expect(err).toBeNull();
        expect(result).not.toBeNull();

        expect(svgoV3.NewFrom).toHaveBeenCalledWith(svgoV3Export, { });
      });
    });
  });
});
