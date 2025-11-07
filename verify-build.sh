#!/bin/bash

echo "🔍 Verifying SFTP Extension Build..."
echo ""

# Check for WASM file
if [ -f "target/wasm32-wasip1/release/sftp.wasm" ]; then
    echo "✅ Rust extension (WASM): target/wasm32-wasip1/release/sftp.wasm"
    ls -lh target/wasm32-wasip1/release/sftp.wasm
else
    echo "❌ Rust extension (WASM) not found!"
    echo "   Run: cargo build --target wasm32-wasip1 --release"
    exit 1
fi

echo ""

# Check for language server
if [ -f "server/dist/index.js" ]; then
    echo "✅ Language server: server/dist/index.js"
    ls -lh server/dist/index.js
else
    echo "❌ Language server not found!"
    echo "   Run: cd server && npm install && npm run build"
    exit 1
fi

echo ""

# Check for other required files
if [ -f "extension.toml" ]; then
    echo "✅ Extension manifest: extension.toml"
else
    echo "❌ extension.toml not found!"
    exit 1
fi

echo ""
echo "✅ All required files are present!"
echo ""
echo "📦 Ready to install in Zed:"
echo "   1. Open Zed"
echo "   2. Press Cmd+Shift+X"
echo "   3. Click 'Install Dev Extension'"
echo "   4. Select this directory: $(pwd)"

