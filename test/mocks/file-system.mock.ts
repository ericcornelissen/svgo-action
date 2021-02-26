export const extName = jest.fn()
  .mockReturnValue("svg")
  .mockName("fs.extName");

export const listFiles = jest.fn()
  .mockReturnValue([])
  .mockName("fs.listFile");

export const readFile = jest.fn()
  .mockResolvedValue("")
  .mockName("fs.readFile");

export const writeFile = jest.fn()
  .mockResolvedValue(undefined)
  .mockName("fs.writeFile");

