import { parser } from "./__common__";

const NewJavaScript = jest.fn()
  .mockReturnValue(parser)
  .mockName("parsers.NewJavaScript");

const NewYaml = jest.fn()
.mockReturnValue(parser)
  .mockName("parsers.NewYaml");

export default {
  NewJavaScript,
  NewYaml,
};
