// SPDX-License-Identifier: MIT

import type { error } from "../errors";

interface ActionManager {
  failIf(condition: Condition, msg: string): void;
  strictFailIf(condition: Condition, msg: string): void;
}

type Condition = boolean | error;

interface Core {
  setFailed(msg: string): void;
  warning(msg: string): void;
}

export type {
  ActionManager,
  Condition,
  Core,
};
