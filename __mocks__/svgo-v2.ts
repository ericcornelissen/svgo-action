const optimize = jest.fn()
  .mockReturnValue({ data: "<svg></svg>" })
  .mockName("svgo-v2.optimize");

export default {
  optimize,
};
