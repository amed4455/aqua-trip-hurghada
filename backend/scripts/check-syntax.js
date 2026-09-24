const { execFileSync } = require('child_process');
const { readdirSync, statSync } = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const skipDirs = new Set(['node_modules', '.git', '.vercel', '.wwebjs_auth']);

function collectJsFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (skipDirs.has(entry)) continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectJsFiles(full));
    } else if (entry.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

const files = collectJsFiles(root);
let hasError = false;

for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  } catch (err) {
    hasError = true;
  }
}

if (hasError) {
  console.error('Syntax check failed.');
  process.exit(1);
}

console.log(`Syntax OK for ${files.length} file(s).`);
