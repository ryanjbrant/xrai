# KB-CLI Chrome Extension

This Chrome extension tracks your open tabs and syncs them with your KB-CLI knowledge base.

## Features

- Tracks all open tabs across windows
- Syncs tab data with your KB-CLI
- Configurable sync intervals
- Secure API key storage
- Minimal performance impact

## Installation

1. **Load the extension in developer mode:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `chrome-extension` directory

2. **Configure the extension:**
   - Click on the KB-CLI icon in your Chrome toolbar
   - Click on "Settings"
   - Enter your KB-CLI API key and configure your preferences
   - Click "Save Settings"

## Development

### Prerequisites
- Node.js and npm
- Chrome browser

### Building

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

3. Load the extension in Chrome as described in the Installation section.

## API Integration

The extension communicates with your KB-CLI via a simple REST API. The following endpoints are used:

- `POST /api/tabs` - Sync tabs data

### Authentication
Include your API key in the `Authorization` header:
```
Authorization: Bearer YOUR_API_KEY
```

### Data Format

```json
{
  "tabs": [
    {
      "id": 123,
      "url": "https://example.com",
      "title": "Example Domain",
      "favIconUrl": "https://example.com/favicon.ico",
      "timestamp": "2023-01-01T12:00:00Z",
      "windowId": 1,
      "active": true
    }
  ]
}
```

## License

MIT
