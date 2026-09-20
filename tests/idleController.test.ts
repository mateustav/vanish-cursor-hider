import {
  IdleController,
  injectCursorStyles,
  isFullscreenActive,
  HIDDEN_CLASS,
  STYLE_ID
} from '../src/idleController';
import { DEFAULT_SETTINGS, ExtensionSettings } from '../src/types';

describe('idleController', () => {
  let mockDoc: Document;
  let mockWin: Window;
  let settings: ExtensionSettings;

  beforeEach(() => {
    jest.useFakeTimers();
    mockDoc = document.implementation.createHTMLDocument('Test Document');

    mockWin = {
      location: { hostname: 'disneyplus.com' } as any,
      innerWidth: 1920,
      innerHeight: 1080,
      screen: { width: 1920, height: 1080 } as any,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    } as unknown as Window;

    settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('injectCursorStyles', () => {
    it('should inject style element into document head', () => {
      injectCursorStyles(mockDoc);
      const styleEl = mockDoc.getElementById(STYLE_ID);
      expect(styleEl).not.toBeNull();
      expect(styleEl?.textContent).toContain('cursor: none !important');
    });

    it('should not inject duplicate style elements', () => {
      injectCursorStyles(mockDoc);
      injectCursorStyles(mockDoc);
      const styles = mockDoc.querySelectorAll(`#${STYLE_ID}`);
      expect(styles.length).toBe(1);
    });
  });

  describe('isFullscreenActive', () => {
    it('should return true when document.fullscreenElement is defined', () => {
      Object.defineProperty(mockDoc, 'fullscreenElement', {
        value: mockDoc.createElement('div'),
        configurable: true
      });
      expect(isFullscreenActive(mockDoc, mockWin)).toBe(true);
    });

    it('should return false when not in fullscreen', () => {
      Object.defineProperty(mockDoc, 'fullscreenElement', {
        value: null,
        configurable: true
      });
      expect(isFullscreenActive(mockDoc, mockWin)).toBe(false);
    });
  });

  describe('IdleController', () => {
    let controller: IdleController;

    beforeEach(() => {
      Object.defineProperty(mockDoc, 'fullscreenElement', {
        value: mockDoc.createElement('div'),
        configurable: true
      });
      controller = new IdleController(settings, mockDoc, mockWin);
    });

    it('should hide cursor after delay when conditions are met', () => {
      controller.evaluateState();
      expect(controller.isCursorHidden()).toBe(false);

      jest.advanceTimersByTime(2000);

      expect(controller.isCursorHidden()).toBe(true);
      expect(mockDoc.documentElement.classList.contains(HIDDEN_CLASS)).toBe(true);
    });

    it('should reveal cursor immediately on user activity', () => {
      controller.evaluateState();
      jest.advanceTimersByTime(2000);
      expect(controller.isCursorHidden()).toBe(true);

      controller.handleUserActivity();
      expect(controller.isCursorHidden()).toBe(false);
      expect(mockDoc.documentElement.classList.contains(HIDDEN_CLASS)).toBe(false);
    });

    it('should not hide cursor if extension is globally disabled', () => {
      settings.enabled = false;
      controller.updateSettings(settings);
      controller.evaluateState();

      jest.advanceTimersByTime(5000);
      expect(controller.isCursorHidden()).toBe(false);
    });

    it('should not hide cursor if fullscreen is required but document is not fullscreen', () => {
      Object.defineProperty(mockDoc, 'fullscreenElement', {
        value: null,
        configurable: true
      });
      settings.fullscreenOnly = true;

      controller.updateSettings(settings);
      controller.evaluateState();

      jest.advanceTimersByTime(5000);
      expect(controller.isCursorHidden()).toBe(false);
    });

    it('should hide cursor if fullscreenOnly is false even when not in fullscreen', () => {
      Object.defineProperty(mockDoc, 'fullscreenElement', {
        value: null,
        configurable: true
      });
      settings.fullscreenOnly = false;

      controller.updateSettings(settings);
      controller.evaluateState();

      jest.advanceTimersByTime(2000);
      expect(controller.isCursorHidden()).toBe(true);
    });
  });
});
