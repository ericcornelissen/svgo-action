import ActionManager from "./action-manager";

const actionManager = new ActionManager();

const New = jest.fn()
  .mockReturnValue(actionManager)
  .mockName("action-management.New");

export default {
  New,
};
