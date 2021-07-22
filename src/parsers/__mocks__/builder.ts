const parser = jest.fn()
  .mockReturnValue([{ }, null]);

const buildSafeParser = jest.fn()
  .mockReturnValue(parser)
  .mockName("builders.ts::buildSafeParser");

export {
  buildSafeParser,
};
