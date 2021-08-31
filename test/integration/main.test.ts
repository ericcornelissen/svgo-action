import type { Dirent } from "fs";

import { mocked } from "ts-jest/utils";

jest.mock("@actions/core");
jest.mock("@actions/github");
jest.mock("fs");

import * as _core from "@actions/core";
import * as _github from "@actions/github";
import * as _fs from "fs";

const core = mocked(_core);
const fs = mocked(_fs);
const github = mocked(_github);

import main from "../../src/main";

describe("main", () => {
  const ALL_EVENTS = [
    "pull_request",
    "push",
    "repository_dispatch",
    "schedule",
    "workflow_dispatch",
  ];

  beforeEach(() => {
    core.setOutput.mockClear();

    fs.readFileSync.mockClear();
  });

  test.each(ALL_EVENTS)("reads SVGs ('%s')", async (eventName) => {
    github.context.eventName = eventName;

    const file1 = "file1.svg" as unknown as Dirent;
    const file2 = "file2.svg" as unknown as Dirent;

    fs.readdirSync.mockReturnValue([file1, file2]);
    fs.existsSync.mockReturnValue(true);

    await main({ core, github });

    expect(fs.readFileSync).toHaveBeenCalled();
  });

  test.each(ALL_EVENTS)("sets outputs ('%s')", async (eventName) => {
    github.context.eventName = eventName;

    await main({ core, github });

    expect(core.setOutput).toHaveBeenCalled();
  });
});
