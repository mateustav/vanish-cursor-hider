const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const chromeZip = path.join(rootDir, 'vanish-chrome.zip');
const firefoxZip = path.join(rootDir, 'vanish-firefox.zip');

const target = process.argv[2] || 'chrome';

if (target === 'chrome' || target === 'all') {
  if (fs.existsSync(chromeZip)) fs.unlinkSync(chromeZip);
  execSync('zip -r vanish-chrome.zip manifest.json dist/ popup/ options/ icons/', { cwd: rootDir, stdio: 'inherit' });
  console.log('📦 Chrome extension bundle created: vanish-chrome.zip');
}

if (target === 'firefox' || target === 'all') {
  if (fs.existsSync(firefoxZip)) fs.unlinkSync(firefoxZip);
  const distFirefoxDir = path.join(rootDir, 'dist-firefox');
  if (!fs.existsSync(distFirefoxDir)) {
    execSync('yarn build:firefox', { cwd: rootDir, stdio: 'inherit' });
  }
  execSync('zip -r ../vanish-firefox.zip manifest.json dist/ popup/ options/ icons/', { cwd: distFirefoxDir, stdio: 'inherit' });
  console.log('📦 Firefox add-on bundle created: vanish-firefox.zip');
}
