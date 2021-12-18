import { filter } from "./__common__";

const NewSvgsFilter = jest.fn()
  .mockReturnValue([filter, null])
  .mockName("filters.NewSvgsFilter");

export default NewSvgsFilter;
