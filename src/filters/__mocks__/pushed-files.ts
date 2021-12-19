import { filter } from "./__common__";

const NewPushedFilesFilter = jest.fn()
  .mockReturnValue([filter, null])
  .mockName("filters.NewPushedFilesFilter");

export default NewPushedFilesFilter;
