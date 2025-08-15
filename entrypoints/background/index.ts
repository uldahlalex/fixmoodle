export default defineBackground(() => {
  // Auto-reload extension during development
  console.log('Moodle TinyMCE Auto-Resizer background script initialized');

  // Listen for extension startup
  chrome.runtime.onStartup.addListener(() => {
    console.log('Extension started');
  });

  chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed/updated:', details.reason);
    
    // Set default settings on first install
    if (details.reason === 'install') {
      chrome.storage.sync.set({
        hideDrawer: true,
        maximizeEditor: true,
      }).catch(console.error);
    }
  });

  // Handle extension updates
  chrome.runtime.onUpdateAvailable.addListener((details) => {
    console.log('Extension update available:', details.version);
    // Optionally auto-reload the extension
    chrome.runtime.reload();
  });

  // Listen for messages from content script or popup (if needed for future features)
  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    console.log('Background received message:', message);
    // Handle any background-specific messaging here
    return false; // Don't keep the message channel open
  });
});