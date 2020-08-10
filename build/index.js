const fs = require('fs');
const path = require('path');
const process = require('process');
const { rmDirSync } = require('tanxin-node-utils/package/file')

const buildPath = path.resolve(process.cwd(), './axin-blog')

const isExist = fs.existsSync(buildPath);
if (isExist) {
  rmDirSync(buildPath);
}
