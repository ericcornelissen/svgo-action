const optimize = jest.fn()
  .mockReturnValue({ data: "<svg></svg>" })
  .mockName("svgo-v1.optimize");

const svgo = jest.fn()
  .mockReturnValue({ optimize })
  .mockName("svgo-v1");

export default svgo;
