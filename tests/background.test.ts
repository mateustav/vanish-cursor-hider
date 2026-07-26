import { DEFAULT_SETTINGS } from '../src/types';

describe('background service worker', () => {
  let listeners: Record<string, (details: any) => Promise<void>> = {};

  beforeEach(() => {
    listeners = {};

    // Mock chrome APIs
    (global as any).chrome = {
      runtime: {
        onInstalled: {
          addListener: (fn: (details: any) => Promise<void>) => {
            listeners['onInstalled'] = fn;
          }
        }
      },
      storage: {
        sync: {
          set: jest.fn().mockResolvedValue(undefined),
          get: jest.fn().mockResolvedValue({})
        }
      }
    };

    // Import background script to register listener
    jest.isolateModules(() => {
      require('../src/background');
    });
  });

  it('should initialize default settings on install', async () => {
    expect(listeners['onInstalled']).toBeDefined();

    await listeners['onInstalled']({ reason: 'install' });

    expect(chrome.storage.sync.set).toHaveBeenCalledWith(DEFAULT_SETTINGS);
  });

  it('should merge new preset sites on extension update', async () => {
    const existingSettings = {
      enabled: true,
      fullscreenOnly: false,
      delay: 3.0,
      presetSites: [
        { id: "disneyplus", name: "Disney+", domain: "disneyplus.com", enabled: true }
      ],
      customSites: ['mycustomsite.com']
    };

    (chrome.storage.sync.get as jest.Mock).mockResolvedValue(existingSettings);

    await listeners['onInstalled']({ reason: 'update' });

    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        fullscreenOnly: false,
        delay: 3.0,
        customSites: ['mycustomsite.com']
      })
    );
  });
});
