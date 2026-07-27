export interface PresetSite {
  id: string;
  name: string;
  domain: string;
  aliases?: string[];
  enabled: boolean;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ExtensionSettings {
  enabled: boolean;
  fullscreenOnly: boolean;
  delay: number; // in seconds
  theme: ThemeMode;
  allSitesMode: boolean; // Hide cursor on all websites
  debugMode: boolean; // Enable diagnostic console logs
  presetSites: PresetSite[];
  customSites: string[];
}

export interface StatusResponse {
  hostname: string;
  isSiteMatched: boolean;
  isFullscreen: boolean;
  settings: ExtensionSettings;
}

export const DEFAULT_PRESETS: PresetSite[] = [
  { 
    id: "disneyplus", 
    name: "Disney+", 
    domain: "disneyplus.com", 
    aliases: ["disneyplus.com", "disney.com", "starplus.com", "hotstar.com", "bamgrid.com", "disney-plus.net", "dng.disneyplus.com"], 
    enabled: true 
  },
  { 
    id: "youtube", 
    name: "YouTube", 
    domain: "youtube.com", 
    enabled: true 
  }
];

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  fullscreenOnly: true,
  delay: 2.0,
  theme: 'dark',
  allSitesMode: false,
  debugMode: false,
  presetSites: DEFAULT_PRESETS,
  customSites: []
};
