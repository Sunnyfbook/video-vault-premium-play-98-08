#!/bin/bash
set -e

echo "Installing dependencies..."
bun install

echo "Building project..."
bun run build

echo "Build completed successfully!"
