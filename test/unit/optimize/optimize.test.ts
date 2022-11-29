import type { Optimizer } from "../../../src/optimize/types";

import { when, resetAllWhenMocks } from "jest-when";

jest.mock("../../../src/errors");

import errors from "../../../src/errors";
import { optimizeAll } from "../../../src/optimize/optimize";

describe("optimize/optimize.ts", () => {
  describe("::optimizeAll", () => {
    let optimizer: jest.Mocked<Optimizer>;

    beforeAll(() => {
      optimizer = {
        optimize: jest.fn()
          .mockResolvedValue(["", null])
          .mockName("optimizer.optimize"),
      };
    });

    beforeEach(() => {
      optimizer.optimize.mockClear();

      resetAllWhenMocks();
    });

    test.each([
      [[]],
      [[
        { path: "foo.bar", content: "<svg>a</svg>" },
      ]],
      [[
        { path: "foo.bar", content: "<svg>a</svg>" },
        { path: "bar.foo", content: "<svg>b</svg>" },
        { path: "foobar", content: "<svg>c</svg>" },
      ]],
    ])("optimize files, %#", async (inFiles) => {
      inFiles.forEach((file, i) => {
        when(optimizer.optimize)
          .calledWith(file.content)
          .mockResolvedValue([`${file.content}-${i}`, null]);
      });

      const [outFiles, err] = await optimizeAll(
        optimizer,
        inFiles.map((file) => Promise.resolve([file, null])),
      );
      expect(err).toBeNull();
      expect(outFiles).toHaveLength(inFiles.length);

      expect(optimizer.optimize).toHaveBeenCalledTimes(inFiles.length);
    });

    test.each([
      [
        [
          { path: "foo.bar", content: "<svg>a</svg>" },
          { path: "bar.foo", content: "<svg>b</svg>" },
        ],
        [
          { path: "optimized.svg", content: "<svg>c</svg>" },
        ],
      ],
      [
        [],
        [
          { path: "optimized.svg", content: "<svg>a</svg>" },
        ],
      ],
    ])("optimize files with some already optimized, %#", async (
      notOptimizedFiles,
      optimizedFiles,
    ) => {
      const inFiles = [...notOptimizedFiles, ...optimizedFiles];

      notOptimizedFiles.forEach((file, i) => {
        when(optimizer.optimize)
          .calledWith(file.content)
          .mockResolvedValue([`${file.content}-${i}`, null]);
      });
      optimizedFiles.forEach((file) => {
        when(optimizer.optimize)
          .calledWith(file.content)
          .mockResolvedValue([file.content, null]);
      });

      const [outFiles, err] = await optimizeAll(
        optimizer,
        inFiles.map((file) => Promise.resolve([file, null])),
      );
      expect(err).toBeNull();
      expect(outFiles).toHaveLength(notOptimizedFiles.length);

      expect(optimizer.optimize).toHaveBeenCalledTimes(inFiles.length);
    });

    test.each([
      [
        [
          { path: "foo.bar", content: "<svg>a</svg>" },
          { path: "bar.foo", content: "<svg>b</svg>" },
        ],
        [
          { path: "does not exist", content: "c" },
        ],
      ],
      [
        [],
        [
          { path: "does not exist", content: "a" },
          { path: "also does not exist", content: "b" },
        ],
      ],
    ])("optimize files with some errors, %#", async (goodFiles, badFiles) => {
      const inFiles = [...badFiles, ...goodFiles];

      goodFiles.forEach((file, i) => {
        when(optimizer.optimize)
          .calledWith(file.content)
          .mockResolvedValue([`${file.content}-${i}`, null]);
      });
      badFiles.forEach((file) => {
        when(optimizer.optimize)
          .calledWith(file.content)
          .mockResolvedValue(["", errors.New("could not optimize file")]);
      });

      const [outFiles, err] = await optimizeAll(
        optimizer,
        inFiles.map((file) => Promise.resolve([file, null])),
      );
      expect(err).not.toBeNull();
      expect(outFiles).toHaveLength(goodFiles.length);

      expect(optimizer.optimize).toHaveBeenCalledTimes(inFiles.length);
    });
  });
});
