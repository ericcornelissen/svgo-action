import { mocked } from "ts-jest/utils";

import inp from "../../__common__/inputter.mock";

jest.mock("@actions/github");
jest.mock("../../../src/clients");
jest.mock("../../../src/filters/pr-files");
jest.mock("../../../src/filters/pushed-files");
jest.mock("../../../src/filters/svgs");

import * as github from "@actions/github";

import clients from "../../../src/clients/index";
import _NewPrFilesFilter from "../../../src/filters/pr-files";
import _NewPushedFilesFilter from "../../../src/filters/pushed-files";
import _NewSvgsFilter from "../../../src/filters/svgs";

const NewPrFilesFilter = mocked(_NewPrFilesFilter);
const NewPushedFilesFilter = mocked(_NewPushedFilesFilter);
const NewSvgsFilter = mocked(_NewSvgsFilter);

import filters from "../../../src/filters/index";

describe("filters/index.ts", () => {
  let client;

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

  beforeAll(() => {
    [client] = clients.New({ github, inp });
  });

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
