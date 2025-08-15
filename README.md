# Moodle TinyMCE Auto-Resizer

A modern TypeScript Chrome extension that automatically makes TinyMCE editors larger on Moodle sites with customizable controls.

## Features

- **🎛️ Toggle Controls**: Hide right drawer and maximize editor independently
- **📏 Smart Sizing**: Uses 80% of viewport height with responsive design
- **🔄 Auto-Detection**: Automatically detects and resizes dynamically loaded editors
- **💾 Persistent Settings**: Your preferences are saved across browser sessions
- **🎯 Selective Hiding**: Preserves important drawers while hiding interference

## Development

This extension is built with [WXT](https://wxt.dev/) for modern TypeScript development.

### Setup

```bash
# Install dependencies
npm install

# Start development mode with hot reload
npm run dev

# Build for production
npm run build

# Build for Firefox
npm run build:firefox

# Create distributable zip
npm run zip
```

### Project Structure

```
├── entrypoints/
│   ├── background/     # Background script
│   ├── content/        # Content script with CSS injection
│   └── popup/          # Extension popup UI
├── assets/             # Static assets (CSS, images)
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── wxt.config.ts       # WXT configuration
```

### Key Technologies

- **WXT**: Modern web extension framework
- **TypeScript**: Full type safety
- **Chrome Extension APIs**: Storage, messaging, content scripts
- **CSS**: Advanced selectors for Moodle DOM manipulation

## Installation

1. Run `npm run build` to create the extension
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `.output/chrome-mv3` folder

## Usage

1. Navigate to any Moodle page with TinyMCE editors
2. Click the extension icon in the toolbar
3. Toggle "Hide Right Drawer" to hide sidebars for more width
4. Toggle "Maximize Editor" to make editors use 80% of screen height
5. Settings auto-save and apply immediately

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Test thoroughly on different Moodle instances
5. Submit a pull request

## License

MIT License - see LICENSE file for details.