// https://nodejs.org/api/path.html#path_path_resolve_paths
const resolve = jest.fn()
  .mockImplementation((...args) => args.join("/"))
  .mockName("path.resolve");

export {
  resolve,
};
