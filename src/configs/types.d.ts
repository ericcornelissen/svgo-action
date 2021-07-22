import type { SupportedSvgoVersions } from "../svgo";

interface Config {
  readonly ignoreGlob: string;
  readonly isDryRun: boolean;
  readonly svgoOptionsPath: string;
  readonly svgoVersion: SupportedSvgoVersions;
}

export type {
  Config,
};
