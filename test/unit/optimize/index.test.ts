import type { error } from "../../../src/errors";
import type { FileSystem } from "../../../src/file-systems";

import { when, resetAllWhenMocks } from "jest-when";

jest.mock("../../../src/errors");
jest.mock("../../../src/file-systems");

import errors from "../../../src/errors";
import fileSystems from "../../../src/file-systems";
import optimize from "../../../src/optimize/index";
import optimizer from "../../__common__/optimizer.mock";

describe("optimize/index.ts", () => {
  describe("::Files", () => {
    let fs: jest.Mocked<FileSystem>;

    beforeAll(() => {
      fs = fileSystems.New({ filters: [] }) as jest.Mocked<FileSystem>;
    });

    beforeEach(() => {
      fs.listFiles.mockClear();
      fs.readFile.mockClear();
      fs.writeFile.mockClear();

      resetAllWhenMocks();
    });

    describe("dry mode", () => {
      beforeEach(() => {
        fs.listFiles.mockReturnValue([
          { path: "foo.bar" },
        ]);
      });

      test("disabled", async () => {
        const config = { isDryRun: { value: false } };

        const [, err] = await optimize.Files({ config, fs, optimizer });
        expect(err).toBeNull();

        expect(fs.listFiles).toHaveBeenCalled();
        expect(fs.writeFile).toHaveBeenCalled();
      });

      test("enabled", async () => {
        const config = { isDryRun: { value: true } };

        const [, err] = await optimize.Files({ config, fs, optimizer });
        expect(err).toBeNull();

        expect(fs.listFiles).toHaveBeenCalled();
        expect(fs.writeFile).not.toHaveBeenCalled();
      });
    });

    describe.each([true, false])("outputs (dry mode: %p)", (isDryRun) => {
      const config = { isDryRun: { value: isDryRun } };

      describe.each([
        [{
          faultyFiles: [],
          goodFiles: [],
          missingFiles: [],
          optimizedFiles: [],
          readonlyFiles: [],
        }],
        [{
          faultyFiles: [],
          goodFiles: [
            { path: "foo.bar", content: "<svg>1</svg>" },
          ],
          missingFiles: [],
          optimizedFiles: [],
          readonlyFiles: [],
        }],
        [{
          faultyFiles: [],
          goodFiles: [
            { path: "foo.bar", content: "<svg>1</svg>" },
            { path: "bar.foo", content: "<svg>2</svg>" },
            { path: "foobar", content: "<svg>3</svg>" },
          ],
          missingFiles: [],
          optimizedFiles: [],
          readonlyFiles: [],
        }],
        [{
          faultyFiles: [],
          goodFiles: [
            { path: "foo.bar", content: "<svg>a</svg>" },
            { path: "bar.foo", content: "<svg>b</svg>" },
          ],
          missingFiles: [
            { path: "missing.svg", content: "" },
          ],
          optimizedFiles: [
            { path: "optimized.svg", content: "<svg>c</svg>" },
          ],
          readonlyFiles: [
            { path: "readonly.svg", content: "immutable" },
          ],
        }],
        [{
          faultyFiles: [
            { path: "not-a.svg", content: "this isn't a SVG" },
          ],
          goodFiles: [],
          missingFiles: [
            { path: "missing.svg", content: "" },
          ],
          optimizedFiles: [
            { path: "optimized.svg", content: "<svg>a</svg>" },
          ],
          readonlyFiles: [
            { path: "readonly.svg", content: "immutable" },
          ],
        }],
      ])("test scenario %#", ({
        faultyFiles,
        goodFiles,
        missingFiles,
        optimizedFiles,
        readonlyFiles,
      }) => {
        const inFiles = [
          ...faultyFiles,
          ...goodFiles,
          ...missingFiles,
          ...optimizedFiles,
          ...readonlyFiles,
        ];

        const optimizedCount = goodFiles.length +
          (isDryRun ? readonlyFiles.length : 0);

        beforeEach(() => {
          fs.listFiles.mockReturnValueOnce(inFiles);
          inFiles.forEach((file) => {
            when(fs.readFile)
              .calledWith(file)
              .mockImplementation(() => {
                return missingFiles.includes(file)
                  ? Promise.resolve([file.content, errors.New("missing")])
                  : Promise.resolve([file.content, null]);
              });
          });

          faultyFiles.forEach((file) => {
            when(optimizer.optimize)
              .calledWith(file.content)
              .mockResolvedValue(["", errors.New("optimization failed")]);
          });
          goodFiles.forEach((file, i) => {
            when(optimizer.optimize)
              .calledWith(file.content)
              .mockResolvedValue([`${file.content}-${i}`, null]);
          });
          optimizedFiles.forEach((file) => {
            when(optimizer.optimize)
              .calledWith(file.content)
              .mockResolvedValue([file.content, null]);
          });
          readonlyFiles.forEach((file, i) => {
            const optimizedContent = `${file.content}-${i}`;
            when(optimizer.optimize)
              .calledWith(file.content)
              .mockResolvedValue([optimizedContent, null]);
            when(fs.writeFile)
              .calledWith(file, optimizedContent)
              .mockResolvedValue(errors.New("writing failed"));
          });
        });

        test("svg count", async () => {
          const [stats, err] = await optimize.Files({ config, fs, optimizer });
          assertError(err);
          expect(stats.svgCount).toBe(inFiles.length);
        });

        test("optimized count", async () => {
          const [stats, err] = await optimize.Files({ config, fs, optimizer });
          assertError(err);
          expect(stats.optimizedCount).toBe(optimizedCount);
        });

        function assertError(err: error) {
          if (
            faultyFiles.length +
            missingFiles.length +
            optimizedFiles.length +
            readonlyFiles.length === 0
          ) {
            expect(err).toBeNull();
          } else {
            expect(err).not.toBeNull();
          }
        }
      });
    });
  });
});
