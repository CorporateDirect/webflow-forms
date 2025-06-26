/**
 * Webflow Multi-Step Form Summary Cards V5
 * Flexible visibility system that binds to existing data attributes
 * Version: 1.0.4-flexible-visibility
 */
(function(window, document) {
    'use strict';

    var WebflowSummaryCards = {
        version: '1.0.4-flexible-visibility',
        visibilityConfig: {
            // Default visibility rules - can be customized
            hideSelectors: [
                '[data-summary-type="member"]',
                '[data-summary-type="manager"]', 
                '[data-summary-type="child-entity"]'
            ],
            showSelectors: [
                '[data-summary-type="contact"]',
                '[data-summary-type="company"]'
            ],
            // Visibility condition attributes to watch
            visibilityAttributes: [
                'data-visibility',
                'data-condition-field',
                'data-show-when',
                'data-hide-when',
                'data-depends-on'
            ]
        },
        
        init: function() {
            console.log('🔄 Summary Cards V5 (Flexible Visibility) starting...');
            
            // Wait for main library and DOM
            var checkReady = function() {
                var mainLibraryExists = typeof window.WebflowFieldEnhancer !== 'undefined';
                var formExists = document.querySelector('[data-form="multistep"]');
                
                if (mainLibraryExists && formExists) {
                    console.log('✅ Main library and form ready');
                    WebflowSummaryCards.setupSummarySystem();
                } else {
                    console.log('⏳ Waiting for main library and form...');
                    setTimeout(checkReady, 100);
                }
            };
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', checkReady);
            } else {
                checkReady();
            }
        },
        
        setupSummarySystem: function() {
            console.log('🎯 Setting up flexible visibility-aware summary system...');
            
            // Scan for existing visibility conditions
            this.scanVisibilityConditions();
            
            // Initialize visibility based on existing conditions
            this.initializeVisibility();
            
            // Set up field monitoring
            this.setupFieldMonitoring();
            
            // Set up enhanced monitoring for special fields
            this.setupEnhancedMonitoring();
            
            console.log('✅ Flexible summary system initialized');
        },
        
        scanVisibilityConditions: function() {
            console.log('🔍 Scanning for existing visibility conditions...');
            
            var allSummaryContainers = document.querySelectorAll('[data-summary-type]');
            var conditionsFound = [];
            
            allSummaryContainers.forEach(function(container) {
                var conditions = {};
                
                // Check for various visibility attributes
                WebflowSummaryCards.visibilityConfig.visibilityAttributes.forEach(function(attr) {
                    var value = container.getAttribute(attr);
                    if (value) {
                        conditions[attr] = value;
                    }
                });
                
                if (Object.keys(conditions).length > 0) {
                    conditions.element = container;
                    conditions.summaryType = container.getAttribute('data-summary-type');
                    conditions.summaryNumber = container.getAttribute('data-summary-number');
                    conditionsFound.push(conditions);
                }
            });
            
            console.log('🔍 Found', conditionsFound.length, 'elements with visibility conditions:', conditionsFound);
            this.visibilityConditions = conditionsFound;
        },
        
        initializeVisibility: function() {
            console.log('👁️ Initializing flexible visibility system...');
            
            // Apply default hide/show rules
            this.visibilityConfig.hideSelectors.forEach(function(selector) {
                var elements = document.querySelectorAll(selector);
                elements.forEach(function(element) {
                    WebflowSummaryCards.hideElement(element);
                });
            });
            
            this.visibilityConfig.showSelectors.forEach(function(selector) {
                var elements = document.querySelectorAll(selector);
                elements.forEach(function(element) {
                    WebflowSummaryCards.showElement(element);
                });
            });
            
            // Process existing visibility conditions
            this.processVisibilityConditions();
        },
        
        processVisibilityConditions: function() {
            if (!this.visibilityConditions) return;
            
            this.visibilityConditions.forEach(function(condition) {
                var element = condition.element;
                
                // Handle different types of visibility conditions
                if (condition['data-visibility']) {
                    var visibility = condition['data-visibility'];
                    if (visibility === 'hidden' || visibility === 'false' || visibility === '0') {
                        WebflowSummaryCards.hideElement(element);
                    } else if (visibility === 'visible' || visibility === 'true' || visibility === '1') {
                        WebflowSummaryCards.showElement(element);
                    }
                }
                
                if (condition['data-show-when']) {
                    WebflowSummaryCards.setupConditionalVisibility(element, condition['data-show-when'], 'show');
                }
                
                if (condition['data-hide-when']) {
                    WebflowSummaryCards.setupConditionalVisibility(element, condition['data-hide-when'], 'hide');
                }
                
                if (condition['data-depends-on']) {
                    WebflowSummaryCards.setupDependencyVisibility(element, condition['data-depends-on']);
                }
            });
        },
        
        setupConditionalVisibility: function(element, condition, action) {
            // Parse condition like "memberType:entity" or "stepNumber:1"
            var parts = condition.split(':');
            if (parts.length !== 2) return;
            
            var fieldName = parts[0];
            var expectedValue = parts[1];
            
            console.log('🎯 Setting up conditional visibility:', {
                element: element,
                fieldName: fieldName,
                expectedValue: expectedValue,
                action: action
            });
            
            // Store the condition for later evaluation
            if (!element._visibilityConditions) {
                element._visibilityConditions = [];
            }
            element._visibilityConditions.push({
                fieldName: fieldName,
                expectedValue: expectedValue,
                action: action
            });
        },
        
        setupDependencyVisibility: function(element, dependencies) {
            // Parse dependencies like "member-1,step-completed" 
            var deps = dependencies.split(',');
            
            console.log('🔗 Setting up dependency visibility:', {
                element: element,
                dependencies: deps
            });
            
            element._dependencyConditions = deps;
        },
        
        showElement: function(element) {
            // Try multiple methods to show the element
            
            // Method 1: Remove common hide classes
            var hideClasses = ['hidden', 'hide', 'summary-hidden', 'd-none', 'w-condition-invisible'];
            hideClasses.forEach(function(className) {
                if (element.classList.contains(className)) {
                    element.classList.remove(className);
                }
            });
            
            // Method 2: Add common show classes
            var showClasses = ['visible', 'show', 'summary-visible', 'd-block'];
            showClasses.forEach(function(className) {
                if (document.querySelector('.' + className)) { // Only add if the class exists in stylesheet
                    element.classList.add(className);
                }
            });
            
            // Method 3: Set visibility attributes
            element.setAttribute('data-visibility', 'visible');
            element.removeAttribute('hidden');
            
            // Method 4: Inline styles (last resort)
            if (element.style.display === 'none') {
                element.style.display = '';
            }
            if (element.style.visibility === 'hidden') {
                element.style.visibility = '';
            }
            if (element.style.opacity === '0') {
                element.style.opacity = '';
            }
            
            console.log('👁️ Showed element:', element);
        },
        
        hideElement: function(element) {
            // Try multiple methods to hide the element
            
            // Method 1: Add hide classes if they exist
            var hideClasses = ['hidden', 'hide', 'summary-hidden', 'd-none', 'w-condition-invisible'];
            var classAdded = false;
            hideClasses.forEach(function(className) {
                if (document.querySelector('.' + className) && !classAdded) {
                    element.classList.add(className);
                    classAdded = true;
                }
            });
            
            // Method 2: Remove show classes
            var showClasses = ['visible', 'show', 'summary-visible', 'd-block'];
            showClasses.forEach(function(className) {
                if (element.classList.contains(className)) {
                    element.classList.remove(className);
                }
            });
            
            // Method 3: Set visibility attributes
            element.setAttribute('data-visibility', 'hidden');
            
            // Method 4: Inline styles (fallback)
            if (!classAdded) {
                element.style.display = 'none';
            }
            
            console.log('👁️ Hid element:', element);
        },
        
        setupFieldMonitoring: function() {
            console.log('📡 Setting up flexible field monitoring...');
            
            // Monitor all input changes
            document.addEventListener('input', function(e) {
                var target = e.target;
                var fieldName = target.getAttribute('data-step-field-name');
                
                if (fieldName) {
                    WebflowSummaryCards.handleFieldUpdate(target, fieldName);
                }
            });
            
            // Monitor all change events (selects, radios, etc.)
            document.addEventListener('change', function(e) {
                var target = e.target;
                var fieldName = target.getAttribute('data-step-field-name');
                
                if (fieldName) {
                    WebflowSummaryCards.handleFieldUpdate(target, fieldName);
                }
            });
        },
        
        handleFieldUpdate: function(formField, fieldName) {
            var stepType = formField.closest('[data-step-type]') ? formField.closest('[data-step-type]').getAttribute('data-step-type') : null;
            var stepNumber = formField.closest('[data-step-number]') ? formField.closest('[data-step-number]').getAttribute('data-step-number') : null;
            var stepSubtype = formField.closest('[data-step-subtype]') ? formField.closest('[data-step-subtype]').getAttribute('data-step-subtype') : null;
            
            var fieldValue = formField.value || '';
            
            console.log('🔄 Field update:', {
                fieldName: fieldName,
                value: fieldValue,
                context: {type: stepType, number: stepNumber, subtype: stepSubtype}
            });
            
            // Show relevant summary section when user starts filling it
            this.showRelevantSummarySection(stepType, stepNumber, stepSubtype);
            
            // Update matching summary fields
            this.updateMatchingSummaryFields(fieldName, fieldValue, stepType, stepNumber, stepSubtype);
            
            // Evaluate visibility conditions
            this.evaluateVisibilityConditions(fieldName, fieldValue);
            
            // Handle special field combinations
            if (fieldName === 'phone' || fieldName === 'countryCode') {
                this.handlePhoneFieldUpdate(stepType, stepNumber, stepSubtype);
            }
        },
        
        evaluateVisibilityConditions: function(fieldName, fieldValue) {
            // Check all elements with visibility conditions
            var allElements = document.querySelectorAll('[data-summary-type]');
            
            allElements.forEach(function(element) {
                if (element._visibilityConditions) {
                    element._visibilityConditions.forEach(function(condition) {
                        if (condition.fieldName === fieldName) {
                            var shouldShow = (fieldValue === condition.expectedValue);
                            
                            if (condition.action === 'show' && shouldShow) {
                                WebflowSummaryCards.showElement(element);
                                console.log('🎯 Condition triggered - showing element for:', fieldName, '=', fieldValue);
                            } else if (condition.action === 'hide' && shouldShow) {
                                WebflowSummaryCards.hideElement(element);
                                console.log('🎯 Condition triggered - hiding element for:', fieldName, '=', fieldValue);
                            }
                        }
                    });
                }
            });
        },
        
        showRelevantSummarySection: function(stepType, stepNumber, stepSubtype) {
            if (!stepType) return;
            
            // Build selector for matching summary section
            var selector = '[data-summary-type="' + stepType + '"]';
            if (stepNumber) selector += '[data-summary-number="' + stepNumber + '"]';
            if (stepSubtype) selector += '[data-summary-subtype="' + stepSubtype + '"]';
            
            var summarySection = document.querySelector(selector);
            if (summarySection) {
                // Check if element has specific visibility conditions
                var hasVisibilityConditions = summarySection._visibilityConditions || 
                                             summarySection.hasAttribute('data-show-when') ||
                                             summarySection.hasAttribute('data-hide-when');
                
                if (!hasVisibilityConditions) {
                    // Only auto-show if no specific conditions are set
                    this.showElement(summarySection);
                    console.log('👁️ Auto-showed summary section:', stepType, stepNumber, stepSubtype);
                }
            }
        },
        
        updateMatchingSummaryFields: function(fieldName, fieldValue, stepType, stepNumber, stepSubtype) {
            // Find all summary fields with matching field name
            var summaryFields = document.querySelectorAll('[data-summary-field="' + fieldName + '"]');
            var updatedCount = 0;
            
            summaryFields.forEach(function(summaryField) {
                var summaryContainer = summaryField.closest('[data-summary-type]');
                if (!summaryContainer) return;
                
                var summaryType = summaryContainer.getAttribute('data-summary-type');
                var summaryNumber = summaryContainer.getAttribute('data-summary-number');
                var summarySubtype = summaryContainer.getAttribute('data-summary-subtype');
                
                // Check if contexts match
                var contextMatch = WebflowSummaryCards.checkContextMatch(
                    {type: stepType, number: stepNumber, subtype: stepSubtype},
                    {type: summaryType, number: summaryNumber, subtype: summarySubtype}
                );
                
                if (contextMatch) {
                    // Update the summary field
                    var displayValue = fieldValue || '[' + fieldName + ']';
                    summaryField.textContent = displayValue;
                    
                    // Add visual feedback
                    summaryField.style.color = '#16a34a'; // Green color
                    setTimeout(function() {
                        summaryField.style.color = '';
                    }, 1000);
                    
                    updatedCount++;
                }
            });
            
            if (updatedCount > 0) {
                console.log('📊 Updated', updatedCount, 'summary field(s) for:', fieldName, '=', fieldValue);
            }
        },
        
        checkContextMatch: function(stepContext, summaryContext) {
            // Allow exact matches or wildcards (null/undefined)
            var typeMatch = !stepContext.type || !summaryContext.type || stepContext.type === summaryContext.type;
            var numberMatch = !stepContext.number || !summaryContext.number || stepContext.number === summaryContext.number;
            var subtypeMatch = !stepContext.subtype || !summaryContext.subtype || stepContext.subtype === summaryContext.subtype;
            
            return typeMatch && numberMatch && subtypeMatch;
        },
        
        setupEnhancedMonitoring: function() {
            console.log('🔧 Setting up enhanced monitoring for Google Places and phone combinations...');
            
            // Google Places monitoring
            this.setupGooglePlacesMonitoring();
            
            // Phone number combination monitoring
            this.setupPhoneNumberCombination();
        },
        
        setupGooglePlacesMonitoring: function() {
            var placesFields = document.querySelectorAll('[data-google-places="true"]');
            
            placesFields.forEach(function(field) {
                // Enhanced monitoring for Google Places
                var lastValue = field.value;
                
                // Periodic checking
                setInterval(function() {
                    if (field.value !== lastValue) {
                        lastValue = field.value;
                        var fieldName = field.getAttribute('data-step-field-name');
                        if (fieldName) {
                            console.log('🗺️ Google Places update:', fieldName, field.value);
                            WebflowSummaryCards.handleFieldUpdate(field, fieldName);
                        }
                    }
                }, 300);
                
                // Blur event
                field.addEventListener('blur', function() {
                    var fieldName = field.getAttribute('data-step-field-name');
                    if (fieldName && field.value) {
                        WebflowSummaryCards.handleFieldUpdate(field, fieldName);
                    }
                });
            });
        },
        
        setupPhoneNumberCombination: function() {
            // Phone combination will be handled in handlePhoneFieldUpdate
        },
        
        handlePhoneFieldUpdate: function(stepType, stepNumber, stepSubtype) {
            // Find the country code and phone fields in the same context
            var contextSelector = '';
            if (stepType) contextSelector += '[data-step-type="' + stepType + '"]';
            if (stepNumber) contextSelector += '[data-step-number="' + stepNumber + '"]';
            if (stepSubtype) contextSelector += '[data-step-subtype="' + stepSubtype + '"]';
            
            var container = document.querySelector(contextSelector);
            if (!container) return;
            
            var countryCodeField = container.querySelector('[data-step-field-name="countryCode"]');
            var phoneField = container.querySelector('[data-step-field-name="phone"]');
            
            if (countryCodeField && phoneField) {
                var countryCode = countryCodeField.value || '';
                var phoneNumber = phoneField.value || '';
                
                if (countryCode && phoneNumber) {
                    // Extract the numeric country code (e.g., "+1" from "🇺🇸 +1")
                    var numericCode = countryCode.match(/\+\d+/);
                    if (numericCode) {
                        var formattedPhone = numericCode[0] + ' ' + phoneNumber;
                        
                        // Update phone summary fields
                        this.updateMatchingSummaryFields('phone', formattedPhone, stepType, stepNumber, stepSubtype);
                        
                        console.log('📞 Combined phone number:', formattedPhone);
                    }
                }
            }
        }
    };

    // Initialize when script loads
    WebflowSummaryCards.init();
    
    // Expose for debugging and customization
    window.WebflowSummaryCards = WebflowSummaryCards;

})(window, document); 