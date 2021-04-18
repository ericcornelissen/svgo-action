import * as github from "./@actions/github.mock";

export const createComment = jest.fn()
  .mockName("github-api.createComment");

export const getCommitMessage = jest.fn()
  .mockResolvedValue("This is a commit message")
  .mockName("github-api.getCommitMessage");

export const getPrComments = jest.fn()
  .mockResolvedValue([])
  .mockName("github-api.getPrComment");

export const getPrNumber = jest.fn()
  .mockReturnValue(github.PR_NUMBER.NO_COMMENTS)
  .mockName("github-api.getPrNumber");
