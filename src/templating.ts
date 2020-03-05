import { format as strFormat } from "util";


export type CommitData = {
  filePaths: string[];
  optimizedCount: number;
}


export function formatTemplate(
  titleTemplate: string,
  messageTemplate: string,
  data: CommitData,
): string {
  const { filePaths, optimizedCount } = data;

  const title = strFormat(titleTemplate, optimizedCount);
  const message = strFormat(messageTemplate, "- " + filePaths.join("\n- "));

  return `${title}\n\n${message}`;
}
