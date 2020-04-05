import { FullFileData } from "./main";


const UTF8 = "utf-8";

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

function getFileSizeInKB(content: string): number {
  return Buffer.byteLength(content, UTF8) / 1000;
}

function toPercentage(decimal: number): number {
  return -1 * Math.round(decimal * 10000) / 100;
}


export type CommitData = {
  readonly fileCount: number;
  readonly filePaths: string[];
  readonly optimizedCount: number;
  readonly skippedCount: number;
  readonly svgCount: number;
}


export function formatComment(
  svgs: FullFileData[],
): string {
  let comment = "SVG(s) automatically optimized using [SVGO](https://github.com/svg/svgo) :sparkles: \n\n";
  comment += "| Filename | Before | After | Improvement |\n";
  comment += "| --- | --- | --- | --- |\n";

  for (const svg of svgs) {
    const originalFileSize: number = getFileSizeInKB(svg.original);
    const optimizedFileSize: number = getFileSizeInKB(svg.optimized);
    const improvement: number = toPercentage((originalFileSize - optimizedFileSize) / originalFileSize);
    comment += `| ${svg.path} | ${originalFileSize} KB | ${optimizedFileSize} KB | ${improvement}% |`;
  }

  return comment;
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
