jest.mock("../../../src/helpers/events");
jest.mock("../../../src/helpers/filters");
jest.mock("../../../src/helpers/svgo-config");

import {
  isClientRequired,
  isEventSupported,
} from "../../../src/helpers/events";
import {
  getFilters,
} from "../../../src/helpers/filters";
import {
  parseRawSvgoConfig,
} from "../../../src/helpers/svgo-config";

import * as helpers from "../../../src/helpers/index";

describe("helpers/index.ts", () => {
  test("::getFilters", () => {
    expect(helpers.getFilters).toBe(getFilters);
  });

  test("::isClientRequired", () => {
    expect(helpers.isClientRequired).toBe(isClientRequired);
  });

  test("::isEventSupported", () => {
    expect(helpers.isEventSupported).toBe(isEventSupported);
  });

  test("::parseRawSvgoConfig", () => {
    expect(helpers.parseRawSvgoConfig).toBe(parseRawSvgoConfig);
  });
});
