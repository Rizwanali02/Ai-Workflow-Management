const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let count = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  try {
    // Regex to match block comments and line comments, but skip URLs (http:// or https://)
    let cleaned = content.replace(/\/\*[\s\S]*?\*\/|(?<!https?:)\/\/.*/g, '');
    
    // Clean up empty lines created by comment removal
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');
    
    if (content !== cleaned) {
      fs.writeFileSync(file, cleaned);
      count++;
    }
  } catch (e) {
    console.error(`Error stripping ${file}:`, e);
  }
});

console.log(`Successfully stripped comments from ${count} files.`);
