import { DEFAULT_SETTINGS, ExtensionSettings } from './types';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
    console.log("[Auto Cursor Hider] Default settings initialized.");
  } else if (details.reason === "update") {
    const existing = (await chrome.storage.sync.get(null)) as Partial<ExtensionSettings>;
    const updated: ExtensionSettings = { ...DEFAULT_SETTINGS, ...existing };

    if (existing.presetSites) {
      const existingIds = new Set(existing.presetSites.map((s) => s.id));
      const mergedPresets = [...existing.presetSites];
      for (const preset of DEFAULT_SETTINGS.presetSites) {
        if (!existingIds.has(preset.id)) {
          mergedPresets.push(preset);
        }
      }
      updated.presetSites = mergedPresets;
    }

    await chrome.storage.sync.set(updated);
  }
});
