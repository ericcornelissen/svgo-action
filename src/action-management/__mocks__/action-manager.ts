const StandardActionManager = jest.fn()
  .mockReturnValue({
    failIf: jest.fn().mockName("StandardActionManager.failIf"),
    strictFailIf: jest.fn().mockName("StandardActionManager.strictFailIf"),
  })
  .mockName("StandardActionManager.[constructor]");

export default StandardActionManager;
