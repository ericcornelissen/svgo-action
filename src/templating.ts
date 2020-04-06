import { CommitData, FileData } from "./main";


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
    key: "fileData",
    fn: (template: string, value: FileData[]): string => {
      const paths: string[] = value.map((fileData) => fileData.path);
      return template.replace(FILES_LIST_EXP, "- " + paths.join("\n- "));
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




export function formatCommitMessage(
  titleTemplate: string,
  messageTemplate: string,
  data: CommitData,
): string {
  const title: string = formatAll(titleTemplate, data, ["fileData"]);
  const message: string = formatAll(messageTemplate, data);
  return `${title}\n\n${message}`.trimRight();
}
