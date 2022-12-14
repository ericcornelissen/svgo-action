jest.mock("@actions/github");
jest.mock("../../../src/clients");
jest.mock("../../../src/filters/pr-files");
jest.mock("../../../src/filters/pushed-files");
jest.mock("../../../src/filters/svgs");

import * as github from "@actions/github";

import clients from "../../../src/clients/index";
import filters from "../../../src/filters/index";
import NewPrFilesFilter from "../../../src/filters/pr-files";
import NewPushedFilesFilter from "../../../src/filters/pushed-files";
import NewSvgsFilter from "../../../src/filters/svgs";
import inp from "../../__common__/inputter.mock";

const NewPrFilesFilterMock = NewPrFilesFilter as jest.MockedFunction<typeof NewPrFilesFilter>; // eslint-disable-line max-len
const NewPushedFilesFilterMock = NewPushedFilesFilter as jest.MockedFunction<typeof NewPushedFilesFilter>; // eslint-disable-line max-len
const NewSvgsFilterMock = NewSvgsFilter as jest.MockedFunction<typeof NewSvgsFilter>; // eslint-disable-line max-len

type MockedClient = jest.MockedObjectDeep<ReturnType<typeof clients.New>[0]>;

describe("filters/index.ts", () => {
  let client: MockedClient;

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
    const [_client] = clients.New({ github, inp });
    client = _client as MockedClient;
  });

  beforeEach(() => {
    NewPrFilesFilterMock.mockClear();
    NewPushedFilesFilterMock.mockClear();
    NewSvgsFilterMock.mockClear();
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
