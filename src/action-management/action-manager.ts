import type { Core } from "../types";
import type { ActionManager, Condition } from "./types";

import { runIf } from "./helpers";

class StandardActionManager implements ActionManager {
  private core: Core;
  private strict: boolean;

  constructor(core: Core, strict: boolean) {
    this.core = core;
    this.strict = strict;
  }

  public failIf(condition: Condition, msg: string): void {
    runIf(condition, () => this.core.setFailed(msg));
  }

  public strictFailIf(condition: Condition, msg: string): void {
    runIf(
      condition,
      () => this.strict ? this.core.setFailed(msg) : this.core.warning(msg),
    );
  }
}

export {
  StandardActionManager,
};
