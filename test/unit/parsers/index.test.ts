const builderMock = {
  buildParser: jest.fn().mockName("buildParser"),
};
const jsYamlMock = {
  load: jest.fn().mockName("js-yaml.load"),
};
const nodeEvalMock = jest.fn().mockName("nodeEval");

jest.mock("js-yaml", () => jsYamlMock);
jest.mock("node-eval", () => nodeEvalMock);
jest.mock("../../../src/parsers/builder", () => builderMock);

import "../../../src/parsers/index";

test("parsers/index.js::JavaScript", () => {
  expect(builderMock.buildParser).toHaveBeenCalledWith(nodeEvalMock);
});

test("parsers/index.js::YAML", () => {
  expect(builderMock.buildParser).toHaveBeenCalledWith(jsYamlMock.load);
});
