import { defineConfig } from 'wxt';

export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    name: 'Moodle TinyMCE Auto-Resizer',
    description: 'Automatically makes TinyMCE editors larger on Moodle sites with customizable controls',
    version: '1.0.0',
    permissions: ['storage'],
  },
  runner: {
    disabled: false,
    chromiumArgs: [
      '--disable-extensions-except={{extension}}',
      '--load-extension={{extension}}'
    ]
  }
});