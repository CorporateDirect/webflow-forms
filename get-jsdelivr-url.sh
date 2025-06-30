#!/bin/bash

# Quick jsdelivr URL Generator for webflow-forms
# Run this script after committing changes to get updated URL

echo "🔗 Current Commit Info:"
git log --oneline -1

echo ""
echo "📦 Updated jsdelivr URLs:"
echo ""
echo "🚀 Comprehensive Fix (Main):"
echo "https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@$(git log --format='%H' -1)/dist/webflow-forms-comprehensive-fix.min.js"
echo ""
echo "📋 Summary Cards (Optional):"
echo "https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@$(git log --format='%H' -1)/src/webflow-forms-comprehensive-summary.js"

echo ""
echo "📋 For Webflow, copy these script tags:"
echo ""
echo "<!-- Comprehensive Fix (Required) -->"
echo "<script src=\"https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@$(git log --format='%H' -1)/dist/webflow-forms-comprehensive-fix.min.js\"></script>"
echo ""
echo "<!-- Summary Cards (Optional) -->"
echo "<script src=\"https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@$(git log --format='%H' -1)/src/webflow-forms-comprehensive-summary.js\"></script>" 