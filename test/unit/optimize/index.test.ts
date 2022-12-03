import { when, resetAllWhenMocks } from "jest-when";

jest.mock("../../../src/errors");
jest.mock("../../../src/file-systems");
jest.mock("../../../src/optimize/read");
jest.mock("../../../src/optimize/write");

import errors, { error } from "../../../src/errors";
import fileSystems from "../../../src/file-systems";
import optimize from "../../../src/optimize/index";
import * as read from "../../../src/optimize/read";
import * as write from "../../../src/optimize/write";
import optimizer from "../../__common__/optimizer.mock";

const yieldFiles = read.yieldFiles as jest.MockedFunction<typeof read.yieldFiles>; // eslint-disable-line max-len
const writeFiles = write.writeFiles as jest.MockedFunction<typeof write.writeFiles>;// eslint-disable-line max-len

describe("optimize/index.ts", () => {
  describe("::Files", () => {
    let fs;

    beforeAll(() => {
      fs = fileSystems.New({ filters: [] });
    });

    beforeEach(() => {
      writeFiles.mockClear();
      yieldFiles.mockClear();

      resetAllWhenMocks();
    });

    describe("dry mode", () => {
      beforeEach(() => {
        yieldFiles.mockReturnValue([]);
      });

      test("disabled", async () => {
        const config = { isDryRun: { value: false } };

        const [, err] = await optimize.Files({ config, fs, optimizer });
        expect(err).toBeNull();

        expect(yieldFiles).toHaveBeenCalled();
        expect(writeFiles).toHaveBeenCalled();
      });

      test("enabled", async () => {
        const config = { isDryRun: { value: true } };

        const [, err] = await optimize.Files({ config, fs, optimizer });
        expect(err).toBeNull();

        expect(yieldFiles).toHaveBeenCalled();
        expect(writeFiles).not.toHaveBeenCalled();
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
        }],
        [{
          faultyFiles: [],
          goodFiles: [
            { path: "foo.bar", content: "<svg>1</svg>" },
          ],
          missingFiles: [],
          optimizedFiles: [],
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
        }],
      ])("test scenario %#", ({
        faultyFiles,
        goodFiles,
        missingFiles,
        optimizedFiles,
      }) => {
        const inFiles = [
          ...faultyFiles,
          ...goodFiles,
          ...missingFiles,
          ...optimizedFiles,
        ];

        beforeEach(() => {
          yieldFiles.mockReturnValueOnce(
            inFiles.map(
              (file) => missingFiles.includes(file)
                ? Promise.resolve([file, errors.New("missing")])
                : Promise.resolve([file, null]),
            ),
          );

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
        });

        test("svg count", async () => {
          const [stats, err] = await optimize.Files({ config, fs, optimizer });
          assertError(err);
          expect(stats.svgCount).toBe(inFiles.length);
        });

        test("optimized count", async () => {
          const [stats, err] = await optimize.Files({ config, fs, optimizer });
          assertError(err);
          expect(stats.optimizedCount).toBe(goodFiles.length);
        });

        function assertError(err: error) {
          if (
            faultyFiles.length +
            missingFiles.length +
            optimizedFiles.length === 0
          ) {
            expect(err).toBeNull();
          } else {
            expect(err).not.toBeNull();
          }
        }
      });

      test("write error", async () => {
        const writeError = errors.New("foobar");
        writeFiles.mockResolvedValueOnce(writeError);
        yieldFiles.mockReturnValueOnce([]);

        const [, err] = await optimize.Files({ config, fs, optimizer });
        if (isDryRun) { // eslint-disable-line jest/no-conditional-in-test
          expect(err).toBeNull(); // eslint-disable-line jest/no-conditional-expect
          writeFiles(fs, []);
        } else {
          expect(err).not.toBeNull(); // eslint-disable-line jest/no-conditional-expect
        }
      });
    });
  });
});
