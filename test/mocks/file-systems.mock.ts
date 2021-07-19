export const listFiles = jest.fn()
  .mockReturnValue([])
  .mockName("fs.listFile");

export const readFile = jest.fn()
  .mockResolvedValue("")
  .mockName("fs.readFile");

export const writeFile = jest.fn()
  .mockResolvedValue(undefined)
  .mockName("fs.writeFile");

export const newStandard = jest.fn()
  .mockReturnValue({
    listFiles,
    readFile,
    writeFile,
  })
  .mockName("fs.newStandard");

export const newPullRequest = jest.fn()
  .mockReturnValue({
    listFiles,
    readFile,
    writeFile,
  })
  .mockName("fs.newPullRequest");
