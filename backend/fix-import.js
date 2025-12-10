import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remplacer les imports relatifs sans .js
  // Pattern: from './xxx' ou from '../xxx' qui ne se termine pas déjà par .js
  const newContent = content.replace(
    /(from ['"])(\.\.?\/[^'"]+?)(['"](;|\n|\r))/g,
    (match, prefix, importPath, suffix) => {
      if (importPath.endsWith('.js')) {
        return match; // Déjà corrigé
      }
      modified = true;
      return `${prefix}${importPath}.js${suffix}`;
    }
  );

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed: ${path.relative(srcDir, filePath)}`);
  } else {
    console.log(`⏭️  Skipped: ${path.relative(srcDir, filePath)} (already OK)`);
  }
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      fixImportsInFile(fullPath);
    }
  }
}

console.log('🔧 Fixing ESM imports...\n');
processDirectory(srcDir);
console.log('\n✨ Done!');
