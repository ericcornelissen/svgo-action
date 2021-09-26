import type { Core } from "../types";
import type { ActionManager } from "./types";

import StandardActionManager from "./action-manager";

interface Config {
  readonly isStrictMode: {
    readonly value: boolean;
  };
}

interface Params {
  readonly core: Core;
  readonly config: Config;
}

function New({ core, config }: Params): ActionManager {
  const strict = config.isStrictMode.value;
  return new StandardActionManager(core, strict);
}

export default {
  New,
};

export type {
  ActionManager,
};
