import { SettingsStorage } from '~/utils/storage';
import { EditorUtils } from '~/utils/editor-utils';
import { EnhancedTinyMCE } from '~/utils/enhanced-editor';
import type { ExtensionSettings, MessageRequest, MessageResponse } from '~/types/settings';

export default defineContentScript({
  matches: [
    '*://*/*/modedit.php*',
    '*://*/*/course/edit.php*', 
    '*://*/*/admin/*edit*.php*',
    '*://*/*/mod/*/edit.php*',
    '*://*/*/question/*edit*',
    '*://*/*?*action=edit*',
    '*://*/*?*mode=edit*'
  ],
  main() {
    let currentSettings: ExtensionSettings;
    let mutationObserver: MutationObserver | null = null;
    let stylesInjected = false;

    // Inject CSS styles only when needed
    function injectStyles(): void {
      if (stylesInjected) return;
      
      const styleElement = document.createElement('style');
      styleElement.id = 'moodle-tinymce-auto-resizer-styles';
      styleElement.textContent = `
        /* Moodle TinyMCE Auto-Resizer Styles */
        
        /* Force maximum height on TinyMCE containers (fallback) */
        
        
.tox-editor-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 1002 !important;
    background-color: #f4f4f4 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
}

.tox-menubar {
    position: sticky !important;
    top: 0 !important;
    z-index: 2147483647 !important;
    background-color: #f4f4f4 !important;
    margin: 0 !important;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
    width: 100% !important;
    border-bottom: 1px solid #ddd !important;
}

/* Force TinyMCE container to be visible */
.tox.tox-tinymce {
    visibility: visible !important;
}

/* Force the entire editor header to stick to top of viewport */
.tox-editor-container .tox-editor-header {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 2147483647 !important;
    background: #f4f4f4 !important;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important;
    width: 100% !important;
}

/* Ensure menubar within header is also properly positioned */
.tox-editor-header .tox-menubar {
    position: relative !important;
    z-index: 2147483648 !important;
    background: #f4f4f4 !important;
    width: 100% !important;
}

/* Adjust editor content to account for fixed header */
.tox-edit-area {
    padding-top: 80px !important;
}

.tox-toolbar-overlord {
    position: sticky !important;
    top: 30px !important;
    z-index: 1001 !important;
    background-color: #f4f4f4 !important;
}
        .tox.tox-tinymce {
            min-height: 80vh !important;
            height: 80vh !important;
        }
        
        .tox-edit-area {
            min-height: 75vh !important;
            height: 75vh !important;
        }
        
        .tox-edit-area__iframe {
            min-height: 75vh !important;
            height: 75vh !important;
        }
        
        .tox-sidebar-wrap {
            min-height: 75vh !important;
            height: 75vh !important;
        }
        
        .tox-editor-container {
            min-height: 80vh !important;
            height: 80vh !important;
        }
        
        /* Optional: Make the resize handle more visible */
        .tox-statusbar__resize-handle {
            background-color: #f0f0f0 !important;
            border: 1px solid #ccc !important;
            border-radius: 3px !important;
        }
        
        /* Additional toolbar styling for better visibility */
        .tox-toolbar {
            position: sticky !important;
            top: 60px !important;
            z-index: 1000 !important;
            background-color: #f4f4f4 !important;
            border-bottom: 1px solid #ccc !important;
        }
        
        /* Ensure toolbar container maintains proper positioning */
        .tox-toolbar__primary {
            position: relative !important;
            z-index: 1001 !important;
        }
        
        /* Make sure the entire TinyMCE header area sticks */
        .tox-editor-header, .tox-menubar, .tox-toolbar-overlord, .tox-toolbar {
            position: -webkit-sticky !important;
            position: sticky !important;
            background: #f4f4f4 !important;
            border-bottom: 1px solid #ddd !important;
        }
        
        /* Hide RIGHT Moodle sidebars when drawer hiding is enabled */
        body.hide-drawer #block-region-side-post,
        body.hide-drawer .block-region:not(#block-region-side-pre),
        body.hide-drawer [data-region="blocks-column"]:not(.left),
        body.hide-drawer .blocks:not(.left-blocks),
        body.hide-drawer #page-sidebar:not(.left),
        body.hide-drawer .sidebar:not(.left),
        body.hide-drawer .drawer.drawer-right {
            display: none !important;
        }
        
        /* Adjust main content area to use remaining width after left drawer when drawer hiding is enabled */
        body.hide-drawer #region-main,
        body.hide-drawer .region-content,
        body.hide-drawer #page-content,
        body.hide-drawer .main-content,
        body.hide-drawer [data-region="mainpage"],
        body.hide-drawer .content-area {
            margin-right: 0 !important;
            float: none !important;
        }
        
        /* Make the page wrapper use full width when drawer hiding is enabled */
        body.hide-drawer #page,
        body.hide-drawer #page-wrapper,
        body.hide-drawer .pagelayout,
        body.hide-drawer #wrapper,
        body.hide-drawer #topofscroll {
            max-width: 100% !important;
            width: 100% !important;
            min-width: 100% !important;
        }
        
        /* Adjust main content to respect left drawer but ignore right drawer space when drawer hiding is enabled */
        body.hide-drawer .main-inner,
        body.hide-drawer #page-content,
        body.hide-drawer .content-container {
            margin-right: 0 !important;
            padding-right: 15px !important;
        }
        
        /* Make form element container use full width when drawer hiding is enabled */
        body.hide-drawer .col-md-9.d-flex.flex-wrap.align-items-start.felement {
            min-width: 100% !important;
            flex: 1 1 100% !important;
        }
        
        /* Maximize editor height and width when enabled */
        body.maximize-editor .tox.tox-tinymce {
            min-height: 80vh !important;
            height: 80vh !important;
            width: 100% !important;
            max-width: calc(100vw - 40px) !important;
        }
        
        /* When drawer hiding is enabled, ensure editor doesn't overlap with left drawer */
        body.hide-drawer.maximize-editor .tox.tox-tinymce {
            margin-left: 0 !important;
        }
        
        /* Ensure TinyMCE respects left drawer space in normal layout */
        body.hide-drawer .tox.tox-tinymce {
            margin-left: 0 !important;
        }
        
        body.maximize-editor .tox-edit-area {
            min-height: 75vh !important;
            height: 75vh !important;
        }
        
        body.maximize-editor .tox-edit-area__iframe {
            min-height: 75vh !important;
            height: 75vh !important;
        }
        
        body.maximize-editor .tox-sidebar-wrap {
            min-height: 75vh !important;
            height: 75vh !important;
        }
        
        body.maximize-editor .tox-editor-container {
            min-height: 80vh !important;
            height: 80vh !important;
        }
        
        /* Hide RIGHT drawers when drawer hiding is enabled, but allow manual showing when .show class is present */
        body.hide-drawer [data-region="drawer"].drawer-right:not(.drawercontent):not(.drag-container):not(.show),
        body.hide-drawer .drawer-right:not(.drawercontent):not(.drag-container):not(.show) {
            display: none !important;
        }
        
        /* Hide specific right drawer with max-width approach only when not manually shown */
        body.hide-drawer .drawer.drawer-right.no_toggle:not(.drawercontent):not(.drag-container) {
            max-width: 0 !important;
            overflow: hidden !important;
            width: 0 !important;
        }
        
        /* Allow manually shown RIGHT drawers to appear with proper positioning when drawer hiding is enabled */
        body.hide-drawer .drawer.drawer-right.show {
            display: block !important;
            position: fixed !important;
            z-index: 10000 !important;
        }
        
        /* Also hide any RIGHT drawer container that might be wrapping it, but preserve drawercontent */
        body.hide-drawer .drawer-container.right:not(.drawercontent):not(.drag-container),
        body.hide-drawer [data-region="drawer-container"].right:not(.drawercontent):not(.drag-container) {
            display: none !important;
        }
        
        /* Ensure important buttons remain visible even if inside hidden containers */
        body.hide-drawer .btn.icon-no-margin {
            display: block !important;
            position: relative !important;
            z-index: 9999 !important;
        }
      `;
      
      document.head.appendChild(styleElement);
      stylesInjected = true;
    }

    // Load settings and apply them
    async function loadAndApplySettings(): Promise<void> {
      try {
        currentSettings = await SettingsStorage.get();
        await applySettings();
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }

    // Apply current settings to the page
    async function applySettings(): Promise<void> {
      // Apply both drawer hiding and editor maximization when maximizeEditor is enabled
      if (currentSettings.maximizeEditor) {
        document.body.classList.add('hide-drawer');
        document.body.classList.add('maximize-editor');
        EditorUtils.resizeEditors();
      } else {
        document.body.classList.remove('hide-drawer');
        document.body.classList.remove('maximize-editor');
        EditorUtils.resetEditors();
      }

      // Handle enhanced TinyMCE
      if (currentSettings.enhancedTinyMCE) {
        if (!EnhancedTinyMCE.hasEnhancedEditors()) {
          try {
            await EnhancedTinyMCE.replaceEditors();
            console.log('Enhanced TinyMCE editors initialized');
          } catch (error) {
            console.error('Failed to initialize enhanced TinyMCE:', error);
          }
        }
      } else {
        if (EnhancedTinyMCE.hasEnhancedEditors()) {
          try {
            await EnhancedTinyMCE.restoreOriginalEditors();
            console.log('Restored original TinyMCE editors');
          } catch (error) {
            console.error('Failed to restore original TinyMCE:', error);
          }
        }
      }
    }

    // Set up editor observation
    function setupEditorObservation(): void {
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      
      mutationObserver = EditorUtils.observeEditorChanges(() => {
        if (currentSettings.maximizeEditor) {
          EditorUtils.resizeEditors();
        }
      });
    }

    // Listen for messages from popup
    browser.runtime.onMessage.addListener((
      request: MessageRequest,
      _sender: any,
      sendResponse: (response: MessageResponse) => void
    ) => {
      if (request.action === 'updateSettings') {
        currentSettings = request.settings;
        applySettings().then(() => {
          sendResponse({ success: true });
        }).catch((error) => {
          console.error('Failed to apply settings:', error);
          sendResponse({ success: false });
        });
      }
      return true; // Keep message channel open for async response
    });

    // Window resize handler
    function handleResize(): void {
      if (currentSettings.maximizeEditor) {
        setTimeout(() => EditorUtils.resizeEditors(), 100);
      }
    }

    // Check if current page is an editing page
    function isEditingPage(): boolean {
      const url = window.location.href;
      const pathname = window.location.pathname;
      
      // Check for various Moodle editing patterns
      const editingPatterns = [
        /\/modedit\.php/,           // Module editing
        /\/course\/edit\.php/,      // Course editing
        /\/admin\/.*edit.*\.php/,   // Admin editing pages
        /\/mod\/.*\/edit\.php/,     // Module-specific editing
        /\/question\/.*edit/,       // Question editing
        /[?&]action=edit/,          // Edit action parameter
        /[?&]mode=edit/             // Edit mode parameter
      ];
      
      return editingPatterns.some(pattern => pattern.test(url) || pattern.test(pathname));
    }

    // Initialize
    async function init(): Promise<void> {
      // Only proceed if this is an editing page
      if (!isEditingPage()) {
        console.log('TinyMCE Auto-Resizer: Not an editing page, skipping initialization');
        return;
      }
      
      console.log('TinyMCE Auto-Resizer: Initializing on editing page');
      injectStyles();
      await loadAndApplySettings();
      setupEditorObservation();
      window.addEventListener('resize', handleResize);

      // Fallback - run periodically for the first few seconds
      let attempts = 0;
      const maxAttempts = 10;
      const interval = setInterval(async () => {
        if (currentSettings?.maximizeEditor) {
          EditorUtils.resizeEditors();
        }
        if (currentSettings?.enhancedTinyMCE && !EnhancedTinyMCE.hasEnhancedEditors()) {
          try {
            await EnhancedTinyMCE.replaceEditors();
          } catch (error) {
            console.error('Fallback enhanced TinyMCE initialization failed:', error);
          }
        }
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 1000);
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => init().catch(console.error), 500);
      });
    } else {
      init().catch(console.error);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    });
  },
});