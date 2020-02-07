const BASE64 = "base64";
const UTF8 = "utf-8";


function decodeBase64(data: string): string {
  const dataBuffer = Buffer.from(data, BASE64);
  return dataBuffer.toString(UTF8);
}


export function decode(data: string, fileEncoding: string): string {
  if (fileEncoding === BASE64) {
    return decodeBase64(data);
  } else {
    throw Error("Unknown file encoding");
  }
}
