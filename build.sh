#!/bin/bash

set -e

echo "Building SFTP Extension for Zed..."

# Build the language server
echo "Building language server..."
cd server
npm install
npm run build
cd ..

# Build the Rust extension
echo "Building Rust extension..."
cargo build --release

echo "Build complete!"
echo ""
echo "To install as dev extension:"
echo "1. Open Zed"
echo "2. Open Extensions (Cmd+Shift+X)"
echo "3. Click 'Install Dev Extension'"
echo "4. Select this directory"

