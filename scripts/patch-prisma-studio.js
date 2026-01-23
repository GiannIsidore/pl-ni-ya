#!/usr/bin/env node
/**
 * Patch script to fix Prisma Studio MariaDB "m.sort is not a function" error
 * This patch ensures that .sort() is only called on arrays
 */

const fs = require('fs');
const path = require('path');

const studioCorePath = path.join(__dirname, '../node_modules/@prisma/studio-core/dist/data/mysql-core/index.cjs');

if (!fs.existsSync(studioCorePath)) {
  console.error('Prisma Studio core file not found:', studioCorePath);
  process.exit(1);
}

let content = fs.readFileSync(studioCorePath, 'utf8');

// Pattern 1: Fix cases where m.sort() is called but m might not be an array
// Replace m.sort( with (Array.isArray(m) ? m : []).sort(
content = content.replace(/\bm\.sort\(/g, '(Array.isArray(m) ? m : []).sort(');

// Pattern 2: Fix cases where e.sort() is called but e might not be an array  
// Replace e.sort( with (Array.isArray(e) ? e : []).sort(
content = content.replace(/\be\.sort\(/g, '(Array.isArray(e) ? e : []).sort(');

// Pattern 3: Fix cases where h.sort() is called but h might not be an array
// Replace h.sort( with (Array.isArray(h) ? h : []).sort(
content = content.replace(/\bh\.sort\(/g, '(Array.isArray(h) ? h : []).sort(');

// Write the patched content back
fs.writeFileSync(studioCorePath, content, 'utf8');
console.log('✅ Prisma Studio patched successfully');
