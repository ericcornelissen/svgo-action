import type { IMinimatch } from "minimatch";

jest.mock("minimatch");

import { Minimatch } from "minimatch";

import New from "../../../src/filters/glob";

const MinimatchMock = Minimatch as jest.MockedClass<typeof Minimatch>;

describe("filters/glob.ts", () => {
  describe("::New", () => {
    beforeEach(() => {
      MinimatchMock.mockClear();
    });

    test("a file matching the glob", () => {
      const query = "foo/bar.svg";

      const match = jest.fn().mockReturnValue(true);
      MinimatchMock.mockReturnValueOnce({ match } as unknown as IMinimatch);

      const  filter = New("foo/*");

      const result = filter(query);
      expect(result).toBe(false);
      expect(match).toHaveBeenCalledWith(query);
    });

    test("a file not matching the glob", () => {
      const query = "foobar.svg";

      const match = jest.fn().mockReturnValue(false);
      MinimatchMock.mockReturnValueOnce({ match } as unknown as IMinimatch);

      const  filter = New("foo/*");

      const result = filter(query);
      expect(result).toBe(true);
      expect(match).toHaveBeenCalledWith(query);
    });
  });
});
