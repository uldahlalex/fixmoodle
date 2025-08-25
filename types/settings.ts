export interface ExtensionSettings {
  maximizeEditor: boolean;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  maximizeEditor: false,
};

export interface MessageRequest {
  action: 'updateSettings';
  settings: ExtensionSettings;
}

export interface MessageResponse {
  success: boolean;
}