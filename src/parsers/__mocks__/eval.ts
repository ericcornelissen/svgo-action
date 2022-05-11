const parsedContent = { };

const jsEval = jest.fn()
  .mockReturnValue(parsedContent)
  .mockName("parsers.jsEval");

const yamlEval = jest.fn()
  .mockReturnValue(parsedContent)
  .mockName("parsers.yamlEval");

export {
  jsEval,
  yamlEval,
};
