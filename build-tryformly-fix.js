const fs = require('fs');

// Read the source files
const webflowForms = fs.readFileSync('src/webflow-forms.js', 'utf8');
const tryformlyCompatible = fs.readFileSync('src/tryformly-compatible.js', 'utf8');

// Combine into complete bundle
const complete = `// Webflow Forms Complete - Field Enhancements + Multi-Step Forms
// Includes: Character counters, auto-resize, conditional fields, country codes, phone formatting, Google Places, multi-step forms with tryformly.com compatibility

${webflowForms}

${tryformlyCompatible}

// Initialize both systems
document.addEventListener('DOMContentLoaded', function() {
    // Initialize field enhancements (if WebflowFieldEnhancer exists)
    if (typeof WebflowFieldEnhancer !== 'undefined') {
        const fieldEnhancer = new WebflowFieldEnhancer();
        fieldEnhancer.init();
        window.WebflowFieldEnhancer = fieldEnhancer;
    }
    
    // Initialize multi-step forms  
    const tryformlyInstance = new TryformlyCompatible();
    tryformlyInstance.init();
    
    // Make available globally (tryformly compatibility)
    window.Formly = tryformlyInstance;
    window.TryformlyCompatible = tryformlyInstance;
    
    console.log('🚀 Webflow Forms Complete - All systems ready');
});
`;

// Write the complete bundle
fs.writeFileSync('dist/webflow-forms-complete.js', complete);
console.log('✅ Built complete bundle with tryformly.com compatibility fixes'); 