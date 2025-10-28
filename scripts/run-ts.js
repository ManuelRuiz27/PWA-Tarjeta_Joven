const fs = require('fs');
const path = require('path');

const [, , tsEntry] = process.argv;

if (!tsEntry) {
  console.error('Usage: node scripts/run-ts.js <path-to-typescript-file>');
  process.exit(1);
}

const projectRoot = path.join(__dirname, '..');
const tsAbsolute = path.resolve(projectRoot, tsEntry);

if (!fs.existsSync(tsAbsolute)) {
  console.error(`File not found: ${tsAbsolute}`);
  process.exit(1);
}

const distRelative = path
  .relative(projectRoot, tsAbsolute)
  .replace(/\\/g, '/')
  .replace(/\.ts$/, '.js');
const distPath = path.join(projectRoot, 'dist', distRelative);

if (fs.existsSync(distPath)) {
  require(distPath);
} else {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  require('ts-node/register');
  require(tsAbsolute);
}
