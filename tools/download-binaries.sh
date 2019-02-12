#!/bin/sh

# Download the necessary binaries for a given release of https://github.com/humphd/browser-vm/releases/
# Example: `download-binaries v1.0.0`

mkdir -p dist/bin

echo "Downloading seabios.bin"
curl -L https://github.com/humphd/browser-vm/releases/download/$1/seabios.bin > dist/bin/seabios.bin

echo "Downloading vgabios.bin"
curl -L https://github.com/humphd/browser-vm/releases/download/$1/vgabios.bin > dist/bin/vgabios.bin

echo "Downloading v86-linux.iso"
curl -L https://github.com/humphd/browser-vm/releases/download/$1/v86-linux.iso > dist/bin/v86-linux.iso
