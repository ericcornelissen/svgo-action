import { format as strFormat } from "util";

import { BASE64, UTF8 } from "./constants";


const UNKNOWN_ENCODING_MSG = "Unknown file encoding '%s'";


function decodeBase64(data: string): string {
  const dataBuffer = Buffer.from(data, BASE64);
  return dataBuffer.toString(UTF8);
}

function encodeBase64(data: string): string {
  const dataBuffer = Buffer.from(data, UTF8);
  return dataBuffer.toString(BASE64);
}


export function decode(data: string, encoding: string): string {
  if (encoding === BASE64) {
    return decodeBase64(data);
  } else {
    const errorMessage: string = strFormat(UNKNOWN_ENCODING_MSG, encoding);
    throw Error(errorMessage);
  }
}

export function encode(data: string, encoding: string): string {
  if (encoding === BASE64) {
    return encodeBase64(data);
  } else {
    const errorMessage: string = strFormat(UNKNOWN_ENCODING_MSG, encoding);
    throw Error(errorMessage);
  }
}
