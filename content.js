// Moodle TinyMCE Auto-Resizer Content Script

function resizeTinyMCE() {
    // Find all TinyMCE containers
    const tinyMCEContainers = document.querySelectorAll('.tox.tox-tinymce');

    tinyMCEContainers.forEach(container => {
        // Set minimum height for the entire editor
        container.style.minHeight = '400px';

        // Find the edit area specifically
        const editArea = container.querySelector('.tox-edit-area');
        if (editArea) {
            editArea.style.minHeight = '350px';
        }

        // Find the iframe containing the actual editor content
        const iframe = container.querySelector('.tox-edit-area__iframe');
        if (iframe) {
            iframe.style.minHeight = '350px';
        }

        // Find the sidebar wrap that contains the main editing area
        const sidebarWrap = container.querySelector('.tox-sidebar-wrap');
        if (sidebarWrap) {
            sidebarWrap.style.minHeight = '350px';
            sidebarWrap.style.height = 'auto';
        }
    });
}

function observeForNewEditors() {
    // Create a MutationObserver to watch for new TinyMCE editors being added
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if the added node is a TinyMCE container or contains one
                        if (node.classList && node.classList.contains('tox-tinymce')) {
                            setTimeout(resizeTinyMCE, 100);
                        } else if (node.querySelector && node.querySelector('.tox-tinymce')) {
                            setTimeout(resizeTinyMCE, 100);
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

// Run when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initial resize
    setTimeout(resizeTinyMCE, 500);

    // Set up observer for dynamically loaded editors
    observeForNewEditors();
});

// Also run immediately in case DOMContentLoaded already fired
resizeTinyMCE();
observeForNewEditors();

// Additional fallback - run periodically for the first few seconds
let attempts = 0;
const maxAttempts = 10;
const interval = setInterval(() => {
    resizeTinyMCE();
    attempts++;
    if (attempts >= maxAttempts) {
        clearInterval(interval);
    }
}, 1000);