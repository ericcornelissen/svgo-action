import type { error } from "./types";

function isNotNullError(err: error): boolean {
  return err !== null;
}

function Combine(...msg: error[]): error {
  const errs = msg.filter(isNotNullError);
  const err = errs.join(",");
  return err || null;
}

function New(msg: string | null): error {
  return msg;
}

export default {
  Combine,
  New,
};
