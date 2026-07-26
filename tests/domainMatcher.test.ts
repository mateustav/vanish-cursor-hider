import { normalizeDomain, isDomainMatching, isSiteEnabledForHost } from '../src/domainMatcher';
import { DEFAULT_SETTINGS, ExtensionSettings } from '../src/types';

describe('domainMatcher', () => {
  describe('normalizeDomain', () => {
    it('should strip http, https, and www prefixes', () => {
      expect(normalizeDomain('https://www.disneyplus.com')).toBe('disneyplus.com');
      expect(normalizeDomain('http://disneyplus.com')).toBe('disneyplus.com');
      expect(normalizeDomain('www.netflix.com')).toBe('netflix.com');
    });

    it('should strip URL paths and trailing slashes', () => {
      expect(normalizeDomain('https://www.disneyplus.com/browse/home')).toBe('disneyplus.com');
      expect(normalizeDomain('netflix.com/title/80000')).toBe('netflix.com');
    });

    it('should strip ports', () => {
      expect(normalizeDomain('localhost:8080')).toBe('localhost');
      expect(normalizeDomain('192.168.1.10:3000')).toBe('192.168.1.10');
    });

    it('should return lowercase normalized domain', () => {
      expect(normalizeDomain('HTTPS://WWW.DISNEYPLUS.COM')).toBe('disneyplus.com');
    });

    it('should handle empty or null input gracefully', () => {
      expect(normalizeDomain('')).toBe('');
      expect(normalizeDomain(null as any)).toBe('');
    });
  });

  describe('isDomainMatching', () => {
    it('should match exact domain', () => {
      expect(isDomainMatching('disneyplus.com', 'disneyplus.com')).toBe(true);
    });

    it('should match subdomains', () => {
      expect(isDomainMatching('www.disneyplus.com', 'disneyplus.com')).toBe(true);
      expect(isDomainMatching('app.tv.apple.com', 'tv.apple.com')).toBe(true);
    });

    it('should not match completely different domains', () => {
      expect(isDomainMatching('notdisneyplus.com', 'disneyplus.com')).toBe(false);
      expect(isDomainMatching('google.com', 'disneyplus.com')).toBe(false);
    });

    it('should handle case insensitivity', () => {
      expect(isDomainMatching('WWW.DISNEYPLUS.COM', 'disneyplus.com')).toBe(true);
    });
  });

  describe('isSiteEnabledForHost', () => {
    let settings: ExtensionSettings;

    beforeEach(() => {
      settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    });

    it('should return true for Disney+ by default', () => {
      expect(isSiteEnabledForHost('disneyplus.com', settings)).toBe(true);
      expect(isSiteEnabledForHost('www.disneyplus.com', settings)).toBe(true);
    });

    it('should return true for default enabled preset sites', () => {
      expect(isSiteEnabledForHost('netflix.com', settings)).toBe(true);
      expect(isSiteEnabledForHost('youtube.com', settings)).toBe(true);
      expect(isSiteEnabledForHost('www.youtube.com', settings)).toBe(true);
      expect(isSiteEnabledForHost('primevideo.com', settings)).toBe(true);
      expect(isSiteEnabledForHost('max.com', settings)).toBe(true);
    });

    it('should return false if preset site is disabled in settings', () => {
      const disneyPreset = settings.presetSites.find(s => s.id === 'disneyplus');
      if (disneyPreset) disneyPreset.enabled = false;

      expect(isSiteEnabledForHost('disneyplus.com', settings)).toBe(false);
    });

    it('should match custom user domains', () => {
      settings.customSites = ['crunchyroll.com', 'bilibili.com'];

      expect(isSiteEnabledForHost('crunchyroll.com', settings)).toBe(true);
      expect(isSiteEnabledForHost('beta.crunchyroll.com', settings)).toBe(true);
      expect(isSiteEnabledForHost('bilibili.com', settings)).toBe(true);
      expect(isSiteEnabledForHost('unadded-site.com', settings)).toBe(false);
    });
  });
});
