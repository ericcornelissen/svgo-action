import type { OptimizeProjectData } from "../src/types";

import * as core from "./mocks/@actions/core.mock";

jest.mock("@actions/core", () => core);

import {
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_SCHEDULE,
  OUTPUT_NAME_DID_OPTIMIZE,
  OUTPUT_NAME_OPTIMIZED_COUNT,
  OUTPUT_NAME_SKIPPED_COUNT,
  OUTPUT_NAME_SVG_COUNT,
} from "../src/constants";
import { setOutputValues } from "../src/outputs";


const sampleData = {
  files: [],
  optimizedCount: 3,
  skippedCount: 1,
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
    setOutputValues("unknown event", sampleData);
    expect(core.setOutput).not.toHaveBeenCalled();
  });

  test.each(sampleDataList)(`event ${EVENT_PULL_REQUEST}`, (data: OptimizeProjectData) => {
    setOutputValues(EVENT_PULL_REQUEST, data);
    expect(core.setOutput).toHaveBeenCalledTimes(4);
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_DID_OPTIMIZE,
      `${data.optimizedCount > 0}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_OPTIMIZED_COUNT,
      `${data.optimizedCount}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_SKIPPED_COUNT,
      `${data.skippedCount}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_SVG_COUNT,
      `${data.svgCount}`,
    );
  });

  test.each(sampleDataList)(`event ${EVENT_PUSH}`, (data: OptimizeProjectData) => {
    setOutputValues(EVENT_PUSH, data);
    expect(core.setOutput).toHaveBeenCalledTimes(4);
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_DID_OPTIMIZE,
      `${data.optimizedCount > 0}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_OPTIMIZED_COUNT,
      `${data.optimizedCount}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_SKIPPED_COUNT,
      `${data.skippedCount}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_SVG_COUNT,
      `${data.svgCount}`,
    );
  });

  test.each(sampleDataList)(`event ${EVENT_SCHEDULE}`, (data: OptimizeProjectData) => {
    setOutputValues(EVENT_SCHEDULE, data);
    expect(core.setOutput).toHaveBeenCalledTimes(4);
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_DID_OPTIMIZE,
      `${data.optimizedCount > 0}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_OPTIMIZED_COUNT,
      `${data.optimizedCount}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_SKIPPED_COUNT,
      `${data.skippedCount}`,
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      OUTPUT_NAME_SVG_COUNT,
      `${data.svgCount}`,
    );
  });

});
