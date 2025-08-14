// Popup script for Moodle Editor Controls
document.addEventListener('DOMContentLoaded', async function() {
    const hideDrawerToggle = document.getElementById('hideDrawer');
    const maximizeEditorToggle = document.getElementById('maximizeEditor');
    const status = document.getElementById('status');
    
    // Load saved settings
    try {
        const settings = await chrome.storage.sync.get({
            hideDrawer: true,  // Default to enabled
            maximizeEditor: true  // Default to enabled
        });
        
        hideDrawerToggle.checked = settings.hideDrawer;
        maximizeEditorToggle.checked = settings.maximizeEditor;
        
        updateStatus();
        
    } catch (error) {
        console.error('Failed to load settings:', error);
        status.textContent = 'Error loading settings';
    }
    
    // Add event listeners for toggles
    hideDrawerToggle.addEventListener('change', async function() {
        try {
            await chrome.storage.sync.set({ hideDrawer: hideDrawerToggle.checked });
            await notifyContentScript();
            updateStatus();
        } catch (error) {
            console.error('Failed to save hideDrawer setting:', error);
        }
    });
    
    maximizeEditorToggle.addEventListener('change', async function() {
        try {
            await chrome.storage.sync.set({ maximizeEditor: maximizeEditorToggle.checked });
            await notifyContentScript();
            updateStatus();
        } catch (error) {
            console.error('Failed to save maximizeEditor setting:', error);
        }
    });
    
    // Update status text
    function updateStatus() {
        let statusText = '';
        if (hideDrawerToggle.checked && maximizeEditorToggle.checked) {
            statusText = 'Full enhancement active';
        } else if (hideDrawerToggle.checked) {
            statusText = 'Drawer hiding active';
        } else if (maximizeEditorToggle.checked) {
            statusText = 'Editor maximized';
        } else {
            statusText = 'All features disabled';
        }
        status.textContent = statusText;
    }
    
    // Notify content script of setting changes
    async function notifyContentScript() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'updateSettings',
                    settings: {
                        hideDrawer: hideDrawerToggle.checked,
                        maximizeEditor: maximizeEditorToggle.checked
                    }
                });
            }
        } catch (error) {
            // Tab might not have content script loaded, that's okay
            console.log('Content script not available on this tab');
        }
    }
});