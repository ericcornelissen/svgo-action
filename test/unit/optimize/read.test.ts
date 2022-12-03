import type { FileReader } from "../../../src/optimize/read";
import type { ReadFileHandle } from "../../../src/optimize/types";

import { when, resetAllWhenMocks } from "jest-when";

jest.mock("../../../src/errors");

import errors from "../../../src/errors";
import { yieldFiles } from "../../../src/optimize/read";

describe("optimize/read.ts", () => {
  describe("::yieldFiles", () => {
    let fs: jest.Mocked<FileReader>;

    beforeAll(() => {
      fs = {
        listFiles: jest.fn()
          .mockReturnValue([])
          .mockName("fs.listFiles"),
        readFile: jest.fn()
          .mockResolvedValue(["", null])
          .mockName("fs.readFile"),
      };
    });

    beforeEach(() => {
      fs.listFiles.mockClear();
      fs.readFile.mockClear();

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
    ])("read files, %#", async (inFiles) => {
      fs.listFiles.mockReturnValue(inFiles);
      inFiles.forEach((file, i) => {
        when(fs.readFile)
          .calledWith(file)
          .mockResolvedValue([`<svg>${i}</svg>`, null]);
      });

      const outFiles: ReadFileHandle[] = [];
      for await (const [file, err] of yieldFiles(fs)) {
        expect(err).toBeNull();
        outFiles.push(file);
      }
      expect(outFiles).toHaveLength(inFiles.length);

      expect(fs.listFiles).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledTimes(inFiles.length);
    });

    test.each([
      [
        [
          { path: "foo.bar", content: "<svg>a</svg>" },
          { path: "bar.foo", content: "<svg>b</svg>" },
        ],
        [
          { path: "does not exist", content: "<svg>c</svg>" },
        ],
      ],
      [
        [],
        [
          { path: "does not exist", content: "<svg>a</svg>" },
          { path: "also does not exist", content: "<svg>b</svg>" },
        ],
      ],
    ])("read files with some errors, %#", async (goodFiles, badFiles) => {
      const inFiles = [...badFiles, ...goodFiles];

      fs.listFiles.mockReturnValue(inFiles);

      goodFiles.forEach((file) => {
        when(fs.readFile)
          .calledWith(file)
          .mockResolvedValue([file.content, null]);
      });
      badFiles.forEach((file) => {
        when(fs.readFile)
          .calledWith(file)
          .mockResolvedValue([
            file.content,
            errors.New("could not read file"),
          ]);
      });

      const outFiles: ReadFileHandle[] = [];
      for await (const [file, err] of yieldFiles(fs)) {
        // eslint-disable-next-line jest/no-conditional-in-test
        if (goodFiles.some(({ content }) => content === file.content)) {
          expect(err).toBeNull(); // eslint-disable-line jest/no-conditional-expect
          outFiles.push(file);
        } else {
          expect(err).not.toBeNull(); // eslint-disable-line jest/no-conditional-expect
        }
      }

      expect(outFiles).toHaveLength(goodFiles.length);

      expect(fs.listFiles).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledTimes(inFiles.length);
    });
  });
});
