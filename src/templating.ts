import { format as strFormat } from "util";


export type CommitData = {
  filePaths: string[];
  optimizedCount: number;
}


export function formatTemplate(template: string, data: CommitData): string {
  const { filePaths, optimizedCount } = data;
  return strFormat(
    template,
    optimizedCount,
    "- " + filePaths.join("\n- "),
  );
}
