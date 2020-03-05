const FILES_LIST_EXP = /\{\{\s*filesList\s*\}\}/;
const OPTIMIZED_COUNT_EXP = /\{\{\s*optimizedCount\s*\}\}/;

const format = {
  filePaths: (template: string, value: string[]): string => {
    return template.replace(FILES_LIST_EXP, "- " + value.join("\n- "));
  },
  optimizedCount: (template: string, value: number): string => {
    return template.replace(OPTIMIZED_COUNT_EXP, value.toString());
  },
};

function formatAll(template: string, data: CommitData): string {
  for (const [key, value] of Object.entries(data)) {
    template = format[key](template, value);
  }

  return template;
}


export type CommitData = {
  filePaths: (string | undefined)[];
  optimizedCount: number;
}


export function formatTemplate(
  titleTemplate: string,
  messageTemplate: string,
  data: CommitData,
): string {
  const title: string = formatAll(titleTemplate, data);
  const message: string = formatAll(messageTemplate, data);
  return `${title}\n\n${message}`;
}
