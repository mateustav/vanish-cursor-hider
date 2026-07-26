import { ExtensionSettings } from './types';

/**
 * Normalizes domain string by stripping protocols, www prefix, paths, and trailing slashes.
 */
export function normalizeDomain(input: string): string {
  if (!input) return '';
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
  domain = domain.split('/')[0];
  domain = domain.split(':')[0]; // remove port if present
  return domain;
}

/**
 * Checks if a hostname matches a target domain (exact match or subdomain match).
 */
export function isDomainMatching(hostname: string, targetDomain: string): boolean {
  if (!hostname || !targetDomain) return false;

  const cleanHost = hostname.trim().toLowerCase();
  const cleanTarget = normalizeDomain(targetDomain);

  if (!cleanHost || !cleanTarget) return false;

  if (cleanTarget === '*' || cleanTarget === 'all') return true;

  return (
    cleanHost === cleanTarget ||
    cleanHost.endsWith('.' + cleanTarget)
  );
}

/**
 * Checks whether the current hostname (or iframe parent/referrer) matches any enabled preset site or custom site.
 */
export function isSiteEnabledForHost(hostname: string, settings: ExtensionSettings, docRef: string = ''): boolean {
  if (!settings) return false;

  // Global "All Sites" mode override
  if (settings.allSitesMode) {
    return true;
  }

  const hostsToTest: string[] = [hostname];
  if (docRef) {
    try {
      const refUrl = new URL(docRef);
      hostsToTest.push(refUrl.hostname);
    } catch {}
  }

  for (const host of hostsToTest) {
    if (!host) continue;

    const lowerHost = host.toLowerCase();

    // Check preset sites and aliases
    if (Array.isArray(settings.presetSites)) {
      for (const site of settings.presetSites) {
        if (site.enabled) {
          if (site.domain && isDomainMatching(host, site.domain)) {
            return true;
          }
          if (Array.isArray(site.aliases)) {
            for (const alias of site.aliases) {
              if (isDomainMatching(host, alias)) {
                return true;
              }
            }
          }
        }
      }
    }

    // Fallback check for Disney / BAMGrid / Star+ streaming CDN frames if Disney+ preset is enabled
    if (lowerHost.endsWith('.disney.com') || lowerHost.endsWith('.bamgrid.com') || lowerHost.endsWith('.starplus.com') || lowerHost.endsWith('.hotstar.com')) {
      const disneyPreset = settings.presetSites?.find(s => s.id === 'disneyplus');
      if (disneyPreset && disneyPreset.enabled) {
        return true;
      }
    }

    // Check custom sites
    if (Array.isArray(settings.customSites)) {
      for (const customDomain of settings.customSites) {
        if (customDomain && isDomainMatching(host, customDomain)) {
          return true;
        }
      }
    }
  }

  return false;
}
