const optimizer = { };

const New = jest.fn()
  .mockReturnValue([optimizer, null])
  .mockName("svgo.New");

export default {
  New,
};
