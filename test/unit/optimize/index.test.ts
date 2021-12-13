jest.mock("../../../src/errors");
jest.mock("../../../src/file-systems");
jest.mock("../../../src/optimize/optimize");
jest.mock("../../../src/optimize/read");
jest.mock("../../../src/optimize/write");

import errors from "../../../src/errors";
import fileSystems from "../../../src/file-systems";
import optimize from "../../../src/optimize/index";
import * as _optimize from "../../../src/optimize/optimize";
import * as read from "../../../src/optimize/read";
import * as write from "../../../src/optimize/write";
import optimizer from "../../__common__/optimizer.mock";

const optimizeAll = _optimize.optimizeAll as jest.MockedFunction<typeof _optimize.optimizeAll>; // eslint-disable-line max-len
const readFiles = read.readFiles as jest.MockedFunction<typeof read.readFiles>;
const writeFiles = write.writeFiles as jest.MockedFunction<typeof write.writeFiles>;// eslint-disable-line max-len

describe("optimize/index.ts", () => {
  describe("::Files", () => {
    let fs;

    beforeAll(() => {
      fs = fileSystems.New({ filters: [] });
    });

    beforeEach(() => {
      optimizeAll.mockClear();
      readFiles.mockClear();
      writeFiles.mockClear();
    });

    test("optimize files", async () => {
      const config = { isDryRun: { value: false } };

      const [, err] = await optimize.Files({ config, fs, optimizer });
      expect(err).toBeNull();

      expect(optimizeAll).toHaveBeenCalled();
      expect(readFiles).toHaveBeenCalled();
      expect(writeFiles).toHaveBeenCalled();
    });

    test("dry run enabled", async () => {
      const config = { isDryRun: { value: true } };

      const [, err] = await optimize.Files({ config, fs, optimizer });
      expect(err).toBeNull();

      expect(optimizeAll).toHaveBeenCalled();
      expect(readFiles).toHaveBeenCalled();
      expect(writeFiles).not.toHaveBeenCalled();
    });

    describe.each([true, false])("outputs (dry mode: %p)", (isDryRun) => {
      const config = { isDryRun: { value: isDryRun } };

      const testCases = [
        [[]],
        [[
          { path: "foo.bar", content: "<svg>1</svg>", optimizedContent: "svg" },
        ]],
        [[
          { path: "foo.bar", content: "<svg>1</svg>", optimizedContent: "s" },
          { path: "bar.foo", content: "<svg>2</svg>", optimizedContent: "v" },
          { path: "foobar", content: "<svg>3</svg>", optimizedContent: "g" },
        ]],
      ];

      test.each(testCases)("svg count, %#", async (files) => {
        readFiles.mockResolvedValueOnce([files, null]);

        const [stats, err] = await optimize.Files({ config, fs, optimizer });
        expect(err).toBeNull();
        expect(stats.svgCount).toBe(files.length);
      });

      test.each(testCases)("optimized count, %#", async (files) => {
        optimizeAll.mockResolvedValueOnce([files, null]);

        const [stats, err] = await optimize.Files({ config, fs, optimizer });
        expect(err).toBeNull();
        expect(stats.optimizedCount).toBe(files.length);
      });

      test.each(testCases)("read error, %#", async (files) => {
        const readError = errors.New("foobar");
        optimizeAll.mockResolvedValueOnce([files, readError]);

        const [stats, err] = await optimize.Files({ config, fs, optimizer });
        expect(err).not.toBeNull();
        expect(stats.optimizedCount).toBe(files.length);
      });

      test.each(testCases)("optimize error, %#", async (files) => {
        const optimizeError = errors.New("foobar");
        optimizeAll.mockResolvedValueOnce([files, optimizeError]);

        const [stats, err] = await optimize.Files({ config, fs, optimizer });
        expect(err).not.toBeNull();
        expect(stats.optimizedCount).toBe(files.length);
      });

      test("write error", async () => {
        const writeError = errors.New("foobar");
        writeFiles.mockResolvedValueOnce(writeError);

        const [, err] = await optimize.Files({ config, fs, optimizer });
        if (isDryRun) {
          expect(err).toBeNull(); // eslint-disable-line jest/no-conditional-expect
          writeFiles(fs, []);
        } else {
          expect(err).not.toBeNull(); // eslint-disable-line jest/no-conditional-expect
        }
      });
    });
  });
});
