import type { error } from "../types";

type Condition = boolean | error;

interface ActionManager {
  failIf(condition: Condition, msg: string): void;
  strictFailIf(condition: Condition, msg: string): void;
}

export {
  ActionManager,
  Condition,
};
