/**
 * Webflow Multi-Step Form Summary Cards - DEBUG VERSION
 * This version logs everything to help identify the root issues
 * Version: 1.0.0-debug
 */
(function(window, document) {
    'use strict';

    var WebflowSummaryDebug = {
        version: '1.0.0-debug',
        
        init: function() {
            console.log('🔍 DEBUG: Summary Cards Debug Version starting...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    WebflowSummaryDebug.startDebugging();
                });
            } else {
                WebflowSummaryDebug.startDebugging();
            }
        },
        
        startDebugging: function() {
            console.log('🔍 DEBUG: Starting comprehensive debugging...');
            
            // 1. Check all form fields
            this.debugFormFields();
            
            // 2. Check all summary cards
            this.debugSummaryCards();
            
            // 3. Check Google Places fields
            this.debugGooglePlaces();
            
            // 4. Check phone fields
            this.debugPhoneFields();
            
            // 5. Set up real-time monitoring
            this.setupRealTimeMonitoring();
        },
        
        debugFormFields: function() {
            console.log('🔍 DEBUG: === FORM FIELDS ANALYSIS ===');
            
            var allFields = document.querySelectorAll('[data-step-field-name]');
            console.log('🔍 DEBUG: Found', allFields.length, 'fields with data-step-field-name');
            
            allFields.forEach(function(field, index) {
                var fieldName = field.getAttribute('data-step-field-name');
                var stepType = field.closest('[data-step-type]') ? field.closest('[data-step-type]').getAttribute('data-step-type') : 'none';
                var stepNumber = field.closest('[data-step-number]') ? field.closest('[data-step-number]').getAttribute('data-step-number') : 'none';
                var stepSubtype = field.closest('[data-step-subtype]') ? field.closest('[data-step-subtype]').getAttribute('data-step-subtype') : 'none';
                var currentValue = field.value || field.textContent || '';
                
                console.log('🔍 Field ' + (index + 1) + ':', {
                    fieldName: fieldName,
                    stepType: stepType,
                    stepNumber: stepNumber,
                    stepSubtype: stepSubtype,
                    currentValue: currentValue,
                    element: field
                });
            });
        },
        
        debugSummaryCards: function() {
            console.log('🔍 DEBUG: === SUMMARY CARDS ANALYSIS ===');
            
            var allSummaryFields = document.querySelectorAll('[data-summary-field]');
            console.log('🔍 DEBUG: Found', allSummaryFields.length, 'summary fields');
            
            allSummaryFields.forEach(function(summaryField, index) {
                var fieldName = summaryField.getAttribute('data-summary-field');
                var summaryType = summaryField.closest('[data-summary-type]') ? summaryField.closest('[data-summary-type]').getAttribute('data-summary-type') : 'none';
                var summaryNumber = summaryField.closest('[data-summary-number]') ? summaryField.closest('[data-summary-number]').getAttribute('data-summary-number') : 'none';
                var summarySubtype = summaryField.closest('[data-summary-subtype]') ? summaryField.closest('[data-summary-subtype]').getAttribute('data-summary-subtype') : 'none';
                var currentText = summaryField.textContent || '';
                var isVisible = window.getComputedStyle(summaryField).display !== 'none';
                
                console.log('🔍 Summary ' + (index + 1) + ':', {
                    fieldName: fieldName,
                    summaryType: summaryType,
                    summaryNumber: summaryNumber,
                    summarySubtype: summarySubtype,
                    currentText: currentText,
                    isVisible: isVisible,
                    element: summaryField
                });
            });
        },
        
        debugGooglePlaces: function() {
            console.log('🔍 DEBUG: === GOOGLE PLACES ANALYSIS ===');
            
            var placesFields = document.querySelectorAll('[data-google-places="true"]');
            console.log('🔍 DEBUG: Found', placesFields.length, 'Google Places fields');
            
            placesFields.forEach(function(field, index) {
                var fieldName = field.getAttribute('data-step-field-name');
                var currentValue = field.value || '';
                var addressComponent = field.getAttribute('data-address-component');
                
                console.log('🔍 Places Field ' + (index + 1) + ':', {
                    fieldName: fieldName,
                    currentValue: currentValue,
                    addressComponent: addressComponent,
                    element: field
                });
            });
        },
        
        debugPhoneFields: function() {
            console.log('🔍 DEBUG: === PHONE FIELDS ANALYSIS ===');
            
            var phoneFields = document.querySelectorAll('[data-step-field-name="phone"]');
            var countryCodeFields = document.querySelectorAll('[data-step-field-name="countryCode"]');
            
            console.log('🔍 DEBUG: Found', phoneFields.length, 'phone fields');
            console.log('🔍 DEBUG: Found', countryCodeFields.length, 'country code fields');
            
            phoneFields.forEach(function(field, index) {
                console.log('🔍 Phone Field ' + (index + 1) + ':', {
                    value: field.value,
                    element: field
                });
            });
            
            countryCodeFields.forEach(function(field, index) {
                console.log('🔍 Country Code Field ' + (index + 1) + ':', {
                    value: field.value,
                    element: field
                });
            });
        },
        
        setupRealTimeMonitoring: function() {
            console.log('🔍 DEBUG: Setting up real-time monitoring...');
            
            // Monitor all input changes
            document.addEventListener('input', function(e) {
                var target = e.target;
                var fieldName = target.getAttribute('data-step-field-name');
                
                if (fieldName) {
                    console.log('🔍 CHANGE DETECTED:', {
                        fieldName: fieldName,
                        newValue: target.value,
                        element: target
                    });
                    
                    // Try to find matching summary field
                    WebflowSummaryDebug.findMatchingSummary(target);
                }
            });
            
            // Monitor all changes (for selects, radio buttons, etc.)
            document.addEventListener('change', function(e) {
                var target = e.target;
                var fieldName = target.getAttribute('data-step-field-name');
                
                if (fieldName) {
                    console.log('🔍 CHANGE EVENT:', {
                        fieldName: fieldName,
                        newValue: target.value,
                        element: target
                    });
                    
                    WebflowSummaryDebug.findMatchingSummary(target);
                }
            });
        },
        
        findMatchingSummary: function(formField) {
            var fieldName = formField.getAttribute('data-step-field-name');
            var stepType = formField.closest('[data-step-type]') ? formField.closest('[data-step-type]').getAttribute('data-step-type') : null;
            var stepNumber = formField.closest('[data-step-number]') ? formField.closest('[data-step-number]').getAttribute('data-step-number') : null;
            var stepSubtype = formField.closest('[data-step-subtype]') ? formField.closest('[data-step-subtype]').getAttribute('data-step-subtype') : null;
            
            console.log('🔍 LOOKING FOR SUMMARY MATCH:', {
                fieldName: fieldName,
                stepType: stepType,
                stepNumber: stepNumber,
                stepSubtype: stepSubtype
            });
            
            // Look for matching summary fields
            var summaryFields = document.querySelectorAll('[data-summary-field="' + fieldName + '"]');
            
            console.log('🔍 FOUND', summaryFields.length, 'potential summary matches');
            
            summaryFields.forEach(function(summaryField, index) {
                var summaryType = summaryField.closest('[data-summary-type]') ? summaryField.closest('[data-summary-type]').getAttribute('data-summary-type') : null;
                var summaryNumber = summaryField.closest('[data-summary-number]') ? summaryField.closest('[data-summary-number]').getAttribute('data-summary-number') : null;
                var summarySubtype = summaryField.closest('[data-summary-subtype]') ? summaryField.closest('[data-summary-subtype]').getAttribute('data-summary-subtype') : null;
                
                console.log('🔍 Summary Match ' + (index + 1) + ':', {
                    summaryType: summaryType,
                    summaryNumber: summaryNumber,
                    summarySubtype: summarySubtype,
                    currentText: summaryField.textContent
                });
                
                // Check if contexts match
                var contextMatch = (!stepType || !summaryType || stepType === summaryType) &&
                                 (!stepNumber || !summaryNumber || stepNumber === summaryNumber) &&
                                 (!stepSubtype || !summarySubtype || stepSubtype === summarySubtype);
                
                if (contextMatch) {
                    console.log('✅ CONTEXT MATCH - Updating summary field');
                    summaryField.textContent = formField.value || 'Not specified';
                    summaryField.style.color = 'green'; // Visual indicator
                } else {
                    console.log('❌ CONTEXT MISMATCH - Not updating');
                }
            });
        }
    };

    // Initialize when script loads
    WebflowSummaryDebug.init();
    
    // Expose for manual debugging
    window.WebflowSummaryDebug = WebflowSummaryDebug;

})(window, document); 