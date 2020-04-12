import { CommitData, FileData } from "./main";

import { getFileSizeInKB } from "./utils/file-size";
import { toPercentage } from "./utils/percentages";


const FILE_COUNT_EXP = /\{\{\s*fileCount\s*\}\}/;
const FILES_LIST_EXP = /\{\{\s*filesList\s*\}\}/;
const FILES_TABLE_EXP = /\{\{\s*filesTable\s*\}\}/;
const IGNORED_COUNT_EXP = /\{\{\s*ignoredCount\s*\}\}/;
const OPTIMIZED_COUNT_EXP = /\{\{\s*optimizedCount\s*\}\}/;
const SKIPPED_COUNT_EXP = /\{\{\s*skippedCount\s*\}\}/;
const SVG_COUNT_EXP = /\{\{\s*svgCount\s*\}\}/;

const FILES_TABLE_HEADER = "| Filename | Before | After | Improvement |\n| --- | --- | --- | --- |\n";

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
      const findOriginalSvg = (path: string): FileData => {
        const i: number = value.original.findIndex((fileData) => {
          return fileData.path === path;
        });

        return value.original[i];
      };

      let table = FILES_TABLE_HEADER;
      for (const optimizedSvg of value.optimized) {
        const path: string = optimizedSvg.path;
        const originalSvg: FileData = findOriginalSvg(path);

        const originalSize: number = getFileSizeInKB(originalSvg.content);
        const optimizedFSize: number = getFileSizeInKB(optimizedSvg.content);

        const reduction: number = (originalSize - optimizedFSize) / originalSize;
        const reductionPercentage: number = -1 * toPercentage(reduction);

        table += `| ${path} | ${originalSize} KB | ${optimizedFSize} KB | ${reductionPercentage}% |\n`;
      }

      return template.replace(FILES_TABLE_EXP, table);
    },
  },
  {
    key: "ignoredCount",
    fn: (template: string, value: number): string => {
      return template.replace(IGNORED_COUNT_EXP, value.toString());
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
