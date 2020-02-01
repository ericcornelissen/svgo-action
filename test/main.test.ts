import * as core from "@actions/core";
import * as github from "@actions/github";

jest.mock('@actions/core', () => require('./mocks/@actions/core'));
jest.mock('@actions/github', () => require('./mocks/@actions/github'));

import { getPullRequestFiles } from "../src/github-api";


const PR_WITH_NO_CHANGES: number = 1;
const PR_WITH_ONE_SVG_CHANGED: number = 2;


describe("GitHub API::getChangedFiles", () => {

  const token: string = core.getInput("repo-token", { required: true });
  const client: github.GitHub = new github.GitHub(token);

  it("returns correctly for a Pull Request with 1 changed files", async () => {
    const changedFiles = await getPullRequestFiles(client, PR_WITH_ONE_SVG_CHANGED);
    expect(changedFiles).toBeDefined();
  });

  it("returns correctly for a Pull Request with no changes", async () => {
    const changedFiles = await getPullRequestFiles(client, PR_WITH_NO_CHANGES);
    expect(changedFiles).toBeDefined();
  });

});
