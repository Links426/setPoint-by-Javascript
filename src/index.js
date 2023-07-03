const { transformFileSync } = require("@babel/core");
const path = require("path");

const tracker = require("./babel-plugin-tracker");
const pathFile = path.resolve(__dirname, "./sourceCode.js");
const { code } = transformFileSync(pathFile, {
  plugins: [[tracker, { trackerPath: "tracker" }]], //update
});
console.log(code);
