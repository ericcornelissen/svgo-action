const resolve = jest.fn()
  .mockReturnValue("filepath")
  .mockName("path.resolve");

export {
  resolve,
};
