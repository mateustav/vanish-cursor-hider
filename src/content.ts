import { DEFAULT_SETTINGS, ExtensionSettings, StatusResponse } from './types';
import { isSiteEnabledForHost } from './domainMatcher';
import { IdleController, injectCursorStyles, isFullscreenActive } from './idleController';

declare global {
  interface Window {
    __autoCursorHiderInjected?: boolean;
  }
}

(function () {
  'use strict';

  if (window.__autoCursorHiderInjected) return;
  window.__autoCursorHiderInjected = true;

  let currentSettings: ExtensionSettings = { ...DEFAULT_SETTINGS };
  let controller: IdleController | null = null;

  function logStatus(): void {
    if (!currentSettings.debugMode) return;
    const hostname = window.location.hostname;
    if (!hostname) return;
    const isMatched = isSiteEnabledForHost(hostname, currentSettings, document.referrer);
    const isFS = isFullscreenActive(document, window);

    console.log(
      `[Vanish] Status -> Site: "${hostname}" | Matched: ${isMatched} | Fullscreen: ${isFS} | Enabled: ${currentSettings.enabled} | FullscreenOnly: ${currentSettings.fullscreenOnly} | Delay: ${currentSettings.delay}s`
    );
  }

  function init(): void {
    injectCursorStyles(document);
    controller = new IdleController(currentSettings, document, window);

    if (currentSettings.debugMode && window.location.hostname) {
      console.log(`[Vanish] Extension loaded on ${window.location.hostname}`);
    }

    // Fetch initial settings from Chrome Storage
    chrome.storage.sync.get(null, (stored) => {
      if (chrome.runtime.lastError) return;
      currentSettings = { ...DEFAULT_SETTINGS, ...(stored as Partial<ExtensionSettings>) };
      controller?.updateSettings(currentSettings);
      logStatus();
    });

    // Listen for real-time setting updates from options/popup
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync') {
        for (const [key, change] of Object.entries(changes)) {
          (currentSettings as any)[key] = change.newValue;
        }
        controller?.updateSettings(currentSettings);
        logStatus();
      }
    });

    // User activity listeners
    const activityHandler = (e: Event) => {
      controller?.handleUserActivity(e);
    };

    const options: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener('mousemove', activityHandler, options);
    window.addEventListener('pointermove', activityHandler, options);
    window.addEventListener('mousedown', activityHandler, options);
    window.addEventListener('mouseup', activityHandler, options);
    window.addEventListener('keydown', activityHandler, options);
    window.addEventListener('wheel', activityHandler, options);
    window.addEventListener('scroll', activityHandler, options);
    window.addEventListener('touchstart', activityHandler, options);

    // Fullscreen and window resize status changes
    const fullscreenHandler = () => {
      setTimeout(() => {
        controller?.evaluateState();
        logStatus();
      }, 100);
    };

    document.addEventListener('fullscreenchange', fullscreenHandler);
    document.addEventListener('webkitfullscreenchange', fullscreenHandler);
    document.addEventListener('mozfullscreenchange', fullscreenHandler);
    window.addEventListener('resize', fullscreenHandler);

    // Message listener for popup query or refresh
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (request.action === 'GET_STATUS') {
        const response: StatusResponse = {
          hostname: window.location.hostname,
          isSiteMatched: isSiteEnabledForHost(window.location.hostname, currentSettings, document.referrer),
          isFullscreen: isFullscreenActive(document, window),
          settings: currentSettings
        };
        sendResponse(response);
      } else if (request.action === 'REFRESH_SETTINGS') {
        chrome.storage.sync.get(null, (stored) => {
          currentSettings = { ...DEFAULT_SETTINGS, ...(stored as Partial<ExtensionSettings>) };
          controller?.updateSettings(currentSettings);
          logStatus();
          sendResponse({ success: true });
        });
        return true;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
