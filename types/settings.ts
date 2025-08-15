export interface ExtensionSettings {
  hideDrawer: boolean;
  maximizeEditor: boolean;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  hideDrawer: true,
  maximizeEditor: true,
};

export interface MessageRequest {
  action: 'updateSettings';
  settings: ExtensionSettings;
}

export interface MessageResponse {
  success: boolean;
}