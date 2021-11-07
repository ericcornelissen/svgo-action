const silent = jest.fn()
  .mockReturnValue(undefined)
  .mockName("import-from::silent");

export default {
  silent,
};
