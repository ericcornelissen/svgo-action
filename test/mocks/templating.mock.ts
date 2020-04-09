export const formatComment = jest.fn()
  .mockReturnValue("This is the comment")
  .mockName("templating.formatComment");

export const formatCommitMessage = jest.fn()
  .mockReturnValue("This is the commit message")
  .mockName("templating.formatCommitMessage");
