import files from "./fixtures/file-data.json";

import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);

import { INPUT_NAME_REPO_TOKEN } from "../src/constants";
import { fetchYamlFile } from "../src/utils/fetch-yaml";


const token = core.getInput(INPUT_NAME_REPO_TOKEN, { required: true });
const client = new github.GitHub(token);


describe("::fetchYamlFile", () => {

  const testFiles = test.each(
    Object.keys(files)
      .filter((filePath) => filePath.endsWith(".yml")),
  );

  test("an unknown file", async () => {
    const result = await fetchYamlFile(client, "this is definitely not a file");
    expect(result).toEqual({ });
  });

  testFiles("a file in the repository ('%s')", async (filePath) => {
    const result = await fetchYamlFile(client, filePath);
    expect(result).not.toEqual({ });
  });

});
