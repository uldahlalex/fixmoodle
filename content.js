// Moodle TinyMCE Auto-Resizer Content Script

function resizeTinyMCE() {
    // Find all TinyMCE containers
    const tinyMCEContainers = document.querySelectorAll('.tox.tox-tinymce');

    // Toggle fullwidth mode based on whether editors are present
    if (tinyMCEContainers.length > 0) {
        document.body.classList.add('editor-fullwidth');
    } else {
        document.body.classList.remove('editor-fullwidth');
    }

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
                            setTimeout(resizeTinyMCE, 100);
                        } else if (node.querySelector && node.querySelector('.tox-tinymce')) {
                            setTimeout(resizeTinyMCE, 100);
                        }
                    }
                });
                
                // Check for removed nodes to potentially restore sidebars
                mutation.removedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if a TinyMCE editor was removed
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

// Resize editors when window is resized
window.addEventListener('resize', function() {
    setTimeout(resizeTinyMCE, 100);
});