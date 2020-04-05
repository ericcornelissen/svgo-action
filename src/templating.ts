import { FullFileData } from "./main";


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

const format = {
  fileCount: (template: string, value: number): string => {
    return template.replace(FILE_COUNT_EXP, value.toString());
  },
  filePaths: (template: string, value: string[]): string => {
    return template.replace(FILES_LIST_EXP, "- " + value.join("\n- "));
  },
  fileTable: (template: string, value: FullFileData[]): string => {
    let table = "| Filename | Before | After | Improvement |\n| --- | --- | --- | --- |\n";
    for (const svg of value) {
      const originalFileSize: number = getFileSizeInKB(svg.original);
      const optimizedFileSize: number = getFileSizeInKB(svg.optimized);
      const improvement: number = toPercentage((originalFileSize - optimizedFileSize) / originalFileSize);
      table += `| ${svg.path} | ${originalFileSize} KB | ${optimizedFileSize} KB | ${improvement}% |\n`;
    }

    return template.replace(FILES_TABLE_EXP, table);
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
  readonly fileCount: number;
  readonly filePaths: string[];
  readonly optimizedCount: number;
  readonly skippedCount: number;
  readonly svgCount: number;
  readonly fileTable: FullFileData[];
}


export function formatComment(data: CommitData): string {
  const template = "SVG(s) automatically optimized using [SVGO](https://github.com/svg/svgo) :sparkles:\n\n{{filesTable}}";
  return formatAll(template, data);
}

export function formatTemplate(
  titleTemplate: string,
  messageTemplate: string,
  data: CommitData,
): string {
  const title: string = formatAll(titleTemplate, data, ["filePaths", "fileTable"]);
  const message: string = formatAll(messageTemplate, data);
  return `${title}\n\n${message}`.trimRight();
}
