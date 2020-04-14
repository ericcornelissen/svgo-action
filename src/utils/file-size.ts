import { UTF8 } from "../constants";


export function getFileSizeInKB(content: string): number {
  return Buffer.byteLength(content, UTF8) / 1000;
}
