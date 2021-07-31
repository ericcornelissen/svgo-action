import type { FileWriter } from "../../../src/optimize/write";

import { when, resetAllWhenMocks } from "jest-when";

jest.mock("../../../src/errors");

import errors from "../../../src/errors";

import { writeFiles } from "../../../src/optimize/write";

describe("optimize/write.ts", () => {
  describe("::writeFiles", () => {
    let fs: jest.Mocked<FileWriter>;

    beforeAll(() => {
      fs = {
        writeFile: jest.fn()
          .mockResolvedValue(null)
          .mockName("fs.writeFile"),
      };
    });

    beforeEach(() => {
      fs.writeFile.mockClear();

      resetAllWhenMocks();
    });

    test.each([
      [[]],
      [[
        { path: "foo.bar", optimizedContent: "<svg>a</svg>" },
      ]],
      [[
        { path: "foo.bar", optimizedContent: "<svg>a</svg>" },
        { path: "bar.foo", optimizedContent: "<svg>b</svg>" },
        { path: "foobar", optimizedContent: "<svg>c</svg>" },
      ]],
    ])("write files, %#", async (files) => {
      files.forEach((file) => {
        when(fs.writeFile)
          .calledWith(file, file.optimizedContent)
          .mockResolvedValue(null);
      });

      const err = await writeFiles(fs, files);
      expect(err).toBeNull();

      expect(fs.writeFile).toHaveBeenCalledTimes(files.length);
    });

    test.each([
      [
        [
          { path: "foo.bar", optimizedContent: "<svg>a</svg>" },
          { path: "bar.foo", optimizedContent: "<svg>b</svg>" },
        ],
        [
          { path: "cannot write", optimizedContent: "<svg>c</svg>" },
        ],
      ],
      [
        [],
        [
          { path: "cannot write", optimizedContent: "<svg>a</svg>" },
          { path: "also cannot write", optimizedContent: "<svg>b</svg>" },
        ],
      ],
    ])("read files with some errors, %#", async (goodFiles, badFiles) => {
      const files = [...badFiles, ...goodFiles];

      goodFiles.forEach((file) => {
        when(fs.writeFile)
          .calledWith(file, file.optimizedContent)
          .mockResolvedValue(null);
      });
      badFiles.forEach((file) => {
        when(fs.writeFile)
          .calledWith(file, file.optimizedContent)
          .mockResolvedValue(errors.New("could not read file"));
      });

      const err = await writeFiles(fs, files);
      expect(err).not.toBeNull();

      expect(fs.writeFile).toHaveBeenCalledTimes(files.length);
    });
  });
});
