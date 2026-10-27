// Writes every icon from public/icons.js to icons/<name>.svg (24px default size).
// Usage: node tools/export-icons.js
const fs = require('fs');
const path = require('path');
const { ICON_NAMES, iconSVG } = require('../public/icons.js');

const out = path.join(__dirname, '..', 'icons');
fs.mkdirSync(out, { recursive: true });
for (const name of ICON_NAMES) fs.writeFileSync(path.join(out, `${name}.svg`), iconSVG(name, 24) + '\n');
console.log(`Wrote ${ICON_NAMES.length} icons to ${out}`);
