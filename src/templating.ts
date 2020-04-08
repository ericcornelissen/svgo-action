import { CommitData } from "./main";


const UTF8 = "utf-8";

const FILE_COUNT_EXP = /\{\{\s*fileCount\s*\}\}/;
const FILES_LIST_EXP = /\{\{\s*filesList\s*\}\}/;
const FILES_TABLE_EXP = /\{\{\s*filesTable\s*\}\}/;
const OPTIMIZED_COUNT_EXP = /\{\{\s*optimizedCount\s*\}\}/;
const SKIPPED_COUNT_EXP = /\{\{\s*skippedCount\s*\}\}/;
const SVG_COUNT_EXP = /\{\{\s*svgCount\s*\}\}/;


function getFileSizeInKB(content: string): number {
  return Buffer.byteLength(content, UTF8) / 1000;
}

function toPercentage(decimal: number): number {
  return -1 * Math.round(decimal * 10000) / 100;
}

const formatters = [
  {
    key: "fileCount",
    fn: (template: string, value: number): string => {
      return template.replace(FILE_COUNT_EXP, value.toString());
    },
  },
  {
    key: "fileData",
    fn: (template: string, value: CommitData["fileData"]): string => {
      const paths: string[] = value.optimized.map((fileData) => fileData.path);
      return template.replace(FILES_LIST_EXP, "- " + paths.join("\n- "));
    },
  },
  {
    key: "fileData",
    fn: (template: string, value: CommitData["fileData"]): string => {
      let table = "| Filename | Before | After | Improvement |\n| --- | --- | --- | --- |\n";
      for (let i = 0; i < value.optimized.length; i++) {
        const path: string = value.original[i].path;
        const originalFileSize: number = getFileSizeInKB(value.original[i].content);
        const optimizedFileSize: number = getFileSizeInKB(value.optimized[i].content);
        const improvement: number = toPercentage((originalFileSize - optimizedFileSize) / originalFileSize);
        table += `| ${path} | ${originalFileSize} KB | ${optimizedFileSize} KB | ${improvement}% |\n`;
      }

      return template.replace(FILES_TABLE_EXP, table);
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




export function formatComment(
  commentTemplate: string,
  data: CommitData,
): string {
  return formatAll(commentTemplate, data);
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
