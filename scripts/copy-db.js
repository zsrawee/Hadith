/**
 * Copy hadith database from node_modules to public/data/
 * This makes the DB available for Vercel serverless functions
 * without bundling node_modules/hadith/data/ (saves 133MB duplication)
 */
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', 'hadith', 'data', 'hadith.db');
const destDir = path.join(__dirname, '..', 'public', 'data');
const dest = path.join(destDir, 'hadith.db');

if (!fs.existsSync(src)) {
  console.error('❌ Source hadith DB not found at:', src);
  process.exit(0); // Non-fatal - build can continue with fallback
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);

const mb = (fs.statSync(dest).size / 1024 / 1024).toFixed(1);
console.log(`✅ Hadith DB copied: ${mb}MB → public/data/hadith.db`);
