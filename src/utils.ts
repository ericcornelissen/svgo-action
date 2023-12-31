// SPDX-License-Identifier: MIT

function len<T>(collection: Iterable<T>): number {
  return Array.from(collection).length;
}

export {
  len,
};
