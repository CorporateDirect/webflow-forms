#!/bin/bash

# Quick jsdelivr URL Generator for webflow-forms
# Run this script after committing changes to get updated URL

echo "🔗 Current Commit Info:"
git log --oneline -1

echo ""
echo "📦 Updated jsdelivr URLs:"
echo "Complete (with Branching Radio): https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@$(git log --format='%H' -1)/dist/webflow-forms-complete.min.js"
echo "Basic: https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@$(git log --format='%H' -1)/dist/webflow-forms.min.js"
echo "Tryformly Compatible: https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@$(git log --format='%H' -1)/dist/tryformly-compatible.min.js"

echo ""
echo "📋 For Webflow, copy this script tag:"
echo "<!-- Webflow Forms Complete with Branching Radio Validation -->"
echo "<script src=\"https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@$(git log --format='%H' -1)/dist/webflow-forms-complete.min.js\"></script>"

echo ""
echo "🎯 Features included in webflow-forms-complete.min.js:"
echo "  ✅ Multi-step form management"
echo "  ✅ Field enhancements & validation"
echo "  ✅ Branching radio button validation"
echo "  ✅ Button state management"
echo "  ✅ Error message handling"
echo "  ✅ Accessibility features" 