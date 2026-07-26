document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  const globalEnabledToggle = document.getElementById('opt-global-enabled');
  const fullscreenOnlyToggle = document.getElementById('opt-fullscreen-only');
  const delaySlider = document.getElementById('opt-delay-slider');
  const delayNumber = document.getElementById('opt-delay-number');
  const presetDelayBtns = document.querySelectorAll('.preset-delay-buttons button');
  const resetDefaultsBtn = document.getElementById('reset-defaults-btn');

  const presetSearch = document.getElementById('preset-search');
  const presetGrid = document.getElementById('preset-sites-grid');
  const enableAllBtn = document.getElementById('enable-all-presets');
  const disableAllBtn = document.getElementById('disable-all-presets');

  const addCustomForm = document.getElementById('add-custom-form');
  const customDomainInput = document.getElementById('custom-domain-input');
  const customSitesList = document.getElementById('custom-sites-list');
  const customCount = document.getElementById('custom-count');

  const toast = document.getElementById('toast');

  let settings = {
    enabled: true,
    fullscreenOnly: true,
    delay: 2.0,
    presetSites: [],
    customSites: []
  };

  // Toast notification popup helper
  function showToast(message = 'Settings updated successfully') {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // Load initial settings
  async function loadSettings() {
    const stored = await chrome.storage.sync.get(null);
    settings = { ...settings, ...stored };
    renderAll();
  }

  // Render everything based on current settings
  function renderAll() {
    // General
    globalEnabledToggle.checked = settings.enabled;
    fullscreenOnlyToggle.checked = settings.fullscreenOnly;
    delaySlider.value = settings.delay || 2.0;
    delayNumber.value = (settings.delay || 2.0).toFixed(1);

    // Presets
    renderPresetSites();

    // Custom Sites
    renderCustomSites();
  }

  // Render preset streaming sites grid
  function renderPresetSites() {
    presetGrid.innerHTML = '';
    const query = presetSearch.value.toLowerCase().trim();

    const filtered = (settings.presetSites || []).filter(site => {
      return site.name.toLowerCase().includes(query) || site.domain.toLowerCase().includes(query);
    });

    if (filtered.length === 0) {
      presetGrid.innerHTML = `<div class="empty-state">No matching streaming sites found.</div>`;
      return;
    }

    filtered.forEach(site => {
      const card = document.createElement('div');
      card.className = 'site-card';

      // First letters of name for badge logo fallback
      const initials = site.name.substring(0, 2).toUpperCase();

      card.innerHTML = `
        <div class="site-badge">
          <div class="site-icon">${initials}</div>
          <div class="site-info">
            <h4>${site.name}</h4>
            <span>${site.domain}</span>
          </div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${site.enabled ? 'checked' : ''} data-site-id="${site.id}">
          <span class="slider"></span>
        </label>
      `;

      // Event listener for site toggle
      const checkbox = card.querySelector('input');
      checkbox.addEventListener('change', async () => {
        const targetSite = settings.presetSites.find(s => s.id === site.id);
        if (targetSite) {
          targetSite.enabled = checkbox.checked;
          await chrome.storage.sync.set({ presetSites: settings.presetSites });
          showToast(`Updated ${site.name} setting`);
        }
      });

      presetGrid.appendChild(card);
    });
  }

  // Render custom user domains
  function renderCustomSites() {
    customSitesList.innerHTML = '';
    const list = settings.customSites || [];
    customCount.textContent = list.length;

    if (list.length === 0) {
      customSitesList.innerHTML = `
        <div class="empty-state">
          No custom domains added yet. Add domain names above to enable cursor hiding on custom streaming players.
        </div>
      `;
      return;
    }

    list.forEach((domain, index) => {
      const row = document.createElement('div');
      row.className = 'custom-site-row';

      row.innerHTML = `
        <span class="custom-site-name">${domain}</span>
        <button class="delete-domain-btn" data-index="${index}">Remove</button>
      `;

      const deleteBtn = row.querySelector('.delete-domain-btn');
      deleteBtn.addEventListener('click', async () => {
        settings.customSites.splice(index, 1);
        await chrome.storage.sync.set({ customSites: settings.customSites });
        renderCustomSites();
        showToast(`Removed ${domain}`);
      });

      customSitesList.appendChild(row);
    });
  }

  // Navigation Tab Switching
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  // General Settings Event Handlers
  globalEnabledToggle.addEventListener('change', async () => {
    settings.enabled = globalEnabledToggle.checked;
    await chrome.storage.sync.set({ enabled: settings.enabled });
    showToast(settings.enabled ? 'Extension enabled' : 'Extension disabled');
  });

  fullscreenOnlyToggle.addEventListener('change', async () => {
    settings.fullscreenOnly = fullscreenOnlyToggle.checked;
    await chrome.storage.sync.set({ fullscreenOnly: settings.fullscreenOnly });
    showToast('Fullscreen mode updated');
  });

  function updateDelay(newVal) {
    let val = parseFloat(newVal);
    if (isNaN(val)) val = 2.0;
    val = Math.max(0.5, Math.min(10.0, val));
    
    settings.delay = val;
    delaySlider.value = val;
    delayNumber.value = val.toFixed(1);

    chrome.storage.sync.set({ delay: val });
    showToast(`Idle delay set to ${val.toFixed(1)}s`);
  }

  delaySlider.addEventListener('input', () => {
    delayNumber.value = parseFloat(delaySlider.value).toFixed(1);
  });

  delaySlider.addEventListener('change', () => {
    updateDelay(delaySlider.value);
  });

  delayNumber.addEventListener('change', () => {
    updateDelay(delayNumber.value);
  });

  presetDelayBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const delay = btn.getAttribute('data-delay');
      updateDelay(delay);
    });
  });

  // Streaming Presets Search & Filter
  presetSearch.addEventListener('input', () => {
    renderPresetSites();
  });

  enableAllBtn.addEventListener('click', async () => {
    settings.presetSites.forEach(s => s.enabled = true);
    await chrome.storage.sync.set({ presetSites: settings.presetSites });
    renderPresetSites();
    showToast('All preset sites enabled');
  });

  disableAllBtn.addEventListener('click', async () => {
    settings.presetSites.forEach(s => s.enabled = false);
    await chrome.storage.sync.set({ presetSites: settings.presetSites });
    renderPresetSites();
    showToast('All preset sites disabled');
  });

  // Custom Domain Form Handler
  addCustomForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let raw = customDomainInput.value.trim().toLowerCase();
    if (!raw) return;

    // Clean protocol, path, port
    let domain = raw.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

    if (!domain) return;

    if (!Array.isArray(settings.customSites)) {
      settings.customSites = [];
    }

    if (settings.customSites.includes(domain)) {
      showToast(`Domain ${domain} is already added`);
      customDomainInput.value = '';
      return;
    }

    settings.customSites.push(domain);
    await chrome.storage.sync.set({ customSites: settings.customSites });
    customDomainInput.value = '';
    renderCustomSites();
    showToast(`Added ${domain}`);
  });

  // Reset to Defaults
  resetDefaultsBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      const DEFAULT_SETTINGS = {
        enabled: true,
        fullscreenOnly: true,
        delay: 2.0,
        presetSites: [
          { id: "disneyplus", name: "Disney+", domain: "disneyplus.com", enabled: true },
          { id: "netflix", name: "Netflix", domain: "netflix.com", enabled: true },
          { id: "youtube", name: "YouTube", domain: "youtube.com", enabled: true },
          { id: "primevideo", name: "Prime Video", domain: "primevideo.com", enabled: true },
          { id: "amazon", name: "Amazon Video", domain: "amazon.com", enabled: true },
          { id: "max", name: "Max (HBO)", domain: "max.com", enabled: true },
          { id: "hulu", name: "Hulu", domain: "hulu.com", enabled: true },
          { id: "apple", name: "Apple TV+", domain: "tv.apple.com", enabled: true },
          { id: "twitch", name: "Twitch", domain: "twitch.tv", enabled: true },
          { id: "paramount", name: "Paramount+", domain: "paramountplus.com", enabled: true },
          { id: "peacock", name: "Peacock", domain: "peacocktv.com", enabled: true }
        ],
        customSites: []
      };

      await chrome.storage.sync.set(DEFAULT_SETTINGS);
      settings = DEFAULT_SETTINGS;
      renderAll();
      showToast('Settings reset to factory defaults');
    }
  });

  loadSettings();
});
