const config = { };

const New = jest.fn()
  .mockReturnValue([config, null])
  .mockName("configs.New");

export default {
  New,
};
