import type { OptimizedProjectStats } from "./types";

import { OutputName } from "./names";

type DataToOutput = (data: OptimizedProjectStats) => string;

const outputsMap: Map<OutputName, DataToOutput> = new Map([
  [
    OutputName.DID_OPTIMIZE,
    (data) => `${data.optimizedCount > 0}`,
  ],
  [
    OutputName.OPTIMIZED_COUNT,
    (data) => `${data.optimizedCount}`,
  ],
  [
    OutputName.SVG_COUNT,
    (data) => `${data.svgCount}`,
  ],
]);

function getValuesForOutputs(
  names: Iterable<OutputName>,
  data: OptimizedProjectStats,
): Map<OutputName, string> {
  const result = new Map();
  for (const name of names) {
    const getValueForOutputKey = outputsMap.get(name) as DataToOutput;
    const value = getValueForOutputKey(data);
    result.set(name, value);
  }

  return result;
}

export {
  getValuesForOutputs,
};
