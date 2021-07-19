const parseJavaScript = jest.fn()
  .mockReturnValue([{ }, null])
  .mockName("parsers.parseJavaScript");

const parseYaml = jest.fn()
  .mockReturnValue([{ }, null])
  .mockName("parsers.parseYaml");

export {
  parseJavaScript,
  parseYaml,
};
