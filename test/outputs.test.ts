import type { OptimizeProjectData } from "../src/types";

import * as core from "./mocks/@actions/core.mock";

import {
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_SCHEDULE,
} from "../src/constants";
import { setOutputValues } from "../src/outputs";

const OUTPUT_NAME_DID_OPTIMIZE = "DID_OPTIMIZE";
const OUTPUT_NAME_IGNORED_COUNT = "IGNORED_COUNT";
const OUTPUT_NAME_OPTIMIZED_COUNT = "OPTIMIZED_COUNT";
const OUTPUT_NAME_SVG_COUNT = "SVG_COUNT";

const sampleData = {
  files: [],
  ignoredCount: 1,
  optimizedCount: 3,
  svgCount: 4,
};

const sampleDataList: OptimizeProjectData[] = [
  sampleData,
];

describe("::setOutputValues", () => {
  beforeEach(() => {
    core.setOutput.mockClear();
  });

  test("unknown event", () => {
    setOutputValues(core, "unknown event", sampleData);
    expect(core.setOutput).not.toHaveBeenCalled();
  });

  test.each(sampleDataList)(`event ${EVENT_PULL_REQUEST}`, (data: OptimizeProjectData) => {
    setOutputValues(core, EVENT_PULL_REQUEST, data);
    expect(core.setOutput).toHaveBeenCalledTimes(4);
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_DID_OPTIMIZE,
      `${data.optimizedCount > 0}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_IGNORED_COUNT,
      `${data.ignoredCount}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_OPTIMIZED_COUNT,
      `${data.optimizedCount}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_SVG_COUNT,
      `${data.svgCount}`,
    );
  });

  test.each(sampleDataList)(`event ${EVENT_PUSH}`, (data: OptimizeProjectData) => {
    setOutputValues(core, EVENT_PUSH, data);
    expect(core.setOutput).toHaveBeenCalledTimes(4);
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_DID_OPTIMIZE,
      `${data.optimizedCount > 0}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_IGNORED_COUNT,
      `${data.ignoredCount}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_OPTIMIZED_COUNT,
      `${data.optimizedCount}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_SVG_COUNT,
      `${data.svgCount}`,
    );
  });

  test.each(sampleDataList)(`event ${EVENT_SCHEDULE}`, (data: OptimizeProjectData) => {
    setOutputValues(core, EVENT_SCHEDULE, data);
    expect(core.setOutput).toHaveBeenCalledTimes(4);
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_DID_OPTIMIZE,
      `${data.optimizedCount > 0}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_IGNORED_COUNT,
      `${data.ignoredCount}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_OPTIMIZED_COUNT,
      `${data.optimizedCount}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_SVG_COUNT,
      `${data.svgCount}`,
    );
  });
});
