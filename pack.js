const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const chromeZip = path.join(rootDir, 'vanish-chrome.zip');
const firefoxZip = path.join(rootDir, 'vanish-firefox.zip');
const sourceZip = path.join(rootDir, 'vanish-source-code.zip');

const target = process.argv[2] || 'chrome';

if (target === 'chrome' || target === 'all') {
  if (fs.existsSync(chromeZip)) fs.unlinkSync(chromeZip);
  execSync('zip -r vanish-chrome.zip manifest.json dist/ popup/ options/ icons/ -x "*mock*"', { cwd: rootDir, stdio: 'inherit' });
  console.log('📦 Chrome extension bundle created: vanish-chrome.zip');
}

if (target === 'firefox' || target === 'all') {
  if (fs.existsSync(firefoxZip)) fs.unlinkSync(firefoxZip);
  const distFirefoxDir = path.join(rootDir, 'dist-firefox');
  if (!fs.existsSync(distFirefoxDir)) {
    execSync('yarn build:firefox', { cwd: rootDir, stdio: 'inherit' });
  }
  execSync('zip -r ../vanish-firefox.zip manifest.json dist/ popup/ options/ icons/ -x "*mock*"', { cwd: distFirefoxDir, stdio: 'inherit' });
  console.log('📦 Firefox add-on bundle created: vanish-firefox.zip');
}

if (target === 'source' || target === 'all') {
  if (fs.existsSync(sourceZip)) fs.unlinkSync(sourceZip);
  execSync('zip -r vanish-source-code.zip LICENSE src/ options/ popup/ icons/ manifest.json package.json tsconfig.json build-firefox.js pack.js yarn.lock README.md REVIEWER.md -x "*mock*"', { cwd: rootDir, stdio: 'inherit' });
  console.log('📦 Source code zip created for Firefox reviewer: vanish-source-code.zip');
}
