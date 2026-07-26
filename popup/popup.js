document.addEventListener('DOMContentLoaded', async () => {
  const globalToggle = document.getElementById('global-toggle');
  const fullscreenOnlyToggle = document.getElementById('fullscreen-only-toggle');
  const delaySlider = document.getElementById('delay-slider');
  const delayVal = document.getElementById('delay-val');
  const statusCard = document.getElementById('status-card');
  const statusText = document.getElementById('status-text');
  const statusDomain = document.getElementById('status-domain');
  const siteToggleBtn = document.getElementById('site-toggle-btn');
  const presetsPills = document.getElementById('presets-pills');
  const openOptionsBtn = document.getElementById('open-options-btn');

  let settings = {
    enabled: true,
    fullscreenOnly: true,
    delay: 2.0,
    presetSites: [],
    customSites: []
  };

  let currentTab = null;
  let currentHost = '';

  // Get active tab and stored settings
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  if (currentTab && currentTab.url) {
    try {
      const urlObj = new URL(currentTab.url);
      currentHost = urlObj.hostname.toLowerCase();
    } catch (e) {
      currentHost = '';
    }
  }

  // Load stored settings
  const stored = await chrome.storage.sync.get(null);
  settings = { ...settings, ...stored };

  // Helper: check if domain is enabled in settings
  function isSiteEnabled(hostname) {
    if (!hostname) return false;
    
    // Check presets
    if (Array.isArray(settings.presetSites)) {
      for (const site of settings.presetSites) {
        if (site.enabled && site.domain) {
          const domain = site.domain.toLowerCase().trim();
          if (hostname === domain || hostname.endsWith('.' + domain)) {
            return true;
          }
        }
      }
    }

    // Check custom sites
    if (Array.isArray(settings.customSites)) {
      for (const rawDomain of settings.customSites) {
        let domain = rawDomain.toLowerCase().trim();
        domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        if (domain && (hostname === domain || hostname.endsWith('.' + domain))) {
          return true;
        }
      }
    }

    return false;
  }

  // Render UI elements
  function renderUI() {
    globalToggle.checked = settings.enabled;
    fullscreenOnlyToggle.checked = settings.fullscreenOnly;
    delaySlider.value = settings.delay || 2.0;
    delayVal.textContent = (settings.delay || 2.0).toFixed(1) + 's';

    // Status Banner Logic
    if (!currentHost || currentHost.startsWith('chrome://') || currentHost.startsWith('edge://') || currentHost.startsWith('about:')) {
      statusText.textContent = 'Not Applicable';
      statusDomain.textContent = 'Internal Browser Page';
      statusCard.className = 'status-card';
      siteToggleBtn.style.display = 'none';
    } else {
      statusDomain.textContent = currentHost;
      siteToggleBtn.style.display = 'block';

      const enabledForSite = isSiteEnabled(currentHost);

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

    // Render Preset Pills
    renderPresetPills();
  }

  function renderPresetPills() {
    presetsPills.innerHTML = '';
    if (!Array.isArray(settings.presetSites)) return;

    // Filter key popular presets to display in popup
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

  // Notify current tab content script of setting updates
  function notifyTab() {
    if (currentTab && currentTab.id) {
      chrome.tabs.sendMessage(currentTab.id, { action: 'REFRESH_SETTINGS' }, () => {
        // Ignore errors if content script is not injected in page
        if (chrome.runtime.lastError) {}
      });
    }
  }

  // Event Listeners
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

  // Toggle current domain enabled/disabled
  siteToggleBtn.addEventListener('click', async () => {
    if (!currentHost) return;

    // Check if current site matches any preset
    let presetMatch = settings.presetSites.find(s => currentHost === s.domain.toLowerCase() || currentHost.endsWith('.' + s.domain.toLowerCase()));
    
    if (presetMatch) {
      presetMatch.enabled = !presetMatch.enabled;
      await chrome.storage.sync.set({ presetSites: settings.presetSites });
    } else {
      // Handle as custom site
      const customIndex = settings.customSites.findIndex(d => currentHost === d.toLowerCase() || currentHost.endsWith('.' + d.toLowerCase()));
      if (customIndex > -1) {
        // Remove from custom sites
        settings.customSites.splice(customIndex, 1);
      } else {
        // Add to custom sites
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

  // Check tab status message if available
  if (currentTab && currentTab.id) {
    chrome.tabs.sendMessage(currentTab.id, { action: 'GET_STATUS' }, (response) => {
      if (!chrome.runtime.lastError && response) {
        if (response.isFullscreen) {
          statusText.textContent += ' (Fullscreen Active)';
        }
      }
    });
  }

  renderUI();
});
