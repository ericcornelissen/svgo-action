import type { OptimizeFileData, OptimizeProjectData } from "./types";

import { format as printf } from "util";

import {
  getChangedPercentage,
  getFileSizeInKB,
  roundToPrecision,
} from "./utils";

const FILES_LIST_EXP = /\{\{\s*filesList\s*\}\}/;
const FILES_TABLE_EXP = /\{\{\s*filesTable\s*\}\}/;
const OPTIMIZED_COUNT_EXP = /\{\{\s*optimizedCount\s*\}\}/;
const SKIPPED_COUNT_EXP = /\{\{\s*skippedCount\s*\}\}/;
const SVG_COUNT_EXP = /\{\{\s*svgCount\s*\}\}/;
const WARNINGS_EXP = /\{\{\s*warnings\s*\}\}/;

const FILE_DATA_KEY = "files";
const OPTIMIZED_COUNT_KEY = "optimizedCount";
const SKIPPED_COUNT_KEY = "skippedCount";
const SVG_COUNT_KEY = "svgCount";

const FILES_TABLE_HEADER =
  "| Filename | Before | After | Improvement |\n" +
  "| --- | --- | --- | --- |\n";
const FILES_TABLE_ROW = "| %s | %s KB | %s KB | %s%% |\n";

const formatters = [
  {
    key: FILE_DATA_KEY,
    fn: (template: string, values: OptimizeFileData[]): string => {
      const paths: string[] = values.map((fileData) => fileData.path);
      return template.replace(FILES_LIST_EXP, "- " + paths.join("\n- "));
    },
  },
  {
    key: FILE_DATA_KEY,
    fn: (template: string, values: OptimizeFileData[]): string => {
      let table = FILES_TABLE_HEADER;
      for (const value of values) {
        const originalSize: number = getFileSizeInKB(value.contentBefore);
        const optimizedSize: number = getFileSizeInKB(value.contentAfter);

        const reducedPercentage = getChangedPercentage(
          originalSize,
          optimizedSize,
        );

        table += printf(
          FILES_TABLE_ROW,
          value.path,
          originalSize,
          optimizedSize,
          roundToPrecision(reducedPercentage, 2),
        );
      }

      return template.replace(FILES_TABLE_EXP, table);
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
];

function injectWarnings(template: string, values: string[]): string {
  let warnings = "";
  if (values.length > 0) {
    warnings = values.reduce((acc, cur) => `${acc}\n- ${cur}`, "WARNINGS:");
  }

  return template.replace(WARNINGS_EXP, warnings);
}

export function formatComment(
  template: string,
  data: OptimizeProjectData,
  warnings: string[],
): string {
  for (const { key, fn } of formatters) {
    // eslint-disable-next-line security/detect-object-injection
    template = fn(template, data[key]);
  }

  return injectWarnings(template, warnings);
}
