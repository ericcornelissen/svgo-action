import type { SupportedSvgoVersions } from "../svgo";

interface Config {
  readonly ignoreGlob: string;
  readonly isDryRun: boolean;
  readonly svgoConfigPath: string;
  readonly svgoVersion: SupportedSvgoVersions;
}

export type {
  Config,
};
