import { DEFAULT_PRESETS, DEFAULT_SETTINGS, ExtensionSettings } from './types';

chrome.runtime.onInstalled.addListener(async (details) => {
  const defaultPresetIds = new Set(DEFAULT_PRESETS.map((p) => p.id));

  if (details.reason === "install") {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
  } else if (details.reason === "update") {
    const existing = (await chrome.storage.sync.get(null)) as Partial<ExtensionSettings>;
    const updated: ExtensionSettings = { ...DEFAULT_SETTINGS, ...existing };

    // Strict filter: Only keep preset sites that exist in DEFAULT_PRESETS (Disney+ and YouTube)
    if (existing.presetSites) {
      updated.presetSites = existing.presetSites.filter((p) => defaultPresetIds.has(p.id));
      // Add any missing default presets
      const existingIds = new Set(updated.presetSites.map((s) => s.id));
      for (const preset of DEFAULT_PRESETS) {
        if (!existingIds.has(preset.id)) {
          updated.presetSites.push(preset);
        }
      }
    } else {
      updated.presetSites = DEFAULT_PRESETS;
    }

    await chrome.storage.sync.set(updated);
  }
});
