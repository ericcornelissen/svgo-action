// SPDX-License-Identifier: MIT

import type { ActionManager, Condition, Core } from "./types";

import { runIf } from "./helpers";

class StandardActionManager implements ActionManager {
  private fail: (msg: string) => void;
  private strictFail: (msg: string) => void;

  constructor(core: Core, strict: boolean) {
    this.fail = core.setFailed;
    this.strictFail = strict ? core.setFailed : core.warning;
  }

  public failIf(condition: Condition, msg: string): void {
    runIf(condition, () => this.fail(msg));
  }

  public strictFailIf(condition: Condition, msg: string): void {
    runIf(condition, () => this.strictFail(msg));
  }
}

export default StandardActionManager;
