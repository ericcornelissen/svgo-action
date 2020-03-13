const FILE_COUNT_EXP = /\{\{\s*fileCount\s*\}\}/;
const FILES_LIST_EXP = /\{\{\s*filesList\s*\}\}/;
const OPTIMIZED_COUNT_EXP = /\{\{\s*optimizedCount\s*\}\}/;
const SKIPPED_COUNT_EXP = /\{\{\s*skippedCount\s*\}\}/;
const SVG_COUNT_EXP = /\{\{\s*svgCount\s*\}\}/;

const format = {
  fileCount: (template: string, value: number): string => {
    return template.replace(FILE_COUNT_EXP, value.toString());
  },
  filePaths: (template: string, value: string[]): string => {
    return template.replace(FILES_LIST_EXP, "- " + value.join("\n- "));
  },
  optimizedCount: (template: string, value: number): string => {
    return template.replace(OPTIMIZED_COUNT_EXP, value.toString());
  },
  skippedCount: (template: string, value: number): string => {
    return template.replace(SKIPPED_COUNT_EXP, value.toString());
  },
  svgCount: (template: string, value: number): string => {
    return template.replace(SVG_COUNT_EXP, value.toString());
  },
};

function formatAll(
  template: string,
  data: CommitData,
  exclude: string[] = [],
): string {
  for (const [key, value] of Object.entries(data)) {
    if (!exclude.includes(key)) {
      template = format[key](template, value);
    }
  }

  return template;
}


export type CommitData = {
  fileCount: number;
  filePaths: string[];
  optimizedCount: number;
  skippedCount: number;
  svgCount: number;
}


export function formatTemplate(
  titleTemplate: string,
  messageTemplate: string,
  data: CommitData,
): string {
  const title: string = formatAll(titleTemplate, data, ["filePaths"]);
  const message: string = formatAll(messageTemplate, data);
  return `${title}\n\n${message}`.trimRight();
}
