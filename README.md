# Auto Cursor Hider for Video & Streaming (TypeScript + Jest)

A lightweight Manifest V3 Chrome Extension written in **TypeScript** that automatically hides the mouse cursor when fullscreen video playback is active on **Disney+** and other popular streaming services after a customizable idle delay.

---

## ✨ Features

- 🎬 **Disney+ Default Support**: Pre-configured with Disney+ (`disneyplus.com`) enabled out of the box.
- 📺 **Major Streaming Presets**: Built-in toggle support for Disney+, Netflix, YouTube, Amazon Prime Video, Max (HBO), Hulu, Apple TV+, Twitch, Paramount+, and Peacock.
- 🌐 **Custom Domain Manager**: Add any custom website, anime platform, or local media server (e.g. `crunchyroll.com`, `plex.tv`, `localhost:8080`).
- ⏱️ **Configurable Idle Delay**: Adjust the idle timer before the cursor disappears (from 0.5 seconds to 10 seconds).
- 🖥️ **Fullscreen Mode & Flexible Toggles**: Choose between hiding the cursor only when the player is in fullscreen mode or whenever idle on configured sites.
- ⚡ **Instant Real-time Sync**: Change settings in the Popup or Options page and see immediate updates in open tabs without reloading.
- 🧪 **TypeScript & Jest Tested**: Written with strict TypeScript types and unit tested using Jest (`ts-jest`, `@types/chrome`, `jest-environment-jsdom`).

---

## 🛠️ Scripts & Build Commands

- `yarn build`: Bundles TypeScript source files in `src/` to `dist/` using `esbuild`.
- `yarn test` / `./node_modules/.bin/jest`: Runs the Jest unit test suite across all modules.
- `yarn typecheck` / `./node_modules/.bin/tsc --noEmit`: Performs strict TypeScript type checking.

---

## 🚀 How to Install in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Turn on **Developer mode** using the toggle switch in the top right corner.
3. Click **Load unpacked**.
4. Select the directory: `/Users/mateustav/hide-cursor-on-playback`
5. The extension **Auto Cursor Hider for Video & Streaming** is now installed and active!

---

## 📂 Project Architecture

```
hide-cursor-on-playback/
├── manifest.json              # Manifest V3 extension configuration
├── package.json               # Node dependencies, build & test scripts
├── tsconfig.json              # TypeScript compiler settings
├── jest.config.js             # Jest test configuration
├── src/
│   ├── types.ts               # Interface definitions (Settings, PresetSite, StatusResponse)
│   ├── domainMatcher.ts       # Domain matching & normalization logic
│   ├── idleController.ts      # Idle timer, fullscreen check, and cursor style injection
│   ├── background.ts          # Background service worker (initial settings & migrations)
│   ├── content.ts             # Content script entry point
│   ├── popup/
│   │   └── popup.ts           # Popup script
│   └── options/
│       └── options.ts         # Options dashboard script
├── tests/
│   ├── domainMatcher.test.ts  # Jest unit tests for domain matching
│   ├── idleController.test.ts # Jest unit tests for cursor hiding & timer control
│   └── background.test.ts     # Jest unit tests for service worker storage setup
├── popup/                     # Popup HTML & CSS
├── options/                   # Options HTML & CSS
└── dist/                      # Compiled JavaScript bundles loaded by manifest.json
```
