// SPDX-License-Identifier: MIT

import type { Dirent } from "node:fs";

jest.mock("@actions/core");
jest.mock("@actions/github");
jest.mock("node:fs", () => require("../__common__/node-fs.mock.ts"));

import * as fs from "node:fs";

import * as core from "@actions/core";
import * as github from "@actions/github";

const coreSetOutput = core.setOutput as jest.MockedFunction<typeof core.setOutput>; // eslint-disable-line max-len
const fsExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
const fsReaddirSync = fs.readdirSync as jest.MockedFunction<typeof fs.readdirSync>; // eslint-disable-line max-len
const fsReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>; // eslint-disable-line max-len

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
    coreSetOutput.mockClear();

    fsReadFileSync.mockClear();
  });

  test.each(ALL_EVENTS)("reads SVGs ('%s')", async (eventName) => {
    github.context.eventName = eventName;

    const file1 = "file1.svg" as unknown as Dirent;
    const file2 = "file2.svg" as unknown as Dirent;

    fsReaddirSync.mockReturnValue([file1, file2]);
    fsExistsSync.mockReturnValue(true);

    await main({ core, github });

    expect(fs.readFileSync).toHaveBeenCalled();
  });

  test.each(ALL_EVENTS)("sets outputs ('%s')", async (eventName) => {
    github.context.eventName = eventName;

    await main({ core, github });

    expect(core.setOutput).toHaveBeenCalled();
  });
});
