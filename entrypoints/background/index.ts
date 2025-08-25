export default defineBackground(() => {
  console.log('Moodle TinyMCE Auto-Resizer background script initialized');

  chrome.runtime.onStartup.addListener(() => {
    console.log('Extension started');
  });

  chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed/updated:', details.reason);
    
    if (details.reason === 'install') {
      chrome.storage.sync.set({
        maximizeEditor: true,
      }).catch(console.error);
    }
  });

  chrome.runtime.onUpdateAvailable.addListener((details) => {
    console.log('Extension update available:', details.version);
    chrome.runtime.reload();
  });

  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    console.log('Background received message:', message);
    return false;
  });
});