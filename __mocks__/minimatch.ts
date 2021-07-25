const match = jest.fn()
  .mockReturnValue(false)
  .mockName("Minimatch.match");

const Minimatch = jest.fn()
  .mockReturnValue({ match })
  .mockName("minimatch.Minimatch");

export {
  Minimatch,
};
