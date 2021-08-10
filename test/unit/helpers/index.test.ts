import { mocked } from "ts-jest/utils";

jest.mock("../../../src/helpers/events");
jest.mock("../../../src/helpers/filters");
jest.mock("../../../src/helpers/svgo-config");

import _isEventSupported from "../../../src/helpers/events";
import _getFilters from "../../../src/helpers/filters";
import _parseRawSvgoConfig from "../../../src/helpers/svgo-config";

import * as helpers from "../../../src/helpers/index";

const isEventSupported = mocked(_isEventSupported);
const getFilters = mocked(_getFilters);
const parseRawSvgoConfig = mocked(_parseRawSvgoConfig);

describe("helpers/index.ts", () => {
  test("::getFilters", () => {
    expect(helpers.getFilters).toBe(getFilters);
  });

  test("::isEventSupported", () => {
    expect(helpers.isEventSupported).toBe(isEventSupported);
  });

  test("::parseRawSvgoConfig", () => {
    expect(helpers.parseRawSvgoConfig).toBe(parseRawSvgoConfig);
  });
});
