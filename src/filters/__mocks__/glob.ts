import { filter } from "./__common__";

const NewGlobFilter = jest.fn()
  .mockReturnValue(filter)
  .mockName("filters.NewGlobFilter");

export default NewGlobFilter;
