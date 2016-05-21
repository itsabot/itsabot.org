#!/usr/bin/env bash

set -e

inotifywait -m -r -e modify,attrib,close_write,move,create,delete assets | 
	while read file; do
		cat assets/{vendor/,}js/*.js > public/js/main.js
		cat assets/{vendor/,}css/*.css > public/css/main.css
		ln assets/images/* public/images/
	done
