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
    let periodicCheckInterval: NodeJS.Timeout | null = null;

    function injectStyles(): void {
      if (stylesInjected) return;
      
      const styleElement = document.createElement('style');
      styleElement.id = 'moodle-tinymce-auto-resizer-styles';
      styleElement.textContent = `
        .tox.tox-tinymce {
            min-height: 80vh !important;
            height: 80vh !important;
        }
        .tox-editor-container {
            overflow: clip !important;
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
        .tox-statusbar__resize-handle {
            background-color: #f0f0f0 !important;
            border: 1px solid #ccc !important;
            border-radius: 3px !important;
        }
        .tox-toolbar,
        .tox-toolbar-overlord,
        .tox-menubar {
            position: sticky !important;
            top: 0 !important;
            z-index: 1000 !important;
            background-color: #f4f4f4 !important;
            border-bottom: 1px solid #ccc !important;
        }
        .tox-toolbar__primary {
            position: relative !important;
            z-index: 1001 !important;
        }
        body.hide-drawer #block-region-side-post,
        body.hide-drawer .block-region:not(#block-region-side-pre),
        body.hide-drawer [data-region="blocks-column"]:not(.left),
        body.hide-drawer .blocks:not(.left-blocks),
        body.hide-drawer #page-sidebar:not(.left),
        body.hide-drawer .sidebar:not(.left),
        body.hide-drawer .drawer.drawer-right {
            display: none !important;
        }
        body.hide-drawer #region-main,
        body.hide-drawer .region-content,
        body.hide-drawer #page-content,
        body.hide-drawer .main-content,
        body.hide-drawer [data-region="mainpage"],
        body.hide-drawer .content-area {
            margin-right: 0 !important;
            float: none !important;
        }
        body.hide-drawer #page,
        body.hide-drawer #page-wrapper,
        body.hide-drawer .pagelayout,
        body.hide-drawer #wrapper,
        body.hide-drawer #topofscroll {
            max-width: 100% !important;
            width: 100% !important;
            min-width: 100% !important;
        }
        body.hide-drawer .main-inner,
        body.hide-drawer #page-content,
        body.hide-drawer .content-container {
            margin-right: 0 !important;
            padding-right: 15px !important;
        }
        body.hide-drawer .col-md-9.d-flex.flex-wrap.align-items-start.felement {
            min-width: 100% !important;
            flex: 1 1 100% !important;
        }
        body.maximize-editor .tox.tox-tinymce {
            min-height: 80vh !important;
            height: 80vh !important;
            width: 100% !important;
            max-width: calc(100vw - 40px) !important;
        }
        body.hide-drawer.maximize-editor .tox.tox-tinymce {
            margin-left: 0 !important;
        }
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
        body.hide-drawer [data-region="drawer"].drawer-right:not(.drawercontent):not(.drag-container):not(.show),
        body.hide-drawer .drawer-right:not(.drawercontent):not(.drag-container):not(.show) {
            display: none !important;
        }
        body.hide-drawer .drawer.drawer-right.no_toggle:not(.drawercontent):not(.drag-container) {
            max-width: 0 !important;
            overflow: hidden !important;
            width: 0 !important;
        }
        body.hide-drawer .drawer.drawer-right.show {
            display: block !important;
            position: fixed !important;
            z-index: 10000 !important;
        }
        body.hide-drawer .drawer-container.right:not(.drawercontent):not(.drag-container),
        body.hide-drawer [data-region="drawer-container"].right:not(.drawercontent):not(.drag-container) {
            display: none !important;
        }
        body.hide-drawer .btn.icon-no-margin {
            display: block !important;
            position: relative !important;
            z-index: 9999 !important;
        }
      `;
      
      document.head.appendChild(styleElement);
      stylesInjected = true;
    }

    function removeStyles(): void {
      const existingStyle = document.getElementById('moodle-tinymce-auto-resizer-styles');
      if (existingStyle) {
        existingStyle.remove();
        stylesInjected = false;
      }
    }

    async function loadAndApplySettings(): Promise<void> {
      try {
        currentSettings = await SettingsStorage.get();
        applySettings();
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }

    function applySettings(): void {
      if (currentSettings.maximizeEditor) {
        injectStyles();
        document.body.classList.add('hide-drawer');
        document.body.classList.add('maximize-editor');
        EditorUtils.resizeEditors();
        startPeriodicCheck();
      } else {
        removeStyles();
        document.body.classList.remove('hide-drawer');
        document.body.classList.remove('maximize-editor');
        EditorUtils.resetEditors();
        stopPeriodicCheck();
      }
    }

    function setupEditorObservation(): void {
      if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
      }
      
      if (currentSettings.maximizeEditor) {
        mutationObserver = EditorUtils.observeEditorChanges(() => {
          if (currentSettings.maximizeEditor) {
            EditorUtils.resizeEditors();
          }
        });
      }
    }

    function cleanupObservation(): void {
      if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
      }
    }

    browser.runtime.onMessage.addListener((
      request: MessageRequest,
      _sender: any,
      sendResponse: (response: MessageResponse) => void
    ) => {
      if (request.action === 'updateSettings') {
        currentSettings = request.settings;
        applySettings();
        setupEditorObservation();
        sendResponse({ success: true });
      }
      return true;
    });

    function handleResize(): void {
      if (currentSettings.maximizeEditor) {
        setTimeout(() => EditorUtils.resizeEditors(), 100);
      }
    }

    function isEditingPage(): boolean {
      const url = window.location.href;
      const pathname = window.location.pathname;
      
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

    function startPeriodicCheck(): void {
      if (periodicCheckInterval) {
        clearInterval(periodicCheckInterval);
      }
      
      if (currentSettings?.maximizeEditor) {
        let attempts = 0;
        const maxAttempts = 10;
        periodicCheckInterval = setInterval(() => {
          if (currentSettings?.maximizeEditor) {
            EditorUtils.resizeEditors();
          }
          attempts++;
          if (attempts >= maxAttempts) {
            clearInterval(periodicCheckInterval!);
            periodicCheckInterval = null;
          }
        }, 1000);
      }
    }

    function stopPeriodicCheck(): void {
      if (periodicCheckInterval) {
        clearInterval(periodicCheckInterval);
        periodicCheckInterval = null;
      }
    }

    function init(): void {
      if (!isEditingPage()) {
        console.log('TinyMCE Auto-Resizer: Not an editing page, skipping initialization');
        return;
      }
      
      console.log('TinyMCE Auto-Resizer: Initializing on editing page');
      loadAndApplySettings().then(() => {
        setupEditorObservation();
        startPeriodicCheck();
      });
      window.addEventListener('resize', handleResize);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(init, 500);
      });
    } else {
      init();
    }

    window.addEventListener('beforeunload', () => {
      cleanupObservation();
      stopPeriodicCheck();
      window.removeEventListener('resize', handleResize);
    });
  },
});