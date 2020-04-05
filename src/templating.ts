const FILE_COUNT_EXP = /\{\{\s*fileCount\s*\}\}/;
const FILES_LIST_EXP = /\{\{\s*filesList\s*\}\}/;
const OPTIMIZED_COUNT_EXP = /\{\{\s*optimizedCount\s*\}\}/;
const SKIPPED_COUNT_EXP = /\{\{\s*skippedCount\s*\}\}/;
const SVG_COUNT_EXP = /\{\{\s*svgCount\s*\}\}/;

const formatters = [
  {
    key: "fileCount",
    fn: (template: string, value: number): string => {
      return template.replace(FILE_COUNT_EXP, value.toString());
    },
  },
  {
    key: "filePaths",
    fn: (template: string, value: string[]): string => {
      return template.replace(FILES_LIST_EXP, "- " + value.join("\n- "));
    },
  },
  {
    key: "optimizedCount",
    fn: (template: string, value: number): string => {
      return template.replace(OPTIMIZED_COUNT_EXP, value.toString());
    },
  },
  {
    key: "skippedCount",
    fn: (template: string, value: number): string => {
      return template.replace(SKIPPED_COUNT_EXP, value.toString());
    },
  },
  {
    key: "svgCount",
    fn: (template: string, value: number): string => {
      return template.replace(SVG_COUNT_EXP, value.toString());
    },
  },
];

function formatAll(
  template: string,
  data: CommitData,
  exclude: string[] = [],
): string {
  for (const { key, fn } of formatters) {
    if (!exclude.includes(key)) {
      template = fn(template, data[key]);
    }
  }

  return template;
}


export type CommitData = {
  readonly fileCount: number;
  readonly filePaths: string[];
  readonly optimizedCount: number;
  readonly skippedCount: number;
  readonly svgCount: number;
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
