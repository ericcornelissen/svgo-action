const failIf = jest.fn()
  .mockName("action-management.StandardActionManager.failIf");

const strictFailIf = jest.fn()
  .mockName("action-management.StandardActionManager.strictFailIf");

const StandardActionManager = jest.fn()
  .mockReturnValue({
    failIf,
    strictFailIf,
  })
  .mockName("action-management.StandardActionManager.[constructor]");

export default StandardActionManager;
