export class EditorUtils {
  static getTinyMCEContainers(): NodeListOf<HTMLElement> {
    return document.querySelectorAll<HTMLElement>('.tox.tox-tinymce');
  }

  static resizeEditors(): void {
    const containers = this.getTinyMCEContainers();
    
    containers.forEach(container => {
      const maxHeight = Math.max(600, window.innerHeight * 0.8);
      const editAreaHeight = maxHeight - 50;
      
      container.style.minHeight = `${maxHeight}px`;
      container.style.height = `${maxHeight}px`;

      const editArea = container.querySelector<HTMLElement>('.tox-edit-area');
      if (editArea) {
        editArea.style.minHeight = `${editAreaHeight}px`;
        editArea.style.height = `${editAreaHeight}px`;
      }

      const iframe = container.querySelector<HTMLIFrameElement>('.tox-edit-area__iframe');
      if (iframe) {
        iframe.style.minHeight = `${editAreaHeight}px`;
        iframe.style.height = `${editAreaHeight}px`;
      }

      const sidebarWrap = container.querySelector<HTMLElement>('.tox-sidebar-wrap');
      if (sidebarWrap) {
        sidebarWrap.style.minHeight = `${editAreaHeight}px`;
        sidebarWrap.style.height = `${editAreaHeight}px`;
      }
    });
  }

  static resetEditors(): void {
    const containers = this.getTinyMCEContainers();
    
    containers.forEach(container => {
      container.style.minHeight = '';
      container.style.height = '';

      const editArea = container.querySelector<HTMLElement>('.tox-edit-area');
      if (editArea) {
        editArea.style.minHeight = '';
        editArea.style.height = '';
      }

      const iframe = container.querySelector<HTMLIFrameElement>('.tox-edit-area__iframe');
      if (iframe) {
        iframe.style.minHeight = '';
        iframe.style.height = '';
      }

      const sidebarWrap = container.querySelector<HTMLElement>('.tox-sidebar-wrap');
      if (sidebarWrap) {
        sidebarWrap.style.minHeight = '';
        sidebarWrap.style.height = '';
      }
    });
  }

  static observeEditorChanges(callback: () => void): MutationObserver {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const hasEditorChanges = Array.from(mutation.addedNodes)
            .concat(Array.from(mutation.removedNodes))
            .some((node) => {
              if (node.nodeType === 1) {
                const element = node as Element;
                return element.classList?.contains('tox-tinymce') || 
                       element.querySelector?.('.tox-tinymce');
              }
              return false;
            });
          
          if (hasEditorChanges) {
            setTimeout(callback, 100);
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return observer;
  }
}