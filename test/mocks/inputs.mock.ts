import { actionManifest } from "./helpers/read-manifest";

const NAME_MAP = {
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
    });
  })
  .mockName("inputs.ActionConfig");
