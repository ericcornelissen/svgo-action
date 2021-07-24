import { mocked } from "ts-jest/utils";

jest.mock("../../../src/filters/pr-files");
jest.mock("../../../src/filters/pushed-files");
jest.mock("../../../src/filters/svgs");

import { _sampleClient as client } from "../../__mocks__/clients.mock";

import filters from "../../../src/filters/index";
import _NewPrFilesFilter from "../../../src/filters/pr-files";
import _NewPushedFilesFilter from "../../../src/filters/pushed-files";
import _NewSvgsFilter from "../../../src/filters/svgs";

const NewPrFilesFilter = mocked(_NewPrFilesFilter);
const NewPushedFilesFilter = mocked(_NewPushedFilesFilter);
const NewSvgsFilter = mocked(_NewSvgsFilter);

describe("filters/index.ts", () => {
  const context = {
    payload: {
      commits: [],
      pull_request: {
        number: 42,
      },
    },
    repo: {
      owner: "pikachu",
      repo: "pokédex",
    },
  };

  beforeEach(() => {
    NewPrFilesFilter.mockClear();
    NewPushedFilesFilter.mockClear();
    NewSvgsFilter.mockClear();
  });

  test("create Pull Request files filter", async () => {
    await filters.NewPrFilesFilter({ client, context });
    expect(NewPrFilesFilter).toHaveBeenCalled();
  });

  test("create pushed files filter", async () => {
    await filters.NewPushedFilesFilter({ client, context });
    expect(NewPushedFilesFilter).toHaveBeenCalled();
  });

  test("create SVGs filter", () => {
    filters.NewSvgsFilter();
    expect(NewSvgsFilter).toHaveBeenCalled();
  });
});
