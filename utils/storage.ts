import type { ExtensionSettings } from '~/types/settings';
import { DEFAULT_SETTINGS } from '~/types/settings';

export class SettingsStorage {
  static async get(): Promise<ExtensionSettings> {
    try {
      const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
      return {
        maximizeEditor: settings.maximizeEditor ?? DEFAULT_SETTINGS.maximizeEditor,
      };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  static async set(settings: Partial<ExtensionSettings>): Promise<void> {
    try {
      await chrome.storage.sync.set(settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  static async update(updates: Partial<ExtensionSettings>): Promise<ExtensionSettings> {
    const current = await this.get();
    const newSettings = { ...current, ...updates };
    await this.set(newSettings);
    return newSettings;
  }
}