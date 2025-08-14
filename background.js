// Auto-reload extension during development
// This script monitors for changes and reloads the extension

const RELOAD_CHECK_INTERVAL = 1000; // Check every second
let lastModified = {};

// Get file modification times
async function getFileModificationTimes() {
  const files = ['manifest.json', 'content.js', 'styles.css'];
  const times = {};
  
  for (const file of files) {
    try {
      const response = await fetch(chrome.runtime.getURL(file));
      if (response.ok) {
        times[file] = response.headers.get('last-modified') || Date.now();
      }
    } catch (e) {
      // File might not exist or be accessible
      times[file] = Date.now();
    }
  }
  
  return times;
}

// Check if any files have been modified
async function checkForChanges() {
  try {
    const currentTimes = await getFileModificationTimes();
    
    // Initialize lastModified on first run
    if (Object.keys(lastModified).length === 0) {
      lastModified = currentTimes;
      return;
    }
    
    // Check if any file has been modified
    let hasChanges = false;
    for (const [file, time] of Object.entries(currentTimes)) {
      if (lastModified[file] !== time) {
        console.log(`Detected change in ${file}, reloading extension...`);
        hasChanges = true;
        break;
      }
    }
    
    if (hasChanges) {
      // Reload the extension
      chrome.runtime.reload();
    }
    
  } catch (error) {
    console.log('Auto-reload check failed:', error);
  }
}

// Alternative approach: use chrome.management API to detect extension updates
function setupManagementListener() {
  if (chrome.management && chrome.management.onInstalled) {
    chrome.management.onInstalled.addListener((info) => {
      if (info.id === chrome.runtime.id) {
        console.log('Extension updated, reloading...');
        chrome.runtime.reload();
      }
    });
  }
}

// Simpler approach: periodically check extension info
async function checkExtensionInfo() {
  try {
    // This will trigger a reload if the extension was updated
    const info = await chrome.management.getSelf();
    if (info.installType === 'development') {
      // Only enable auto-reload for development installations
      setTimeout(checkExtensionInfo, RELOAD_CHECK_INTERVAL);
    }
  } catch (error) {
    // Fallback method
    setTimeout(checkExtensionInfo, RELOAD_CHECK_INTERVAL * 5);
  }
}

// Initialize auto-reload functionality
console.log('Auto-reload background script initialized');

// Use the management API approach
setupManagementListener();

// Also try the periodic check method as fallback
setTimeout(checkExtensionInfo, RELOAD_CHECK_INTERVAL);

// Listen for extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
});

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);
});