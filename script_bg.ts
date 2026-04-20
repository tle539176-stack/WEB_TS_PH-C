import fs from 'fs';
import path from 'path';

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace specific background colors with bg-white
  let newContent = content
    .replace(/bg-\[\#FDFCFB\]/g, 'bg-white')
    .replace(/bg-\[\#F8FAFC\]/g, 'bg-white')
    .replace(/bg-\[\#F5F2ED\]/g, 'bg-white')
    .replace(/bg-\[\#F0F4F8\]/g, 'bg-white');
    
  // Replace bg-neutral-50 but keep hover:bg-neutral-50
  newContent = newContent.replace(/(?<!hover:)bg-neutral-50/g, 'bg-white');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Updated ' + file);
  }
});
