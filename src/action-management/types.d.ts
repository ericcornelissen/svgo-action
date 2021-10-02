import type { error } from "../types";

interface ActionManager {
  failIf(condition: Condition, msg: string): void;
  strictFailIf(condition: Condition, msg: string): void;
}

type Condition = boolean | error;

export {
  ActionManager,
  Condition,
};
