import type { ActionManager, Core } from "./types";

import StandardActionManager from "./action-manager";

interface Config {
  readonly isStrictMode: {
    readonly value: boolean;
  };
}

interface Params {
  readonly config: Config;
  readonly core: Core;
}

function New({ core, config }: Params): ActionManager {
  const strict = config.isStrictMode.value;
  return new StandardActionManager(core, strict);
}

export default {
  New,
};
