import { ExtensionSettings } from './types';
import { isSiteEnabledForHost } from './domainMatcher';

export const STYLE_ID = 'auto-cursor-hider-style';
export const OVERLAY_ID = 'ach-cursor-overlay';
export const SHADOW_STYLE_ID = 'ach-shadow-style';
export const HIDDEN_CLASS = 'ach-cursor-hidden';

const TRANSPARENT_CURSOR_DATA = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==") 0 0, none !important`;

const CURSOR_NONE_CSS = `
  html.${HIDDEN_CLASS},
  html.${HIDDEN_CLASS} body,
  html.${HIDDEN_CLASS} *,
  html.${HIDDEN_CLASS} *::before,
  html.${HIDDEN_CLASS} *::after,
  html.${HIDDEN_CLASS} pointer-actions,
  html.${HIDDEN_CLASS} pointer-actions *,
  html.${HIDDEN_CLASS} pointer-actions::part(pointer-mask-root),
  html.${HIDDEN_CLASS} pointer-actions::part(pointer-mask-root) *,
  html.${HIDDEN_CLASS} pointer-actions::part(pointer-mask-root) svg,
  html.${HIDDEN_CLASS} pointer-actions::part(pointer-mask-root) path,
  html.${HIDDEN_CLASS} [part*="pointer"],
  html.${HIDDEN_CLASS} [part*="pointer"] *,
  html.${HIDDEN_CLASS} [data-pointer-mask-svg],
  html.${HIDDEN_CLASS} [data-pointer-mask-path],
  html.${HIDDEN_CLASS} path,
  html.${HIDDEN_CLASS} svg,
  html.${HIDDEN_CLASS} video,
  html.${HIDDEN_CLASS} canvas,
  html.${HIDDEN_CLASS} iframe,
  html.${HIDDEN_CLASS} div,
  html.${HIDDEN_CLASS} button {
    cursor: ${TRANSPARENT_CURSOR_DATA};
  }

  pointer-actions::part(pointer-mask-root),
  pointer-actions::part(pointer-mask-root) *,
  pointer-actions::part(pointer-mask-root) path {
    cursor: ${TRANSPARENT_CURSOR_DATA};
  }

  #${OVERLAY_ID} {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 2147483647 !important;
    background: transparent !important;
    pointer-events: none !important;
    cursor: ${TRANSPARENT_CURSOR_DATA};
    display: none;
  }

  #${OVERLAY_ID}.active {
    display: block !important;
  }
`;

const SHADOW_CURSOR_NONE_CSS = `
  * {
    cursor: ${TRANSPARENT_CURSOR_DATA};
  }
  path, svg, div, button, a, [part*="pointer"], [data-pointer-mask-path] {
    cursor: ${TRANSPARENT_CURSOR_DATA};
  }
`;

export function injectCursorStyles(doc: Document = document): void {
  let styleEl = doc.getElementById(STYLE_ID) as HTMLStyleElement;
  if (!styleEl) {
    styleEl = doc.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = CURSOR_NONE_CSS;

    const target = doc.head || doc.documentElement || doc.body;
    if (target) {
      target.appendChild(styleEl);
    }
  } else {
    styleEl.textContent = CURSOR_NONE_CSS;
  }

  if (!doc.getElementById(OVERLAY_ID)) {
    const overlay = doc.createElement('div');
    overlay.id = OVERLAY_ID;
    const target = doc.body || doc.documentElement;
    if (target) {
      target.appendChild(overlay);
    }
  }
}

/**
 * Lightweight targeted Shadow Root processor. Only queries known custom Web Components (e.g. <pointer-actions>).
 */
export function processShadowRoots(root: ParentNode = document, hide: boolean = false): void {
  try {
    const customElements = root.querySelectorAll('pointer-actions, pivot-tray-overlay, [part*="pointer"]');
    customElements.forEach((el) => {
      if (el.shadowRoot) {
        let shadowStyle = el.shadowRoot.getElementById(SHADOW_STYLE_ID);
        if (hide) {
          if (!shadowStyle) {
            shadowStyle = document.createElement('style');
            shadowStyle.id = SHADOW_STYLE_ID;
            shadowStyle.textContent = SHADOW_CURSOR_NONE_CSS;
            el.shadowRoot.appendChild(shadowStyle);
          }
        } else {
          if (shadowStyle && shadowStyle.parentNode) {
            shadowStyle.parentNode.removeChild(shadowStyle);
          }
        }
      }
    });
  } catch {}
}

export function isFullscreenActive(doc: Document = document, win: Window = window): boolean {
  const d = doc as any;

  // 1. Native browser Fullscreen API
  if (
    d.fullscreenElement ||
    d.webkitFullscreenElement ||
    d.mozFullScreenElement ||
    d.msFullscreenElement
  ) {
    return true;
  }

  // 2. Disney+ / Netflix / Streaming video player playback page URL check
  if (win.location && win.location.href && win.location.href.includes('/play/')) {
    return true;
  }

  // 3. Fullscreen / video player CSS classes on body or document
  if (doc.body) {
    if (
      doc.body.classList.contains('fullscreen') ||
      doc.body.classList.contains('is-fullscreen') ||
      doc.documentElement.classList.contains('fullscreen')
    ) {
      return true;
    }
  }

  // 4. Full window viewport bounds check (F11 or full window web player)
  if (win.innerWidth && win.screen && win.screen.width > 0) {
    const isWindowMax =
      win.innerWidth >= win.screen.width - 25 &&
      win.innerHeight >= win.screen.height - 25;

    if (isWindowMax && doc.body) {
      const rect = doc.body.getBoundingClientRect();
      const isBodyFull = rect.width >= win.screen.width - 30 && rect.height >= win.screen.height - 30;
      if (isBodyFull) {
        return true;
      }
    }
  }

  // 5. Video or player container bounds check (including <pointer-actions>)
  try {
    const videos = doc.querySelectorAll('video, pointer-actions, [class*="player"], [class*="video"], [id*="vdp"]');
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i] as HTMLElement;
      const rect = v.getBoundingClientRect();
      if (rect.width >= win.innerWidth - 30 && rect.height >= win.innerHeight - 30 && win.innerWidth > 300) {
        return true;
      }
    }
  } catch {}

  return false;
}

export class IdleController {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private isHidden: boolean = false;
  private settings: ExtensionSettings;
  private doc: Document;
  private win: Window;

  private lastMouseX: number = -1;
  private lastMouseY: number = -1;

  constructor(settings: ExtensionSettings, doc: Document = document, win: Window = window) {
    this.settings = settings;
    this.doc = doc;
    this.win = win;
  }

  public updateSettings(newSettings: ExtensionSettings): void {
    this.settings = newSettings;
    this.evaluateState();
  }

  public isCursorHidden(): boolean {
    return this.isHidden;
  }

  public hideCursor(): void {
    if (this.isHidden) return;

    console.log('[AutoCursorHider] 🙈 Hiding cursor NOW.');

    injectCursorStyles(this.doc);
    processShadowRoots(this.doc, true);

    let overlay = this.doc.getElementById(OVERLAY_ID);
    if (!overlay) {
      injectCursorStyles(this.doc);
      overlay = this.doc.getElementById(OVERLAY_ID);
    }
    if (overlay) {
      overlay.classList.add('active');
      overlay.style.setProperty('cursor', TRANSPARENT_CURSOR_DATA, 'important');
      overlay.style.setProperty('display', 'block', 'important');
    }

    this.reapplyCursorNone();
    this.isHidden = true;
  }

  private reapplyCursorNone(): void {
    if (this.doc.documentElement) {
      this.doc.documentElement.classList.add(HIDDEN_CLASS);
      this.doc.documentElement.style.setProperty('cursor', TRANSPARENT_CURSOR_DATA, 'important');
    }
    if (this.doc.body) {
      this.doc.body.classList.add(HIDDEN_CLASS);
      this.doc.body.style.setProperty('cursor', TRANSPARENT_CURSOR_DATA, 'important');
    }

    processShadowRoots(this.doc, true);
  }

  public showCursor(): void {
    if (!this.isHidden) return;

    console.log('[AutoCursorHider] 👁️ Showing cursor (activity detected).');

    const overlay = this.doc.getElementById(OVERLAY_ID);
    if (overlay) {
      overlay.classList.remove('active');
      overlay.style.removeProperty('display');
    }

    if (this.doc.documentElement) {
      this.doc.documentElement.classList.remove(HIDDEN_CLASS);
      this.doc.documentElement.style.removeProperty('cursor');
    }
    if (this.doc.body) {
      this.doc.body.classList.remove(HIDDEN_CLASS);
      this.doc.body.style.removeProperty('cursor');
    }

    processShadowRoots(this.doc, false);
    this.isHidden = false;
  }

  public handleUserActivity(event?: MouseEvent | Event): void {
    // Ignore synthetic events generated by scripts (e.g. Disney+ video player internal pointermove dispatchers)
    if (event && (event as any).isTrusted === false) {
      return;
    }

    if (event && (event.type === 'mousemove' || event.type === 'pointermove')) {
      const mouseEv = event as MouseEvent;
      if (mouseEv.clientX === this.lastMouseX && mouseEv.clientY === this.lastMouseY) {
        return;
      }
      this.lastMouseX = mouseEv.clientX;
      this.lastMouseY = mouseEv.clientY;
    }

    this.showCursor();
    this.restartTimer();
  }

  public evaluateState(): void {
    const hostname = this.win.location?.hostname || '';
    const referrer = this.doc.referrer || '';
    const siteMatched = isSiteEnabledForHost(hostname, this.settings, referrer);
    const fullscreen = isFullscreenActive(this.doc, this.win);

    if (!this.settings.enabled || !siteMatched || (this.settings.fullscreenOnly && !fullscreen)) {
      this.clearTimer();
      this.showCursor();
      return;
    }

    if (!this.timer && !this.isHidden) {
      this.startTimer();
    }
  }

  public restartTimer(): void {
    this.clearTimer();
    this.startTimer();
  }

  public startTimer(): void {
    if (this.timer || this.isHidden) return;

    const hostname = this.win.location?.hostname || '';
    const referrer = this.doc.referrer || '';
    const siteMatched = isSiteEnabledForHost(hostname, this.settings, referrer);
    const fullscreen = isFullscreenActive(this.doc, this.win);

    if (!this.settings.enabled || !siteMatched) return;
    if (this.settings.fullscreenOnly && !fullscreen) return;

    const delayMs = Math.max(200, (this.settings.delay || 2.0) * 1000);

    this.timer = setTimeout(() => {
      this.timer = null;
      if (this.settings.enabled && isSiteEnabledForHost(this.win.location?.hostname || '', this.settings, this.doc.referrer)) {
        if (!this.settings.fullscreenOnly || isFullscreenActive(this.doc, this.win)) {
          this.hideCursor();
        }
      }
    }, delayMs);
  }

  public clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
