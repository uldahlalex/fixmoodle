export class EnhancedTinyMCE {
  private static readonly TINYMCE_CDN = 'https://cdn.jsdelivr.net/npm/tinymce@7.3.0/tinymce.min.js';
  private static isLoaded = false;
  private static originalEditors = new Map<string, any>();

  /**
   * Load TinyMCE from CDN if not already loaded
   */
  static async loadTinyMCE(): Promise<void> {
    if (this.isLoaded || (window as any).tinymce) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this.TINYMCE_CDN;
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load TinyMCE'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Find all existing TinyMCE textareas that need replacement
   */
  static findTextareas(): HTMLTextAreaElement[] {
    return Array.from(document.querySelectorAll('textarea[data-fieldtype="editor"]'));
  }

  /**
   * Replace existing TinyMCE editors with enhanced versions
   */
  static async replaceEditors(): Promise<void> {
    await this.loadTinyMCE();
    
    const textareas = this.findTextareas();
    
    for (const textarea of textareas) {
      if (textarea.id && !this.originalEditors.has(textarea.id)) {
        await this.replaceEditor(textarea);
      }
    }
  }

  /**
   * Replace a single editor with enhanced version
   */
  private static async replaceEditor(textarea: HTMLTextAreaElement): Promise<void> {
    const tinymce = (window as any).tinymce;
    if (!tinymce) return;

    // Store original content
    const originalContent = textarea.value;
    
    // Remove existing TinyMCE instance if present
    const existingEditor = tinymce.get(textarea.id);
    if (existingEditor) {
      existingEditor.remove();
    }

    // Initialize enhanced TinyMCE
    await tinymce.init({
      target: textarea,
      height: 600,
      menubar: true,
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount',
        'emoticons', 'template', 'codesample', 'accordion', 'pagebreak',
        'nonbreaking', 'importcss', 'quickbars', 'autosave', 'save'
      ],
      toolbar: [
        'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough',
        'link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography',
        'align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat | preview save fullscreen'
      ].join(' | '),
      quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
      quickbars_insert_toolbar: 'quickimage quicktable',
      toolbar_mode: 'sliding',
      contextmenu: 'link image table',
      skin: 'oxide',
      content_css: 'default',
      font_family_formats: 'Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats',
      fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
      image_advtab: true,
      link_assume_external_targets: true,
      image_caption: true,
      quickbars_selection_toolbar_mode: 'contextmenu',
      content_style: `
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          margin: 1rem;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f4f4f4;
        }
      `,
      setup: (editor: any) => {
        // Custom setup for Moodle integration
        editor.on('init', () => {
          editor.setContent(originalContent);
        });
        
        // Auto-save functionality
        editor.on('change keyup', () => {
          textarea.value = editor.getContent();
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        });
      },
      // Enhanced features
      autosave_ask_before_unload: true,
      autosave_interval: '30s',
      autosave_prefix: 'moodle-autosave-',
      autosave_restore_when_empty: false,
      autosave_retention: '2m',
      // Accessibility
      a11y_advanced_options: true,
      // Code highlighting
      codesample_languages: [
        { text: 'HTML/XML', value: 'markup' },
        { text: 'JavaScript', value: 'javascript' },
        { text: 'CSS', value: 'css' },
        { text: 'PHP', value: 'php' },
        { text: 'Python', value: 'python' },
        { text: 'Java', value: 'java' },
        { text: 'C#', value: 'csharp' },
        { text: 'C++', value: 'cpp' },
        { text: 'SQL', value: 'sql' },
        { text: 'JSON', value: 'json' }
      ],
      // Templates
      templates: [
        {
          title: 'Assignment Template',
          description: 'Template for assignments',
          content: `
            <h2>Assignment: [Title]</h2>
            <p><strong>Due Date:</strong> [Date]</p>
            <p><strong>Instructions:</strong></p>
            <ol>
              <li>Step 1</li>
              <li>Step 2</li>
              <li>Step 3</li>
            </ol>
            <p><strong>Submission Requirements:</strong></p>
            <ul>
              <li>Requirement 1</li>
              <li>Requirement 2</li>
            </ul>
          `
        },
        {
          title: 'Lesson Plan',
          description: 'Template for lesson planning',
          content: `
            <h2>Lesson: [Title]</h2>
            <p><strong>Objectives:</strong></p>
            <ul>
              <li>Learning objective 1</li>
              <li>Learning objective 2</li>
            </ul>
            <h3>Content</h3>
            <p>[Lesson content here]</p>
            <h3>Activities</h3>
            <p>[Activities and exercises]</p>
            <h3>Assessment</h3>
            <p>[How learning will be assessed]</p>
          `
        }
      ]
    });

    // Store reference to original editor
    this.originalEditors.set(textarea.id, { textarea, originalContent });
  }

  /**
   * Restore original TinyMCE editors
   */
  static async restoreOriginalEditors(): Promise<void> {
    const tinymce = (window as any).tinymce;
    if (!tinymce) return;

    for (const [editorId, data] of this.originalEditors.entries()) {
      const editor = tinymce.get(editorId);
      if (editor) {
        const currentContent = editor.getContent();
        editor.remove();
        
        // Restore textarea
        data.textarea.value = currentContent;
        data.textarea.style.display = '';
      }
    }

    this.originalEditors.clear();
    
    // Trigger Moodle's editor re-initialization if available
    if ((window as any).M && (window as any).M.core && (window as any).M.core.form) {
      try {
        (window as any).M.core.form.reinitialize();
      } catch (e) {
        console.log('Could not reinitialize Moodle forms');
      }
    }
  }

  /**
   * Check if enhanced editors are currently active
   */
  static hasEnhancedEditors(): boolean {
    return this.originalEditors.size > 0;
  }
}