import { parser } from "./__common__";

const NewJavaScript = jest.fn()
  .mockReturnValue(parser)
  .mockName("parsers.NewJavaScript");

export default {
  NewJavaScript,
};
