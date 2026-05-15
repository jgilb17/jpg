#!/bin/bash
cd "$(dirname "$0")"
node --env-file=.env listListings.js
echo ""
echo "Press any key to close..."
read -n 1
