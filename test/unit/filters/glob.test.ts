jest.mock("@actions/glob");

import { create } from "@actions/glob";

import New from "../../../src/filters/glob";

const globCreateMock = create as jest.MockedFunction<typeof create>;

describe("filters/glob.ts", () => {
  describe("::New", () => {
    let getSearchPaths: jest.Mock;
    let globGenerator: jest.Mock;

    beforeAll(() => {
      getSearchPaths = jest.fn();
      globGenerator = jest.fn();
    });

    beforeEach(() => {
      globCreateMock.mockClear();
    });

    test("a file matching the glob", async () => {
      const query = "foo/bar.svg";

      const glob = jest.fn().mockReturnValue(["foo/bar.svg"]);
      const globber = { glob, globGenerator, getSearchPaths };
      globCreateMock.mockResolvedValueOnce(globber);

      const filter = await New("foo/*");

      const result = filter(query);
      expect(result).toBe(false);
    });

    test("a file not matching the glob", async () => {
      const query = "foobar.svg";

      const glob = jest.fn().mockReturnValue([]);
      const globber = { glob, globGenerator, getSearchPaths };
      globCreateMock.mockResolvedValueOnce(globber);

      const filter = await New("foo/*");

      const result = filter(query);
      expect(result).toBe(true);
    });

    test("globber configuration", async () => {
      const glob = "foo/*";

      const globber = { glob: jest.fn(), globGenerator, getSearchPaths };
      globCreateMock.mockResolvedValueOnce(globber);

      await New(glob);
      expect(globCreateMock).toHaveBeenCalledWith(glob, {
        followSymbolicLinks: false,
      });
    });
  });
});
