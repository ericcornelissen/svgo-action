import * as util from "util";


const UNKNOWN_ENCODING_MSG = "Unknown file encoding '%s'";

const BASE64 = "base64";
const UTF8 = "utf-8";

function decodeBase64(data: string): string {
  const dataBuffer = Buffer.from(data, BASE64);
  return dataBuffer.toString(UTF8);
}

function encodeBase64(data: string): string {
  const dataBuffer = Buffer.from(data, UTF8);
  return dataBuffer.toString(BASE64);
}


export function decode(data: string, fileEncoding: string): string {
  if (fileEncoding === BASE64) {
    return decodeBase64(data);
  } else {
    const errorMessage = util.format(UNKNOWN_ENCODING_MSG, fileEncoding);
    throw Error(errorMessage);
  }
}

export function encode(data: string, fileEncoding: string): string {
  if (fileEncoding === BASE64) {
    return encodeBase64(data);
  } else {
    const errorMessage = util.format(UNKNOWN_ENCODING_MSG, fileEncoding);
    throw Error(errorMessage);
  }
}
