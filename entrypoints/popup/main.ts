import { SettingsStorage } from '~/utils/storage';
import type { ExtensionSettings, MessageRequest } from '~/types/settings';

class PopupController {
  private maximizeEditorToggle: HTMLInputElement;
  private statusElement: HTMLElement;

  constructor() {
    this.maximizeEditorToggle = document.getElementById('maximizeEditor') as HTMLInputElement;
    this.statusElement = document.getElementById('status') as HTMLElement;

    if (!this.maximizeEditorToggle || !this.statusElement) {
      throw new Error('Required DOM elements not found');
    }

    this.init();
  }

  private async init(): Promise<void> {
    try {
      await this.loadSettings();
      this.setupEventListeners();
      this.updateStatus();
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      this.statusElement.textContent = 'Error loading settings';
    }
  }

  private async loadSettings(): Promise<void> {
    const settings = await SettingsStorage.get();
    this.maximizeEditorToggle.checked = settings.maximizeEditor;
  }

  private setupEventListeners(): void {
    this.maximizeEditorToggle.addEventListener('change', () => {
      this.handleSettingChange('maximizeEditor', this.maximizeEditorToggle.checked);
    });
  }

  private async handleSettingChange(key: keyof ExtensionSettings, value: boolean): Promise<void> {
    try {
      const updates = { [key]: value };
      await SettingsStorage.set(updates);
      await this.notifyContentScript();
      this.updateStatus();
    } catch (error) {
      console.error(`Failed to save ${String(key)} setting:`, error);
    }
  }

  private updateStatus(): void {
    let statusText = '';
    if (this.maximizeEditorToggle.checked) {
      statusText = 'Editor maximized';
    } else {
      statusText = 'Editor enhancement disabled';
    }
    this.statusElement.textContent = statusText;
  }

  private async notifyContentScript(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        const settings = await SettingsStorage.get();
        const message: MessageRequest = {
          action: 'updateSettings',
          settings,
        };
        
        await chrome.tabs.sendMessage(tab.id, message);
      }
    } catch (error) {
      console.log('Content script not available on this tab');
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});