# Vanish — Auto Pointer Hider for Streaming

A lightweight, modern Manifest V3 extension written in **TypeScript** that automatically vanishes the mouse pointer during video playback on **Disney+** and other popular streaming services after a customizable idle delay.

---

## ✨ Features

- 🎬 **Disney+ Native Support**: Custom Web Component & Shadow DOM support for Disney+ (`disneyplus.com`).
- 📺 **Major Streaming Presets**: Built-in preset support for Disney+, Netflix, YouTube, Amazon Prime Video, Max (HBO), Hulu, Apple TV+, Twitch, Paramount+, and Peacock.
- 🌐 **Custom Domain Manager**: Add any custom website, anime platform, or local media server (e.g. `crunchyroll.com`, `plex.tv`, `localhost:8080`).
- ⏱️ **Configurable Idle Delay**: Adjust the idle timer before the pointer vanishes (from 0.5 seconds to 10 seconds).
- 🖥️ **Playback & Fullscreen Mode**: Choose between hiding the pointer on active video playback pages or strictly in fullscreen mode.
- ⚡ **Instant Real-Time Sync**: Change settings in the Popup or Options page with immediate sync across open tabs.
- 🧪 **TypeScript & Jest Tested**: Built with strict TypeScript types and comprehensive unit tests using Jest (`ts-jest`, `@types/chrome`, `jest-environment-jsdom`).

---

## 🛠️ Scripts & Build Commands

- `yarn build`: Bundles and minifies TypeScript source files for Chrome, Brave, and Edge.
- `yarn build:firefox`: Generates the self-contained Firefox build folder (`dist-firefox/`).
- `yarn build:dev`: Bundles source files without minification for debugging.
- `yarn test`: Runs the Jest unit test suite across all modules.
- `yarn typecheck`: Performs strict TypeScript type checking (`tsc --noEmit`).

---

## 🚀 How to Load in Chrome / Brave / Edge

1. Open your browser and navigate to `chrome://extensions/` or `brave://extensions/`.
2. Turn on **Developer mode** using the toggle switch in the top right corner.
3. Click **Load unpacked**.
4. Select the root project directory (`/Users/mateustav/hide-cursor-on-playback`).
5. **Vanish** is now active!

---

## 🦊 How to Load in Firefox

1. Run the Firefox build command: `yarn build:firefox`
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Select `manifest.json` inside the generated **`dist-firefox/`** folder (`/Users/mateustav/hide-cursor-on-playback/dist-firefox/manifest.json`).
5. **Vanish** is now loaded with native Firefox background scripts!

---

## 🔒 License & Copyright

**Copyright (c) 2026 Mateus Tav. All Rights Reserved. Private & Proprietary.**

This software is strictly private and proprietary. No permission is granted to copy, modify, distribute, publish, or commercialize this code without express written permission.
