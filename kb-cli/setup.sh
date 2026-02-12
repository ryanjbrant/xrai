#!/bin/bash
# KB CLI Setup Script - Agentic Knowledge Base CLI
# Mirrors Claude Code's rapid setup with local models

set -e

echo "🚀 KB CLI Setup - Agentic Knowledge Base"
echo "========================================"

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Darwin*)     OS="macOS" ;;
    Linux*)      OS="Linux" ;;
    *)           OS="Unknown" ;;
esac
echo "📍 Detected OS: $OS"

# Check and install Ollama
if ! command -v ollama &> /dev/null; then
    echo "📦 Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
else
    echo "✅ Ollama already installed"
fi

# Start Ollama service
echo "🔄 Starting Ollama service..."
if [ "$OS" = "macOS" ]; then
    ollama serve > /dev/null 2>&1 &
else
    ollama serve > /dev/null 2>&1 &
fi
sleep 3

# Pull optimal models
echo "📥 Pulling models..."
echo "  - qwen2.5:7b-instruct (fast reasoning)"
ollama pull qwen2.5:7b-instruct 2>/dev/null || echo "    ⚠️ Model may already exist"

echo "  - qwen2.5-vl:7b (multimodal vision)"
ollama pull qwen2.5-vl:7b 2>/dev/null || echo "    ⚠️ Model may already exist"

# Python dependencies
echo "🐍 Installing Python dependencies..."
pip3 install -r requirements.txt 2>/dev/null || pip install -r requirements.txt

# Create config directories
echo "📁 Setting up config..."
mkdir -p ~/.config/kb-cli
mkdir -p ~/.local/share/kb-cli/{sessions,logs}

# Copy or create default config
if [ ! -f ~/.config/kb-cli/config.json ]; then
    cat > ~/.config/kb-cli/config.json << 'EOF'
{
  "version": "1.0.0",
  "model": {
    "provider": "ollama",
    "name": "qwen2.5:7b-instruct",
    "multimodal": "qwen2.5-vl:7b",
    "api_url": "http://localhost:11434"
  },
  "kb_path": "~/KnowledgeBase",
  "project_kb": ".kb",
  "execution": {
    "max_parallel": 4,
    "timeout": 30
  },
  "skills_path": [".kb/skills", "kb-cli/skills"],
  "logging": {
    "level": "INFO",
    "transcript": true
  }
}
EOF
    echo "  ✅ Default config created"
fi

# Create symlink for global command
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ ! -L /usr/local/bin/kb ]; then
    echo "🔗 Creating global command 'kb'..."
    sudo ln -sf "$SCRIPT_DIR/kb" /usr/local/bin/kb 2>/dev/null || \
    ln -sf "$SCRIPT_DIR/kb" /usr/local/bin/kb 2>/dev/null || \
    echo "  ⚠️ Could not create symlink - use: $SCRIPT_DIR/kb"
else
    echo "✅ Global 'kb' command already exists"
fi

# KB path setup
KB_PATH="$HOME/KnowledgeBase"
if [ ! -d "$KB_PATH" ]; then
    echo "📚 Creating Knowledge Base at $KB_PATH"
    mkdir -p "$KB_PATH"
    echo "# Knowledge Base" > "$KB_PATH/README.md"
    echo "Created by KB CLI on $(date)" >> "$KB_PATH/README.md"
fi

# Link project .kb if exists
if [ -d ".kb" ]; then
    echo "🔗 Linking project .kb config..."
    ln -sf "$(pwd)/.kb/skills" "$(pwd)/kb-cli/skills" 2>/dev/null || true
fi

# Create MCP config template
if [ ! -f ~/.config/kb-cli/mcp_servers.json ]; then
    cat > ~/.config/kb-cli/mcp_servers.json << 'EOF'
{
  "mcp_servers": {
    "unity": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-unity"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-github"],
      "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": ""}
    }
  }
}
EOF
fi

# Test installation
echo "🧪 Testing installation..."
cd "$SCRIPT_DIR"
if python3 kb --version > /dev/null 2>&1; then
    echo "✅ KB CLI installed successfully!"
elif python kb --version > /dev/null 2>&1; then
    echo "✅ KB CLI installed successfully!"
else
    echo "⚠️ Installation test failed - may need manual path setup"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Usage:"
echo "  kb -i                       # Interactive mode"
echo "  kb 'search vfx patterns'    # Search KB"
echo "  kb 'read file.md'           # Read file"
echo "  kb 'grep pattern'           # grep"
echo "  kb skills                   # List skills"
echo "  kb tools                    # List tools"
echo ""
echo "Configuration:"
echo "  KB Path:      $KB_PATH"
echo "  Config:       ~/.config/kb-cli/config.json"
echo "  MCP Servers:  ~/.config/kb-cli/mcp_servers.json"
echo "  Models:       qwen2.5:7b-instruct, qwen2.5-vl:7b"
echo ""
echo "Project Config:"
echo "  .kb/              # Project-level config"
echo "  .kb/skills/       # Project-specific skills"
echo ""
echo "Start with: kb -i"
