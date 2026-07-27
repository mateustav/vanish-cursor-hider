const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const outDir = path.join(rootDir, 'dist-firefox');

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Copy dist files
const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  fs.cpSync(distDir, path.join(outDir, 'dist'), { recursive: true });
}

// Copy popup, options, icons
['popup', 'options', 'icons'].forEach(folder => {
  const src = path.join(rootDir, folder);
  if (fs.existsSync(src)) {
    fs.cpSync(src, path.join(outDir, folder), { recursive: true });
  }
});

// Read manifest.json template and adapt for Firefox MV3
const manifestPath = path.join(rootDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Firefox MV3 background scripts specification
manifest.background = {
  scripts: ['dist/background.js']
};

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('✅ Firefox build created successfully in dist-firefox/!');
