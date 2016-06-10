#!/usr/bin/env bash
#
# This file compiles Abot's assets for production. It depends on Google's
# Closure Compiler (which should be downloaded and placed in
# ~/Downloads/compiler.jar) for JS, and minify (a Go-based CLI tool) for CSS
# and SVG.

set -e

# Move assets to public/ and concat them
mkdir -p public/{js,css,images,installers}
cat assets/{vendor/,}js/*.js > public/js/main.js.tmp
cat assets/{vendor/,}css/*.css > public/css/main.css
ln -f assets/images/* public/images/
ln -f assets/installers/* public/installers/

# Compile JS
java -jar ~/Downloads/compiler.jar \
	--js public/js/main.js.tmp \
	--js_output_file public/js/main.js \
	&& rm public/js/main.js.tmp

# Compile CSS
minify public/css/main.css
