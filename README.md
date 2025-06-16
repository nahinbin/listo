# Simple Lists Chrome Extension

A clean, minimal list manager for quick notes and tasks. Features a dark theme, auto-saving, and easy list management.

## Features

- Dark theme for comfortable viewing
- Auto-saving of all lists
- Add and delete lists easily
- Clean, minimal interface
- Quick access from Chrome toolbar
- Syncs across devices (when signed into Chrome)

## Installation

### From Chrome Web Store
1. Visit the Chrome Web Store
2. Search for "Simple Lists"
3. Click "Add to Chrome"
4. Confirm the installation

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the extension directory

## Usage

1. Click the extension icon in your Chrome toolbar to open the popup
2. Start typing in any list to add content
3. Click the "+" button to add a new list
4. Hover over a list and click the "-" button to delete it
5. All changes are automatically saved

## Development

### Project Structure
```
simple-lists/
├── manifest.json    # Extension configuration
├── popup.html      # Main popup interface
├── styles.css      # Styling
├── popup.js        # Extension logic
└── icons/          # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
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
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Privacy

This extension:
- Stores all data locally in Chrome's storage
- Does not collect any user data
- Does not send data to any external servers
- Requires only the 'storage' permission for saving lists

## Support

For support, please:
1. Check the [GitHub Issues](https://github.com/yourusername/simple-lists/issues)
2. Create a new issue if your problem isn't already listed
3. Include as much detail as possible about your problem 