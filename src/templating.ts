import { format as strFormat } from "util";

import { CommitData } from "./types";

import { getFileSizeInKB } from "./utils/file-size";
import { toPercentage } from "./utils/percentages";


const FILES_LIST_EXP = /\{\{\s*filesList\s*\}\}/;
const FILES_TABLE_EXP = /\{\{\s*filesTable\s*\}\}/;
const IGNORED_COUNT_EXP = /\{\{\s*ignoredCount\s*\}\}/;
const OPTIMIZED_COUNT_EXP = /\{\{\s*optimizedCount\s*\}\}/;
const SKIPPED_COUNT_EXP = /\{\{\s*skippedCount\s*\}\}/;
const SVG_COUNT_EXP = /\{\{\s*svgCount\s*\}\}/;
const WARNINGS_EXP = /\{\{\s*warnings\s*\}\}/;

const FILE_DATA_KEY = "fileData";
const IGNORED_COUNT_KEY = "ignoredCount";
const OPTIMIZED_COUNT_KEY = "optimizedCount";
const SKIPPED_COUNT_KEY = "skippedCount";
const SVG_COUNT_KEY = "svgCount";
const WARNINGS_KEY = "warnings";

const TITLE_EXCLUDE_KEYS: string[] = [
  FILE_DATA_KEY,
  WARNINGS_KEY,
];

const FILES_TABLE_HEADER =
  "| Filename | Before | After | Improvement |\n" +
  "| --- | --- | --- | --- |\n";
const FILES_TABLE_ROW = "| %s | %s KB | %s KB | %s%% |\n";

const formatters = [
  {
    key: FILE_DATA_KEY,
    fn: (template: string, value: CommitData["fileData"]): string => {
      const paths: string[] = value.optimized.map((fileData) => fileData.path);
      return template.replace(FILES_LIST_EXP, "- " + paths.join("\n- "));
    },
  },
  {
    key: FILE_DATA_KEY,
    fn: (template: string, value: CommitData["fileData"]): string => {
      let table = FILES_TABLE_HEADER;
      for (const optimizedSvg of value.optimized) {
        const originalSvg = value.original.find((originalSvg) => {
          return originalSvg.path === optimizedSvg.path;
        });

        if (originalSvg === undefined) {
          throw new Error("Original version of optimized SVG missing");
        }

        const originalSize: number = getFileSizeInKB(originalSvg.content);
        const optimizedSize: number = getFileSizeInKB(optimizedSvg.content);

        const reduced: number = (originalSize - optimizedSize) / originalSize;
        const reducedPercentage: number = -1 * toPercentage(reduced);

        table += strFormat(
          FILES_TABLE_ROW,
          optimizedSvg.path,
          originalSize,
          optimizedSize,
          reducedPercentage,
        );
      }

      return template.replace(FILES_TABLE_EXP, table);
    },
  },
  {
    key: IGNORED_COUNT_KEY,
    fn: (template: string, value: number): string => {
      return template.replace(IGNORED_COUNT_EXP, value.toString());
    },
  },
  {
    key: OPTIMIZED_COUNT_KEY,
    fn: (template: string, value: number): string => {
      return template.replace(OPTIMIZED_COUNT_EXP, value.toString());
    },
  },
  {
    key: SKIPPED_COUNT_KEY,
    fn: (template: string, value: number): string => {
      return template.replace(SKIPPED_COUNT_EXP, value.toString());
    },
  },
  {
    key: SVG_COUNT_KEY,
    fn: (template: string, value: number): string => {
      return template.replace(SVG_COUNT_EXP, value.toString());
    },
  },
  {
    key: WARNINGS_KEY,
    fn: (template: string, value: string[]): string => {
      let warnings = "";
      if (value.length > 0) {
        warnings = value.reduce((acc, cur) => `${acc}\n- ${cur}`, "WARNINGS:");
      }

      return template.replace(WARNINGS_EXP, warnings);
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
      // eslint-disable-next-line security/detect-object-injection
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
  bodyTemplate: string,
  data: CommitData,
): string {
  const title: string = formatAll(titleTemplate, data, TITLE_EXCLUDE_KEYS);
  const body: string = formatAll(bodyTemplate, data);
  return `${title}\n\n${body}`.trimRight();
}
