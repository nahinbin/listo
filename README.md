# listo - Chrome Extension

A sophisticated list manager with themes, customizable styles, and auto-saving.

## Features

- Multiple themes (system/light/dark/custom)
- 20+ list styles (checkboxes, numbers, bullets, etc.)
- Emoji icons for personalization
- Auto-saving to Chrome storage
- Clean, minimal interface

## Installation

### Manual Installation
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the extension directory

## Usage

1. Click the extension icon in Chrome toolbar
2. Start typing to add content to lists
3. Click "+" to add new lists
4. Click settings icon to customize themes and styles
5. All changes auto-save

## Development

### Project Structure
```
listo/
├── manifest.json      # Extension configuration
├── popup.html        # Main interface
├── popup.css         # Popup styling
├── popup.js          # Popup logic
├── settings.html     # Settings interface
├── settings.css      # Settings styling
├── settings.js       # Settings logic
├── lists.js          # Core list management
├── styles.css        # Global styles
└── icons/            # Extension icons
```

### Building from Source
1. Clone the repository
2. Make your changes
3. Test locally using Chrome's developer mode
4. Package the extension:
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Pack extension"
   - Select the extension directory

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Privacy

- Stores data locally in Chrome storage
- No data collection or external servers
- Only requires 'storage' permission

## Author

Made by [@nahin](https://nahin.space)

**Version**: 1.0.0 