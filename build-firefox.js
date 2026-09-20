const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const outDir = path.join(rootDir, 'dist-firefox');

// Clean previous build
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Copy dist files
const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  fs.cpSync(distDir, path.join(outDir, 'dist'), { recursive: true });
}

// Copy popup, options, icons (only html/css/images, not legacy root js)
['popup', 'options', 'icons'].forEach(folder => {
  const src = path.join(rootDir, folder);
  if (fs.existsSync(src)) {
    fs.cpSync(src, path.join(outDir, folder), {
      recursive: true,
      filter: (srcPath) => !srcPath.endsWith('.js')
    });
  }
});

// Read manifest.json template and adapt for Firefox MV3
const manifestPath = path.join(rootDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Firefox MV3 background scripts specification
manifest.background = {
  scripts: ['dist/background.js']
};

// Firefox AMO required data collection disclosures and Gecko extension ID
manifest.browser_specific_settings = {
  gecko: {
    id: "vanish-extension@mattavares.com",
    strict_min_version: "142.0",
    data_collection_permissions: {
      required: ["none"]
    }
  }
};

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('✅ Firefox build created successfully in dist-firefox/!');
