export interface ExtensionSettings {
  maximizeEditor: boolean;
  enhancedTinyMCE: boolean;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  maximizeEditor: false,
  enhancedTinyMCE: false,
};

export interface MessageRequest {
  action: 'updateSettings';
  settings: ExtensionSettings;
}

export interface MessageResponse {
  success: boolean;
}