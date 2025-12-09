#!/bin/bash
mkdir -p src/assets/fonts
cd src/assets/fonts

# Download from a reliable source
wget -q https://github.com/google/fonts/raw/main/apache/opensans/static/OpenSans-Regular.ttf -O OpenSans-Regular.ttf
wget -q https://github.com/google/fonts/raw/main/apache/opensans/static/OpenSans-Bold.ttf -O OpenSans-Bold.ttf

# Verify they're TTF files
file *.ttf
