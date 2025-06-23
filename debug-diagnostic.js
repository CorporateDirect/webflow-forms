// Webflow Forms Diagnostic Tool
// Add this script BEFORE your main webflow-forms script to diagnose issues

(function() {
    console.log('🔍 WEBFLOW FORMS DIAGNOSTIC STARTING...');
    
    // Track what gets loaded
    window.WebflowFormsDiagnostic = {
        loadedComponents: [],
        errors: [],
        formElements: [],
        
        log: function(component, status, details) {
            console.log(`📊 ${component}: ${status}`, details || '');
            this.loadedComponents.push({component, status, details, timestamp: Date.now()});
        },
        
        error: function(component, error) {
            console.error(`❌ ${component}: ERROR`, error);
            this.errors.push({component, error, timestamp: Date.now()});
        },
        
        scanForms: function() {
            // Check for multi-step forms
            const multiStepForms = document.querySelectorAll('[data-multi-step], [data-formly], [data-form-steps]');
            console.log(`🔍 Found ${multiStepForms.length} multi-step forms`);
            
            // Check for steps
            const steps = document.querySelectorAll('[data-step], [data-form-step], .form-step');
            console.log(`🔍 Found ${steps.length} form steps`);
            
            // Check for navigation buttons
            const nextButtons = document.querySelectorAll('[data-next], [data-step-next], [data-formly-next]');
            const prevButtons = document.querySelectorAll('[data-prev], [data-step-prev], [data-formly-prev]');
            console.log(`🔍 Found ${nextButtons.length} next buttons, ${prevButtons.length} prev buttons`);
            
            // Check for branching radios
            const branchingRadios = document.querySelectorAll('.radio_field.radio-type.is-active-inputactive input[type="radio"]');
            console.log(`🔍 Found ${branchingRadios.length} branching radio buttons`);
            
            // Check for regular forms
            const allForms = document.querySelectorAll('form');
            console.log(`🔍 Found ${allForms.length} total forms`);
            
            this.formElements = {
                multiStepForms: multiStepForms.length,
                steps: steps.length,
                nextButtons: nextButtons.length,
                prevButtons: prevButtons.length,
                branchingRadios: branchingRadios.length,
                totalForms: allForms.length
            };
        },
        
        generateReport: function() {
            console.log('\n📋 DIAGNOSTIC REPORT:');
            console.log('===================');
            console.log('Loaded Components:', this.loadedComponents);
            console.log('Errors:', this.errors);
            console.log('Form Elements Found:', this.formElements);
            console.log('Window Objects:', {
                WebflowForms: typeof window.WebflowForms,
                WebflowMultiStepManager: typeof window.WebflowMultiStepManager,
                BranchingRadioValidator: typeof window.BranchingRadioValidator,
                WebflowFieldEnhancer: typeof window.WebflowFieldEnhancer
            });
            
            return {
                components: this.loadedComponents,
                errors: this.errors,
                elements: this.formElements
            };
        }
    };
    
    // Scan after page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                window.WebflowFormsDiagnostic.scanForms();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            window.WebflowFormsDiagnostic.scanForms();
        }, 1000);
    }
    
    // Auto-generate report after 3 seconds
    setTimeout(() => {
        window.WebflowFormsDiagnostic.generateReport();
    }, 3000);
    
    console.log('🔍 Diagnostic tool loaded. Use WebflowFormsDiagnostic.generateReport() for full report');
})();
