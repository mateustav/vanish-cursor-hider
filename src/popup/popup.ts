import { DEFAULT_SETTINGS, ExtensionSettings, StatusResponse } from '../types';
import { isSiteEnabledForHost } from '../domainMatcher';

document.addEventListener('DOMContentLoaded', async () => {
  const globalToggle = document.getElementById('global-toggle') as HTMLInputElement;
  const fullscreenOnlyToggle = document.getElementById('fullscreen-only-toggle') as HTMLInputElement;
  const allSitesToggle = document.getElementById('all-sites-toggle') as HTMLInputElement;
  const delaySlider = document.getElementById('delay-slider') as HTMLInputElement;
  const delayVal = document.getElementById('delay-val') as HTMLSpanElement;
  const statusCard = document.getElementById('status-card') as HTMLDivElement;
  const statusText = document.getElementById('status-text') as HTMLDivElement;
  const statusDomain = document.getElementById('status-domain') as HTMLDivElement;
  const siteToggleBtn = document.getElementById('site-toggle-btn') as HTMLButtonElement;
  const presetsPills = document.getElementById('presets-pills') as HTMLDivElement;
  const openOptionsBtn = document.getElementById('open-options-btn') as HTMLButtonElement;

  let settings: ExtensionSettings = { ...DEFAULT_SETTINGS };
  let currentTab: chrome.tabs.Tab | null = null;
  let currentHost = '';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab || null;

  if (currentTab && currentTab.url) {
    try {
      const urlObj = new URL(currentTab.url);
      currentHost = urlObj.hostname.toLowerCase();
    } catch {
      currentHost = '';
    }
  }

  const stored = await chrome.storage.sync.get(null);
  settings = { ...settings, ...(stored as Partial<ExtensionSettings>) };

  function renderUI(): void {
    globalToggle.checked = settings.enabled;
    fullscreenOnlyToggle.checked = settings.fullscreenOnly;
    if (allSitesToggle) {
      allSitesToggle.checked = !!settings.allSitesMode;
    }
    delaySlider.value = (settings.delay || 2.0).toString();
    delayVal.textContent = (settings.delay || 2.0).toFixed(1) + 's';

    if (!currentHost || currentHost.startsWith('chrome://') || currentHost.startsWith('edge://') || currentHost.startsWith('about:')) {
      statusText.textContent = 'Not Applicable';
      statusDomain.textContent = 'Internal Browser Page';
      statusCard.className = 'status-card';
      siteToggleBtn.style.display = 'none';
    } else {
      statusDomain.textContent = currentHost;
      siteToggleBtn.style.display = 'block';

      const enabledForSite = isSiteEnabledForHost(currentHost, settings);

      if (!settings.enabled) {
        statusText.textContent = 'Extension Disabled';
        statusCard.className = 'status-card inactive';
        siteToggleBtn.textContent = 'Enable';
      } else if (enabledForSite) {
        statusText.textContent = 'Active on this site';
        statusCard.className = 'status-card active';
        siteToggleBtn.textContent = 'Disable';
      } else {
        statusText.textContent = 'Disabled on this site';
        statusCard.className = 'status-card inactive';
        siteToggleBtn.textContent = 'Enable';
      }
    }

    renderPresetPills();
  }

  function renderPresetPills(): void {
    presetsPills.innerHTML = '';
    if (!Array.isArray(settings.presetSites)) return;

    const popularIds = ['disneyplus', 'netflix', 'youtube', 'primevideo', 'max', 'hulu'];
    const popularPresets = settings.presetSites.filter(s => popularIds.includes(s.id));

    popularPresets.forEach(site => {
      const pill = document.createElement('div');
      pill.className = `preset-pill ${site.enabled ? 'active' : ''}`;

      const dot = document.createElement('span');
      dot.className = 'dot';

      const name = document.createElement('span');
      name.textContent = site.name;

      pill.appendChild(dot);
      pill.appendChild(name);

      pill.addEventListener('click', async () => {
        site.enabled = !site.enabled;
        await chrome.storage.sync.set({ presetSites: settings.presetSites });
        renderUI();
        notifyTab();
      });

      presetsPills.appendChild(pill);
    });
  }

  function notifyTab(): void {
    if (currentTab && currentTab.id) {
      chrome.tabs.sendMessage(currentTab.id, { action: 'REFRESH_SETTINGS' }, () => {
        if (chrome.runtime.lastError) {}
      });
    }
  }

  globalToggle.addEventListener('change', async () => {
    settings.enabled = globalToggle.checked;
    await chrome.storage.sync.set({ enabled: settings.enabled });
    renderUI();
    notifyTab();
  });

  fullscreenOnlyToggle.addEventListener('change', async () => {
    settings.fullscreenOnly = fullscreenOnlyToggle.checked;
    await chrome.storage.sync.set({ fullscreenOnly: settings.fullscreenOnly });
    notifyTab();
  });

  if (allSitesToggle) {
    allSitesToggle.addEventListener('change', async () => {
      settings.allSitesMode = allSitesToggle.checked;
      await chrome.storage.sync.set({ allSitesMode: settings.allSitesMode });
      renderUI();
      notifyTab();
    });
  }

  delaySlider.addEventListener('input', () => {
    const val = parseFloat(delaySlider.value);
    delayVal.textContent = val.toFixed(1) + 's';
  });

  delaySlider.addEventListener('change', async () => {
    const val = parseFloat(delaySlider.value);
    settings.delay = val;
    await chrome.storage.sync.set({ delay: val });
    notifyTab();
  });

  siteToggleBtn.addEventListener('click', async () => {
    if (!currentHost) return;

    let presetMatch = settings.presetSites.find(s => currentHost === s.domain.toLowerCase() || currentHost.endsWith('.' + s.domain.toLowerCase()));

    if (presetMatch) {
      presetMatch.enabled = !presetMatch.enabled;
      await chrome.storage.sync.set({ presetSites: settings.presetSites });
    } else {
      const customIndex = settings.customSites.findIndex(d => currentHost === d.toLowerCase() || currentHost.endsWith('.' + d.toLowerCase()));
      if (customIndex > -1) {
        settings.customSites.splice(customIndex, 1);
      } else {
        settings.customSites.push(currentHost);
      }
      await chrome.storage.sync.set({ customSites: settings.customSites });
    }

    renderUI();
    notifyTab();
  });

  openOptionsBtn.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options/options.html'));
    }
  });

  if (currentTab && currentTab.id) {
    chrome.tabs.sendMessage(currentTab.id, { action: 'GET_STATUS' }, (response: StatusResponse) => {
      if (!chrome.runtime.lastError && response) {
        if (response.isFullscreen) {
          statusText.textContent += ' (Fullscreen Active)';
        }
      }
    });
  }

  renderUI();
});
