#!/bin/bash

# Quick jsdelivr URL Generator for webflow-forms
# Run this script after committing changes to get updated URL

echo "🔗 Current Commit Info:"
git log --oneline -1

echo ""
echo "📦 Updated jsdelivr URL:"
echo "https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@$(git log --format='%H' -1)/dist/webflow-forms-complete.js"

echo ""
echo "📋 For Webflow, copy this script tag:"
echo "<script src=\"https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@$(git log --format='%H' -1)/dist/webflow-forms-complete.js\"></script>" 