# Moodle TinyMCE Auto-Resizer

A modern TypeScript browser extension that automatically makes TinyMCE editors larger on Moodle sites with customizable controls. **Only activates on editing pages** - won't interfere with your dashboard or other Moodle pages.

[![GitHub release](https://img.shields.io/github/release/uldahlalex/fixmoodle.svg)](https://github.com/uldahlalex/fixmoodle/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Install (Recommended)

### Download from GitHub Releases

1. **Go to [Releases](https://github.com/uldahlalex/fixmoodle/releases)**
2. **Download the latest version:**
   - For Chrome/Edge: `moodle-tinymce-auto-resizer-X.X.X-chrome.zip`
   - For Firefox: `moodle-tinymce-auto-resizer-X.X.X-firefox.zip`
3. **Extract the zip file** to a folder on your computer
4. **Install in your browser:**

#### Chrome/Edge Installation
1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the **extracted folder**

#### Firefox Installation
1. Open `about:debugging`
2. Click **"This Firefox"**
3. Click **"Load Temporary Add-on"**
4. Select the **manifest.json** file from the extracted folder

## ✨ Features

- **📍 Smart Activation**: Only runs on Moodle editing pages (won't affect dashboard)
- **🎛️ Toggle Controls**: Hide drawer/sidebar and maximize editor independently  
- **📏 Smart Sizing**: Uses 80% of viewport height with responsive design
- **🔄 Auto-Detection**: Automatically detects and resizes dynamically loaded editors
- **💾 Persistent Settings**: Your preferences are saved across browser sessions
- **🎯 Selective Hiding**: Preserves important drawers while hiding interference
- **🌐 Cross-Browser**: Works on Chrome, Edge, and Firefox

## 📖 Usage

1. **Navigate to a Moodle editing page** (e.g., when editing course content, assignments, etc.)
2. **Click the extension icon** in your browser toolbar
3. **Configure your preferences:**
   - 🚫 **"Hide Drawer"**: Removes the sidebar for more horizontal space
   - ⬆️ **"Maximize Editor"**: Expands TinyMCE editors to 80% of screen height
4. **Settings auto-save** and apply immediately to the current page
5. **Settings persist** across all Moodle editing sessions

### Supported Moodle Pages
The extension only activates on editing pages such as:
- Module editing (`/modedit.php`)
- Course editing (`/course/edit.php`)
- Admin editing pages (`/admin/*edit*.php`)
- Question editing (`/question/*edit*`)
- Pages with `?action=edit` or `?mode=edit`

**Your dashboard and other non-editing pages remain unaffected.**

## 🛠️ Development

This extension is built with [WXT](https://wxt.dev/) for modern TypeScript development.

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/uldahlalex/fixmoodle.git
cd fixmoodle

# Install dependencies
npm install

# Start development mode with hot reload
npm run dev

# Build for production
npm run build

# Build for Firefox
npm run build:firefox

# Type check without building
npm run compile

# Create distributable zip files
npm run zip

# Deploy to GitHub releases (requires gh CLI)
npm run deploy
```

### Project Structure

```
├── entrypoints/
│   ├── background/index.ts    # Background script
│   ├── content/index.ts       # Content script with URL validation
│   └── popup/                 # Extension popup UI
│       ├── index.html
│       ├── main.ts
│       └── style.css
├── utils/
│   ├── editor-utils.ts        # TinyMCE manipulation utilities
│   └── storage.ts             # Chrome storage wrapper
├── types/
│   └── settings.ts            # TypeScript type definitions
├── scripts/
│   └── deploy.js              # GitHub release automation
├── wxt.config.ts              # WXT configuration
└── .output/                   # Built extension files
    ├── chrome-mv3/            # Chrome/Edge build
    └── firefox-mv2/           # Firefox build
```

### Key Technologies

- **[WXT](https://wxt.dev/)**: Modern web extension framework
- **TypeScript**: Full type safety and modern JavaScript features
- **Chrome Extension APIs**: Storage, messaging, content scripts
- **CSS**: Advanced selectors for precise Moodle DOM manipulation
- **GitHub Actions Ready**: Automated deployment script included

### Development Tips

1. **Use `npm run dev`** for hot reload during development
2. **Test on multiple Moodle versions** - different themes may need CSS adjustments
3. **Check both Chrome and Firefox builds** before releasing
4. **Validate URL patterns** in `entrypoints/content/index.ts` for new Moodle setups

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** with proper TypeScript types
4. **Test thoroughly** on different Moodle instances and browsers
5. **Run type checking**: `npm run compile`
6. **Build both versions**: `npm run build && npm run build:firefox`
7. **Commit with descriptive messages**
8. **Submit a pull request**

### Reporting Issues

- Use the [GitHub Issues](https://github.com/uldahlalex/fixmoodle/issues) page
- Include your browser version and Moodle version
- Provide steps to reproduce the issue
- Screenshots are helpful for UI-related issues

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [WXT](https://wxt.dev/) framework
- Inspired by the need for better Moodle editing experiences
- Thanks to all contributors and users providing feedback