import { SettingsStorage } from '~/utils/storage';
import { EditorUtils } from '~/utils/editor-utils';
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
        
        /* Sticky toolbar to prevent it from going out of view when scrolling */
        .tox-toolbar,
        .tox-toolbar-overlord,
        .tox-menubar {
            position: sticky !important;
            top: 0 !important;
            z-index: 1000 !important;
            background-color: #f4f4f4 !important;
            border-bottom: 1px solid #ccc !important;
        }
        
        /* Ensure toolbar container maintains proper positioning */
        .tox-toolbar__primary {
            position: relative !important;
            z-index: 1001 !important;
        }
        
        /* Hide Moodle sidebars when drawer hiding is enabled */
        body.hide-drawer #block-region-side-pre,
        body.hide-drawer #block-region-side-post,
        body.hide-drawer .block-region,
        body.hide-drawer [data-region="blocks-column"],
        body.hide-drawer .blocks,
        body.hide-drawer #page-sidebar,
        body.hide-drawer .sidebar,
        body.hide-drawer .drawer {
            display: none !important;
        }
        
        /* Expand main content area to use full width when drawer hiding is enabled */
        body.hide-drawer #region-main,
        body.hide-drawer .region-content,
        body.hide-drawer #page-content,
        body.hide-drawer .main-content,
        body.hide-drawer [data-region="mainpage"],
        body.hide-drawer .content-area {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
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
        
        /* Force main content to ignore drawer space and use full width when drawer hiding is enabled */
        body.hide-drawer .main-inner,
        body.hide-drawer #page-content,
        body.hide-drawer .content-container {
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding-left: 15px !important;
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
        
        /* Hide drawers when drawer hiding is enabled, but allow manual showing when .show class is present */
        body.hide-drawer [data-region="drawer"]:not(.drawercontent):not(.drag-container):not(.show),
        body.hide-drawer .drawer-left:not(.drawercontent):not(.drag-container):not(.show),
        body.hide-drawer .drawer-right:not(.drawercontent):not(.drag-container):not(.show),
        body.hide-drawer .drawer-primary:not(.drawercontent):not(.drag-container):not(.show) {
            display: none !important;
        }
        
        /* Hide specific right drawer with max-width approach only when not manually shown */
        body.hide-drawer .drawer.drawer-right.no_toggle:not(.drawercontent):not(.drag-container) {
            max-width: 0 !important;
            overflow: hidden !important;
            width: 0 !important;
        }
        
        /* Allow manually shown drawers to appear with proper positioning when drawer hiding is enabled */
        body.hide-drawer .drawer.show {
            display: block !important;
            position: fixed !important;
            z-index: 10000 !important;
        }
        
        /* Also hide any drawer container that might be wrapping it, but preserve drawercontent */
        body.hide-drawer .drawer-container:not(.drawercontent):not(.drag-container),
        body.hide-drawer [data-region="drawer-container"]:not(.drawercontent):not(.drag-container) {
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
        applySettings();
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }

    // Apply current settings to the page
    function applySettings(): void {
      // Apply drawer hiding
      if (currentSettings.hideDrawer) {
        document.body.classList.add('hide-drawer');
      } else {
        document.body.classList.remove('hide-drawer');
      }
      
      // Apply editor maximization
      if (currentSettings.maximizeEditor) {
        document.body.classList.add('maximize-editor');
        EditorUtils.resizeEditors();
      } else {
        document.body.classList.remove('maximize-editor');
        EditorUtils.resetEditors();
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
        applySettings();
        sendResponse({ success: true });
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
    function init(): void {
      // Only proceed if this is an editing page
      if (!isEditingPage()) {
        console.log('TinyMCE Auto-Resizer: Not an editing page, skipping initialization');
        return;
      }
      
      console.log('TinyMCE Auto-Resizer: Initializing on editing page');
      injectStyles();
      loadAndApplySettings();
      setupEditorObservation();
      window.addEventListener('resize', handleResize);

      // Fallback - run periodically for the first few seconds
      let attempts = 0;
      const maxAttempts = 10;
      const interval = setInterval(() => {
        if (currentSettings?.maximizeEditor) {
          EditorUtils.resizeEditors();
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
        setTimeout(init, 500);
      });
    } else {
      init();
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