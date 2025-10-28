const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const sourceDir = path.join(distDir, 'src');

if (fs.existsSync(sourceDir)) {
  fs.cpSync(sourceDir, distDir, { recursive: true });
  fs.rmSync(sourceDir, { recursive: true, force: true });
}
