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
  { id: "netflix", name: "Netflix", domain: "netflix.com", enabled: true },
  { id: "youtube", name: "YouTube", domain: "youtube.com", enabled: true },
  { id: "primevideo", name: "Prime Video", domain: "primevideo.com", aliases: ["amazon.com"], enabled: true },
  { id: "max", name: "Max (HBO)", domain: "max.com", aliases: ["hbomax.com"], enabled: true },
  { id: "hulu", name: "Hulu", domain: "hulu.com", enabled: true },
  { id: "apple", name: "Apple TV+", domain: "tv.apple.com", enabled: true },
  { id: "twitch", name: "Twitch", domain: "twitch.tv", enabled: true },
  { id: "paramount", name: "Paramount+", domain: "paramountplus.com", enabled: true },
  { id: "peacock", name: "Peacock", domain: "peacocktv.com", enabled: true }
];

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  fullscreenOnly: true,
  delay: 2.0,
  theme: 'dark',
  allSitesMode: false,
  presetSites: DEFAULT_PRESETS,
  customSites: []
};
