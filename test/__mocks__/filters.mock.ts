const NewGlobFilter = jest.fn()
  .mockReturnValue(() => false)
  .mockName("NewGlobFilter");

const NewPrFilesFilter = jest.fn()
  .mockReturnValue([() => false, null])
  .mockName("NewPrFilesFilter");

const NewPushedFilesFilter = jest.fn()
  .mockReturnValue([() => false, null])
  .mockName("NewPushedFilesFilter");

const NewSvgsFilter = jest.fn()
  .mockReturnValue(() => false)
  .mockName("NewSvgsFilter");

export default {
  NewGlobFilter,
  NewPrFilesFilter,
  NewPushedFilesFilter,
  NewSvgsFilter,
};
