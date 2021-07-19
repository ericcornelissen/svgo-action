import type { AllowedSvgoVersions } from "../svgo";

interface Config {
  readonly ignoreGlob: string;
  readonly isDryRun: boolean;
  readonly svgoOptionsPath: string;
  readonly svgoVersion: AllowedSvgoVersions;
}

export type {
  Config,
};
