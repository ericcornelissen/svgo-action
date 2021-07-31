const isNull = (msg) => msg !== null;

const Combine = jest.fn()
  .mockImplementation((...msgs) => {
    const filtered = msgs.filter(isNull);
    if (filtered.length === 0) {
      return null;
    }

    return filtered.join(",");
  })
  .mockName("Combine");

const New = jest.fn()
  .mockImplementation((msg) => msg)
  .mockName("New");

export default {
  Combine,
  New,
};
