const fs = require("fs");
const path = require("path");


const culpritRegexp = /if\s*\(.\s*===\s*"([^"]*).js"\)\s*return ./g;
function removeJsExtensionFromFileName(matchedString, filename) {
  return matchedString.replace(`${filename}.js`, filename);
}

const indexPath = path.resolve(__dirname, "../lib/index.js");
const fileBuffer = fs.readFileSync(indexPath);
const fileRaw = fileBuffer.toString();
const fileUpdated = fileRaw.replace(
  culpritRegexp,
  removeJsExtensionFromFileName,
);

fs.writeFileSync(indexPath, fileUpdated);
