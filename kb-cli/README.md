# KB-CLI: Knowledge Base Command Line Interface

A powerful, AI-assisted knowledge management system with browser integration for seamless information capture, organization, and retrieval.

## 🌟 Features

- **Smart Suggestions**: Context-aware suggestions based on your browsing and work patterns
- **Browser Integration**: Chrome extension for capturing web content and tracking browsing
- **Knowledge Graph**: Auto-organizes information into a connected knowledge base
- **Performance Optimized**: Built with efficiency in mind, even with large knowledge bases
- **Privacy Focused**: Your data stays on your machine unless you choose to sync

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Chrome or Edge browser
- Python 3.8+ (for some utilities)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/kb-cli.git
   cd kb-cli
   ```

2. Install dependencies:
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

3. Set up the Chrome extension:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `chrome-extension` directory

4. Configure your API keys:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and preferences
   ```

## 🛠 Usage

### Start the KB-CLI server
```bash
npm run start
```

### Use the Chrome Extension
1. Click the KB-CLI icon in your browser toolbar
2. Log in with your credentials
3. Start capturing and organizing knowledge

### Basic Commands
```
kb-cli search [query]     # Search your knowledge base
kb-cli add [content]     # Add new content
kb-cli sync              # Sync with remote knowledge base
kb-cli analyze           # Analyze and organize knowledge
```

## 🏗 Project Structure

```
kb-cli/
├── chrome-extension/    # Browser extension code
├── src/                 # Core CLI application
│   ├── commands/        # CLI command handlers
│   ├── lib/             # Core libraries
│   └── utils/           # Utility functions
├── docs/               # Documentation
├── tests/              # Test suite
└── scripts/            # Build and utility scripts
```

## 🤖 AI Integration

KB-CLI uses AI to:
- Generate smart suggestions
- Auto-categorize content
- Extract key information
- Provide intelligent search results

## 📊 Performance

- Indexes thousands of documents in seconds
- Real-time search with sub-second response times
- Minimal memory footprint

## 📚 Documentation

For detailed documentation, see the [docs](docs/) directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the KB-CLI team
- Inspired by modern knowledge management tools
- Powered by cutting-edge AI technologies
