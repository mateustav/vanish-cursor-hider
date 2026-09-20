import { DEFAULT_PRESETS, DEFAULT_SETTINGS, ExtensionSettings, ThemeMode } from '../types';

document.addEventListener('DOMContentLoaded', async () => {
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  const globalEnabledToggle = document.getElementById('opt-global-enabled') as HTMLInputElement;
  const fullscreenOnlyToggle = document.getElementById('opt-fullscreen-only') as HTMLInputElement;
  const debugModeToggle = document.getElementById('opt-debug-mode') as HTMLInputElement;
  const delaySlider = document.getElementById('opt-delay-slider') as HTMLInputElement;
  const delayNumber = document.getElementById('opt-delay-number') as HTMLInputElement;
  const presetDelayBtns = document.querySelectorAll('.preset-delay-buttons button');
  const resetDefaultsBtn = document.getElementById('reset-defaults-btn') as HTMLButtonElement;

  const themeBtns = document.querySelectorAll('.theme-btn');

  const presetSearch = document.getElementById('preset-search') as HTMLInputElement;
  const presetGrid = document.getElementById('preset-sites-grid') as HTMLDivElement;
  const enableAllBtn = document.getElementById('enable-all-presets') as HTMLButtonElement;
  const disableAllBtn = document.getElementById('disable-all-presets') as HTMLButtonElement;

  const addCustomForm = document.getElementById('add-custom-form') as HTMLFormElement;
  const customDomainInput = document.getElementById('custom-domain-input') as HTMLInputElement;
  const customSitesList = document.getElementById('custom-sites-list') as HTMLDivElement;
  const customCount = document.getElementById('custom-count') as HTMLSpanElement;

  const toast = document.getElementById('toast') as HTMLDivElement;

  let settings: ExtensionSettings = { ...DEFAULT_SETTINGS };

  function showToast(message = 'Settings updated successfully'): void {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  function applyTheme(theme: ThemeMode): void {
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-system');
    document.body.classList.add(`theme-${theme}`);

    themeBtns.forEach(btn => {
      if (btn.getAttribute('data-theme') === theme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  async function loadSettings(): Promise<void> {
    const stored = await chrome.storage.sync.get(null);
    settings = { ...settings, ...(stored as Partial<ExtensionSettings>) };
    const defaultIds = new Set(DEFAULT_PRESETS.map((p) => p.id));
    if (settings.presetSites) {
      settings.presetSites = settings.presetSites.filter((p) => defaultIds.has(p.id));
    }
    renderAll();
  }

  function renderAll(): void {
    globalEnabledToggle.checked = settings.enabled;
    fullscreenOnlyToggle.checked = settings.fullscreenOnly;
    debugModeToggle.checked = settings.debugMode || false;
    delaySlider.value = (settings.delay || 2.0).toString();
    delayNumber.value = (settings.delay || 2.0).toFixed(1);

    applyTheme(settings.theme || 'dark');
    renderPresetSites();
    renderCustomSites();
  }

  function renderPresetSites(): void {
    presetGrid.replaceChildren();
    const query = presetSearch.value.toLowerCase().trim();

    const filtered = (settings.presetSites || []).filter(site => {
      return site.name.toLowerCase().includes(query) || site.domain.toLowerCase().includes(query);
    });

    if (filtered.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';
      emptyDiv.textContent = 'No matching streaming sites found.';
      presetGrid.appendChild(emptyDiv);
      return;
    }

    filtered.forEach(site => {
      const card = document.createElement('div');
      card.className = 'site-card';

      const initials = site.name.substring(0, 2).toUpperCase();

      const siteBadge = document.createElement('div');
      siteBadge.className = 'site-badge';

      const siteIcon = document.createElement('div');
      siteIcon.className = 'site-icon';
      siteIcon.textContent = initials;

      const siteInfo = document.createElement('div');
      siteInfo.className = 'site-info';

      const h4 = document.createElement('h4');
      h4.textContent = site.name;

      const span = document.createElement('span');
      span.textContent = site.domain;

      siteInfo.appendChild(h4);
      siteInfo.appendChild(span);

      siteBadge.appendChild(siteIcon);
      siteBadge.appendChild(siteInfo);

      const label = document.createElement('label');
      label.className = 'toggle-switch';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = site.enabled;
      checkbox.setAttribute('data-site-id', site.id);

      const slider = document.createElement('span');
      slider.className = 'slider';

      label.appendChild(checkbox);
      label.appendChild(slider);

      card.appendChild(siteBadge);
      card.appendChild(label);

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

  function renderCustomSites(): void {
    customSitesList.replaceChildren();
    const list = settings.customSites || [];
    customCount.textContent = list.length.toString();

    if (list.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';
      emptyDiv.textContent = 'No custom domains added yet. Add domain names above to enable cursor hiding on custom streaming players.';
      customSitesList.appendChild(emptyDiv);
      return;
    }

    list.forEach((domain, index) => {
      const row = document.createElement('div');
      row.className = 'custom-site-row';

      const domainSpan = document.createElement('span');
      domainSpan.className = 'custom-site-name';
      domainSpan.textContent = domain;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-domain-btn';
      deleteBtn.setAttribute('data-index', index.toString());
      deleteBtn.textContent = 'Remove';

      row.appendChild(domainSpan);
      row.appendChild(deleteBtn);

      deleteBtn.addEventListener('click', async () => {
        settings.customSites.splice(index, 1);
        await chrome.storage.sync.set({ customSites: settings.customSites });
        renderCustomSites();
        showToast(`Removed ${domain}`);
      });

      customSitesList.appendChild(row);
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      if (!targetTab) return;
      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(targetTab)?.classList.add('active');
    });
  });

  themeBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const selectedTheme = btn.getAttribute('data-theme') as ThemeMode;
      if (selectedTheme) {
        settings.theme = selectedTheme;
        applyTheme(selectedTheme);
        await chrome.storage.sync.set({ theme: selectedTheme });
        showToast(`Theme set to ${selectedTheme}`);
      }
    });
  });

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

  debugModeToggle.addEventListener('change', async () => {
    settings.debugMode = debugModeToggle.checked;
    await chrome.storage.sync.set({ debugMode: settings.debugMode });
    showToast(settings.debugMode ? 'Debug mode enabled' : 'Debug mode disabled');
  });

  function updateDelay(newVal: string): void {
    let val = parseFloat(newVal);
    if (isNaN(val)) val = 2.0;
    val = Math.max(0.5, Math.min(10.0, val));

    settings.delay = val;
    delaySlider.value = val.toString();
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
      if (delay) updateDelay(delay);
    });
  });

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

  addCustomForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let raw = customDomainInput.value.trim().toLowerCase();
    if (!raw) return;

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

  resetDefaultsBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      settings = { ...DEFAULT_SETTINGS };
      await chrome.storage.sync.set(DEFAULT_SETTINGS);
      renderAll();
      showToast('Settings reset to factory defaults');
    }
  });

  loadSettings();
});
