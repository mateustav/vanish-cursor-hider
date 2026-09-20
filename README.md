# Vanish: Auto Pointer Hider for Streaming

A lightweight, modern Manifest V3 extension written in **TypeScript** that automatically vanishes the mouse pointer during video playback on **Disney+** and **YouTube** after a customizable idle delay.

---

## ✨ Features

- 🎬 **Disney+ Native Support**: Custom Web Component & Shadow DOM support for Disney+ (`disneyplus.com`).
- 📺 **Streaming Presets**: Built-in preset support for Disney+ and YouTube.
- 🌐 **Custom Domain Manager**: Add any custom website, anime platform, or local media server (e.g. `crunchyroll.com`, `plex.tv`, `localhost:8080`).
- ⏱️ **Configurable Idle Delay**: Adjust the idle timer before the pointer vanishes (from 0.5 seconds to 10 seconds).
- 🖥️ **Playback & Fullscreen Mode**: Choose between hiding the pointer on active video playback pages or strictly in fullscreen mode.
- ⚡ **Instant Real-Time Sync**: Change settings in the Popup or Options page with immediate sync across open tabs.
- 🧪 **TypeScript & Jest Tested**: Built with strict TypeScript types and comprehensive unit tests using Jest (`ts-jest`, `@types/chrome`, `jest-environment-jsdom`).

---

## 🛠️ Scripts & Build Commands

- `yarn build`: Bundles and minifies TypeScript source files for Chrome, Brave, and Edge into `dist/`.
- `yarn build:firefox`: Generates the self-contained Firefox build folder (`dist-firefox/`).
- `yarn pack`: Builds and zips the Chrome extension bundle into **`vanish-chrome.zip`** for store upload.
- `yarn pack:firefox`: Builds and zips the Firefox add-on bundle into **`vanish-firefox.zip`** for store upload.
- `yarn pack:all`: Builds and generates Chrome, Firefox, and Source Code zip bundles.
- `yarn test`: Runs the Jest unit test suite across all modules.
- `yarn typecheck`: Performs strict TypeScript type checking (`tsc --noEmit`).

---

## 🦊 Firefox AMO Reviewer Build Instructions

### Operating System & Build Environment Requirements
- **OS**: macOS, Linux, or Windows
- **Node.js**: Version 18.x, 20.x, or 24.x (Tested on Node.js v24.13.0)
- **Package Manager**: Yarn (v1.22+ or Yarn Berry) / Corepack or `npm`

### Step-by-Step Instructions to Reproduce Firefox Add-on Build

1. Extract the source code zip (`vanish-source-code.zip`).
2. Open terminal in the source directory and install dependencies:
   ```bash
   yarn install
   # or: npm install
   ```
3. Run the Firefox build script:
   ```bash
   yarn build:firefox
   # or: node build-firefox.js
   ```
4. The exact output extension bundle will be generated inside **`dist-firefox/`**.

---

## 📦 How to Bundle for Web Store Publishing

- **Chrome Web Store**: Run `yarn pack` to generate **`vanish-chrome.zip`**.
- **Firefox AMO Add-on**: Run `yarn pack:firefox` to generate **`vanish-firefox.zip`**.
- **Firefox AMO Source Code**: Upload **`vanish-source-code.zip`**.

---

## 🚀 How to Load Unpacked in Chrome / Brave / Edge

1. Open your browser and navigate to `chrome://extensions/` or `brave://extensions/`.
2. Turn on **Developer mode** using the toggle switch in the top right corner.
3. Click **Load unpacked**.
4. Select the root project directory (`/Users/mateustav/hide-cursor-on-playback`).
5. **Vanish** is now active!

---

## 🦊 How to Load Unpacked in Firefox

1. Run the Firefox build command: `yarn build:firefox`
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Select `manifest.json` inside the generated **`dist-firefox/`** folder (`/Users/mateustav/hide-cursor-on-playback/dist-firefox/manifest.json`).
5. **Vanish** is now loaded with native Firefox background scripts!

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

