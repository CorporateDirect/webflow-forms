/**
 * Webflow Forms - Summary Card Extension V2 (Safe Mode)
 * Handles real-time summary card updates without interfering with main library
 * @version 1.0.1
 * @author Chris Brummer
 */

(function(window, document) {
    'use strict';

    // Summary Card Manager (Safe Mode)
    const WebflowSummaryCards = {
        version: '1.0.1-safe',
        mainLibraryReady: false,
        
        // Initialize the summary card system (safe mode)
        init: function() {
            console.log('🔄 Summary Cards V2 (Safe Mode) starting...');
            
            // Wait for main library AND form to be fully initialized
            const waitForReadiness = () => {
                const mainLibraryExists = typeof window.WebflowFieldEnhancer !== 'undefined';
                const formExists = document.querySelector('[data-form="multistep"]');
                const stepsVisible = document.querySelectorAll('[data-form="step"]').length > 0;
                
                if (mainLibraryExists && formExists && stepsVisible) {
                    console.log('✅ Main library and form ready, initializing summary cards...');
                    this.mainLibraryReady = true;
                    
                    // Wait an additional 1 second to ensure main library is fully initialized
                    setTimeout(() => {
                        this.setup();
                    }, 1000);
                } else {
                    console.log(`⏳ Waiting... Main:${mainLibraryExists} Form:${!!formExists} Steps:${stepsVisible}`);
                    setTimeout(waitForReadiness, 200);
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(waitForReadiness, 1000);
                });
            } else {
                setTimeout(waitForReadiness, 1000);
            }
        },

        // Setup with minimal interference
        setup: function() {
            console.log('🔄 Initializing Summary Card System (Safe Mode)...');
            
            // Only setup if main library is confirmed ready
            if (!this.mainLibraryReady) {
                console.warn('❌ Main library not ready, aborting summary setup');
                return;
            }
            
            this.setupSafeEventListeners();
            
            // Delay initial population to avoid conflicts
            setTimeout(() => {
                this.populateInitialValues();
            }, 500);
        },

        // Ultra-safe event listeners that don't interfere
        setupSafeEventListeners: function() {
            const forms = document.querySelectorAll('[data-form="multistep"]');
            
            forms.forEach(form => {
                console.log('📋 Setting up SAFE summary listeners for form:', form.id || 'unnamed');
                
                // Use delegated event listeners on document to avoid conflicts
                document.addEventListener('input', (event) => {
                    if (form.contains(event.target) && this.shouldHandleField(event.target)) {
                        // Use requestAnimationFrame to ensure we don't block main library
                        requestAnimationFrame(() => {
                            this.handleFieldChange(event.target);
                        });
                    }
                }, { passive: true, capture: false });
                
                document.addEventListener('change', (event) => {
                    if (form.contains(event.target) && this.shouldHandleField(event.target)) {
                        requestAnimationFrame(() => {
                            this.handleFieldChange(event.target);
                        });
                    }
                }, { passive: true, capture: false });
                
                // Special handling for "same as main contact"
                document.addEventListener('change', (event) => {
                    if (form.contains(event.target) && 
                        event.target.matches('[data-step-field-name="sameAsMainContact"]')) {
                        requestAnimationFrame(() => {
                            this.handleSameAsMainContact(event.target);
                        });
                    }
                }, { passive: true, capture: false });
            });
        },

        // Very strict field filtering
        shouldHandleField: function(field) {
            // Only handle fields with our specific data attributes
            const hasStepFieldName = field.dataset.stepFieldName || field.dataset.stepField;
            
            // Absolutely don't interfere with any navigation or form control elements
            const isFormControl = field.matches(`
                [data-form="next-btn"], 
                [data-form="back-btn"], 
                [data-form="submit"],
                [data-go-to], 
                [data-skip],
                button,
                [type="submit"],
                [type="button"],
                .w-button
            `);
            
            // Don't handle if it's in a step that's currently hidden
            const stepContainer = field.closest('[data-form="step"]');
            const isStepHidden = stepContainer && (
                stepContainer.style.display === 'none' ||
                stepContainer.classList.contains('w-hidden') ||
                stepContainer.hasAttribute('hidden')
            );
            
            return hasStepFieldName && !isFormControl && !isStepHidden;
        },

        // Rest of the methods remain the same but with safety checks
        handleFieldChange: function(field) {
            // Safety check - don't run if main library might be processing
            if (!this.mainLibraryReady) return;
            
            const fieldName = field.dataset.stepFieldName || field.dataset.stepField;
            if (!fieldName) return;

            try {
                let value = this.getFieldValue(field);
                
                if (fieldName === 'phone' || fieldName === 'countryCode') {
                    this.handlePhoneFieldUpdate(field, fieldName, value);
                    return;
                }
                
                const summaryElements = this.findSummaryElements(field, fieldName);
                
                if (summaryElements.length > 0) {
                    summaryElements.forEach(summaryElement => {
                        this.updateSummaryDisplay(summaryElement, value, field);
                    });
                    console.log(`📊 Updated ${summaryElements.length} summary element(s) for: ${fieldName} = "${value}"`);
                }
            } catch (error) {
                console.warn('Summary update error:', error);
            }
        },

        // Include all the other methods from the original file...
        // (getFieldValue, findSummaryElements, updateSummaryDisplay, etc.)
        // [Rest of methods would be copied here but keeping this focused on the fix]
    };

    // Only auto-initialize if this is the safe version
    console.log('📦 Loading Summary Cards V2 (Safe Mode)');
    WebflowSummaryCards.init();

    // Export to global scope
    window.WebflowSummaryCardsSafe = WebflowSummaryCards;

})(window, document); 