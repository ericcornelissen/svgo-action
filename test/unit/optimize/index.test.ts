import { mocked } from "ts-jest/utils";

jest.mock("../../../src/errors");
jest.mock("../../../src/optimize/optimize");
jest.mock("../../../src/optimize/read");
jest.mock("../../../src/optimize/write");

import errors from "../../../src/errors";
import * as _optimize from "../../../src/optimize/optimize";
import * as _read from "../../../src/optimize/read";
import * as _write from "../../../src/optimize/write";

const optimizeAll = mocked(_optimize.optimizeAll);
const readFiles = mocked(_read.readFiles);
const writeFiles = mocked(_write.writeFiles);

import optimize from "../../../src/optimize/index";

describe("optimize/index.ts", () => {
  describe("::Files", () => {
    let fs;
    let optimizer;

    beforeAll(() => {
      fs = {
        listFiles: jest.fn()
          .mockReturnValue([])
          .mockName("fs.listFiles"),
        readFile: jest.fn()
          .mockResolvedValue(["", null])
          .mockName("fs.readFile"),
        writeFile: jest.fn()
          .mockResolvedValue(null)
          .mockName("fs.writeFile"),
      };

      optimizer = {
        optimize: jest.fn()
          .mockResolvedValue(["", null])
          .mockName("optimizer.optimize"),
      };
    });

    beforeEach(() => {
      optimizeAll.mockClear();
      readFiles.mockClear();
      writeFiles.mockClear();
    });

    test("optimize files", async () => {
      const config = { isDryRun: false };

      const [, err] = await optimize.Files({ config, fs, optimizer });
      expect(err).toBeNull();

      expect(optimizeAll).toHaveBeenCalled();
      expect(readFiles).toHaveBeenCalled();
      expect(writeFiles).toHaveBeenCalled();
    });

    test("dry run enabled", async () => {
      const config = { isDryRun: true };

      const [, err] = await optimize.Files({ config, fs, optimizer });
      expect(err).toBeNull();

      expect(optimizeAll).toHaveBeenCalled();
      expect(readFiles).toHaveBeenCalled();
      expect(writeFiles).not.toHaveBeenCalled();
    });

    describe.each([true, false])("outputs (dry mode: %p)", (isDryRun) => {
      const config = { isDryRun };

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
        expect(stats.svgCount).toEqual(files.length);
      });

      test.each(testCases)("optimized count, %#", async (files) => {
        optimizeAll.mockResolvedValueOnce([files, null]);

        const [stats, err] = await optimize.Files({ config, fs, optimizer });
        expect(err).toBeNull();
        expect(stats.optimizedCount).toEqual(files.length);
      });

      test.each(testCases)("read error, %#", async (files) => {
        const readError = errors.New("foobar");
        optimizeAll.mockResolvedValueOnce([files, readError]);

        const [stats, err] = await optimize.Files({ config, fs, optimizer });
        expect(err).not.toBeNull();
        expect(stats.optimizedCount).toEqual(files.length);
      });

      test.each(testCases)("optimize error, %#", async (files) => {
        const optimizeError = errors.New("foobar");
        optimizeAll.mockResolvedValueOnce([files, optimizeError]);

        const [stats, err] = await optimize.Files({ config, fs, optimizer });
        expect(err).not.toBeNull();
        expect(stats.optimizedCount).toEqual(files.length);
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
