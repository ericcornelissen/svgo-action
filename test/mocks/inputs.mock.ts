import { actionManifest } from "./helpers/read-manifest";

import { DEFAULT_COMMENT } from "../../src/constants";

const NAME_MAP = {
  "repo-token": "",
  "comment": "enableComments",
  "configuration-path": "",
  "dry-run": "isDryRun",
  "ignore": "ignoreGlob",
  "svgo-options": "svgoOptionsPath",
  "svgo-version": "svgoVersion",
};

export const ActionConfig = jest.fn()
  .mockImplementation(() => {
    return Object.entries(actionManifest.inputs).reduce((acc, [name, obj]) => {
      const configInstanceName = NAME_MAP[name];
      acc[configInstanceName] = obj.default;
      return acc;
    }, { comment: DEFAULT_COMMENT });
  })
  .mockName("inputs.ActionConfig");
