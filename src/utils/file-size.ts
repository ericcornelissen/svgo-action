const UTF8 = "utf-8";


export function getFileSizeInKB(content: string): number {
  return Buffer.byteLength(content, UTF8) / 1000;
}
