export const formatComment = jest.fn()
  .mockReturnValue("This is the comment")
  .mockName("templating.formatComment");

export const formatTemplate = jest.fn()
  .mockReturnValue("This is the commit message")
  .mockName("templating.formatTemplate");
