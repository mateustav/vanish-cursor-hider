# Mozilla Firefox Add-on Reviewer Guide

Thank you for reviewing **Vanish: Auto Pointer Hider**!

---

## 🧪 How to Test the Extension

1. **Open a Supported Video Site**:
   - Navigate to **YouTube** ([https://www.youtube.com](https://www.youtube.com)) or **Disney+** ([https://www.disneyplus.com](https://www.disneyplus.com)).
   - *Note: YouTube requires no login or account creation to test.*

2. **Verify Mouse Pointer Hiding**:
   - Play any video.
   - **Important**: By default, Vanish operates in Fullscreen Mode Only. To trigger cursor hiding:
     - **Option A**: Enter Fullscreen mode on the video player, OR
     - **Option B**: Click the Vanish extension icon in the toolbar and toggle **Fullscreen Only** to **OFF**.
   - Move your mouse cursor over the video player and stop moving.
   - **Expected Result**: After 2 seconds of inactivity, the mouse cursor automatically vanishes.
   - Move the mouse cursor again. The cursor instantly reappears.

3. **Verify Extension Options**:
   - Click the extension icon in the toolbar to open the **Popup dashboard**.
   - Test adjusting the **Idle Delay Slider** or adding custom domains.

---

## 🛠️ Step-by-Step Build Instructions

### Build Environment Requirements
- **OS**: macOS, Linux, or Windows
- **Node.js**: v18.0.0 or higher (Tested on Node.js v24.13.0)
- **Package Manager**: `yarn` or `npm`

### Reproduction Steps

1. Extract this source code package (`vanish-source-code.zip`).
2. Open terminal in the extracted directory and install dependencies:
   ```bash
   yarn install
   # or: npm install
   ```
3. Run the Firefox build script:
   ```bash
   yarn build:firefox
   # or: node build-firefox.js
   ```
4. The exact compiled add-on bundle will be generated inside the **`dist-firefox/`** directory.

---

## 🔒 Third-Party & Code Disclosures

- All executable JavaScript and CSS code is compiled and bundled locally.
- **Zero Remote Code**: No remote scripts, external APIs, or analytics tracking are used.
- **Data Privacy**: `"data_collection_permissions": { "required": ["none"] }`. Zero personal data is collected or transmitted.
