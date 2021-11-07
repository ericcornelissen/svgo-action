import { optimizer } from "./__common__";

const createSvgoForVersion = jest.fn()
  .mockReturnValue([optimizer, null])
  .mockName("svgo.createSvgoForVersion");

export default createSvgoForVersion;
