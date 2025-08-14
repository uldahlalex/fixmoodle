// Moodle TinyMCE Auto-Resizer Content Script

let currentSettings = {
    hideDrawer: true,
    maximizeEditor: true
};

// Load settings and apply them
async function loadAndApplySettings() {
    try {
        const settings = await chrome.storage.sync.get({
            hideDrawer: true,
            maximizeEditor: true
        });
        currentSettings = settings;
        applySettings();
    } catch (error) {
        console.log('Using default settings');
        applySettings();
    }
}

// Apply current settings to the page
function applySettings() {
    // Apply drawer hiding
    if (currentSettings.hideDrawer) {
        document.body.classList.add('hide-drawer');
    } else {
        document.body.classList.remove('hide-drawer');
    }
    
    // Apply editor maximization
    if (currentSettings.maximizeEditor) {
        document.body.classList.add('maximize-editor');
        resizeEditors();
    } else {
        document.body.classList.remove('maximize-editor');
        resetEditors();
    }
}

// Resize editors with JavaScript for dynamic sizing
function resizeEditors() {
    if (!currentSettings.maximizeEditor) return;
    
    const tinyMCEContainers = document.querySelectorAll('.tox.tox-tinymce');
    
    tinyMCEContainers.forEach(container => {
        // Calculate maximum available height (80% of viewport height)
        const maxHeight = Math.max(600, window.innerHeight * 0.8);
        const editAreaHeight = maxHeight - 50; // Account for toolbar and statusbar
        
        // Set height for the entire editor to use maximum available space
        container.style.minHeight = maxHeight + 'px';
        container.style.height = maxHeight + 'px';

        // Find the edit area specifically
        const editArea = container.querySelector('.tox-edit-area');
        if (editArea) {
            editArea.style.minHeight = editAreaHeight + 'px';
            editArea.style.height = editAreaHeight + 'px';
        }

        // Find the iframe containing the actual editor content
        const iframe = container.querySelector('.tox-edit-area__iframe');
        if (iframe) {
            iframe.style.minHeight = editAreaHeight + 'px';
            iframe.style.height = editAreaHeight + 'px';
        }

        // Find the sidebar wrap that contains the main editing area
        const sidebarWrap = container.querySelector('.tox-sidebar-wrap');
        if (sidebarWrap) {
            sidebarWrap.style.minHeight = editAreaHeight + 'px';
            sidebarWrap.style.height = editAreaHeight + 'px';
        }
    });
}

// Reset editors to default size
function resetEditors() {
    const tinyMCEContainers = document.querySelectorAll('.tox.tox-tinymce');
    
    tinyMCEContainers.forEach(container => {
        // Remove inline styles
        container.style.minHeight = '';
        container.style.height = '';

        const editArea = container.querySelector('.tox-edit-area');
        if (editArea) {
            editArea.style.minHeight = '';
            editArea.style.height = '';
        }

        const iframe = container.querySelector('.tox-edit-area__iframe');
        if (iframe) {
            iframe.style.minHeight = '';
            iframe.style.height = '';
        }

        const sidebarWrap = container.querySelector('.tox-sidebar-wrap');
        if (sidebarWrap) {
            sidebarWrap.style.minHeight = '';
            sidebarWrap.style.height = '';
        }
    });
}

function observeForNewEditors() {
    // Create a MutationObserver to watch for new TinyMCE editors being added/removed
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check for added nodes
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if the added node is a TinyMCE container or contains one
                        if (node.classList && node.classList.contains('tox-tinymce')) {
                            setTimeout(resizeEditors, 100);
                        } else if (node.querySelector && node.querySelector('.tox-tinymce')) {
                            setTimeout(resizeEditors, 100);
                        }
                    }
                });
                
                // Check for removed nodes
                mutation.removedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if a TinyMCE editor was removed
                        if (node.classList && node.classList.contains('tox-tinymce')) {
                            setTimeout(resizeEditors, 100);
                        } else if (node.querySelector && node.querySelector('.tox-tinymce')) {
                            setTimeout(resizeEditors, 100);
                        }
                    }
                });
            }
        });
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateSettings') {
        currentSettings = request.settings;
        applySettings();
        sendResponse({success: true});
    }
});

// Run when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load settings and apply them
    setTimeout(loadAndApplySettings, 500);

    // Set up observer for dynamically loaded editors
    observeForNewEditors();
});

// Also run immediately in case DOMContentLoaded already fired
loadAndApplySettings();
observeForNewEditors();

// Additional fallback - run periodically for the first few seconds
let attempts = 0;
const maxAttempts = 10;
const interval = setInterval(() => {
    resizeEditors();
    attempts++;
    if (attempts >= maxAttempts) {
        clearInterval(interval);
    }
}, 1000);

// Resize editors when window is resized
window.addEventListener('resize', function() {
    setTimeout(resizeEditors, 100);
});