/**
 * Webflow Forms - Summary Card Extension V8 (Debug Fixed)
 * - Fixes phone formatting errors
 * - Fixes branching validation issues  
 * - Enhanced error handling and logging
 * @version 1.0.8-debug
 * @author Chris Brummer
 */

(function(window, document) {
    'use strict';

    // Check if we're already initialized to prevent duplicates
    if (window.WebflowSummaryCardsV8Initialized) {
        console.log('📦 Summary Cards V8 already initialized, skipping...');
        return;
    }
    window.WebflowSummaryCardsV8Initialized = true;

    // Summary Card Manager V8
    const WebflowSummaryCards = {
        version: '1.0.8-debug',
        mainLibraryReady: false,
        stepStates: new Map(),
        phoneFieldMappings: new Map(), // Track phone/country code relationships
        
        // Enhanced logging
        log: {
            info: (msg, data) => console.log(`📋 SUMMARY: ${msg}`, data || ''),
            success: (msg, data) => console.log(`✅ SUMMARY: ${msg}`, data || ''),
            warning: (msg, data) => console.warn(`⚠️ SUMMARY: ${msg}`, data || ''),
            error: (msg, data) => console.error(`❌ SUMMARY: ${msg}`, data || ''),
            phone: (msg, data) => console.log(`📞 PHONE: ${msg}`, data || '')
        },
        
        // Initialize the summary card system
        init: function() {
            this.log.info('Summary Cards V8 (Debug Fixed) starting...');
            
            // Wait for main library AND form to be fully initialized
            const waitForReadiness = () => {
                const mainLibraryExists = typeof window.WebflowFieldEnhancer !== 'undefined';
                const formExists = document.querySelector('[data-form="multistep"]');
                const stepsVisible = document.querySelectorAll('[data-form="step"]').length > 0;
                
                if (mainLibraryExists && formExists && stepsVisible) {
                    this.log.success('Main library and form ready, initializing summary cards...');
                    this.mainLibraryReady = true;
                    
                    setTimeout(() => {
                        this.setup();
                    }, 1000);
                } else {
                    this.log.info(`⏳ Waiting... Main:${mainLibraryExists} Form:${!!formExists} Steps:${stepsVisible}`);
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

        // Setup
        setup: function() {
            this.log.info('Initializing Summary Card System V8...');
            
            if (!this.mainLibraryReady) {
                this.log.error('Main library not ready, aborting summary setup');
                return;
            }
            
            this.initializeStepStates();
            this.mapPhoneFields(); // NEW: Map phone/country relationships
            this.hideAllSummaryCards();
            this.setupAdvancementEventListeners();
            this.setupFieldEventListeners();
            
            this.log.success('Summary Card System V8 ready!');
        },

        // NEW: Map phone and country code fields for proper formatting
        mapPhoneFields: function() {
            this.log.info('Mapping phone field relationships...');
            
            const phoneFields = document.querySelectorAll('[data-step-field-name="phone"]');
            
            phoneFields.forEach(phoneField => {
                const stepContainer = phoneField.closest('[data-step-type]');
                if (stepContainer) {
                    const countryCodeField = stepContainer.querySelector('[data-step-field-name="countryCode"]');
                    
                    if (countryCodeField) {
                        const phoneFieldId = phoneField.id || phoneField.name;
                        const countryFieldId = countryCodeField.id || countryCodeField.name;
                        
                        this.phoneFieldMappings.set(phoneFieldId, {
                            phoneField: phoneField,
                            countryCodeField: countryCodeField,
                            stepContainer: stepContainer
                        });
                        
                        this.log.phone(`Mapped phone field: ${phoneFieldId} ↔ ${countryFieldId}`);
                    }
                }
            });
            
            this.log.success(`Mapped ${this.phoneFieldMappings.size} phone field relationships`);
        },

        // Hide all summary cards initially
        hideAllSummaryCards: function() {
            const allSummaryCards = document.querySelectorAll('[data-summary-type]');
            allSummaryCards.forEach(card => {
                card.style.display = 'none';
            });
            this.log.success(`Hidden ${allSummaryCards.length} summary cards initially`);
        },

        // Initialize step states
        initializeStepStates: function() {
            const steps = document.querySelectorAll('[data-step-type]');
            steps.forEach(step => {
                const stepKey = this.getStepKey(step);
                this.stepStates.set(stepKey, 'UNTOUCHED');
            });
            this.log.success(`Initialized ${steps.length} step states`);
        },

        // Get unique step key
        getStepKey: function(stepElement) {
            const stepType = stepElement.dataset.stepType;
            const stepNumber = stepElement.dataset.stepNumber || '1';
            const stepSubtype = stepElement.dataset.stepSubtype || '';
            return `${stepType}-${stepNumber}-${stepSubtype}`;
        },

        // Setup step advancement listeners
        setupAdvancementEventListeners: function() {
            // Listen for next button clicks
            document.addEventListener('click', (event) => {
                if (event.target.matches('[data-form="next-btn"]') || 
                    event.target.closest('[data-form="next-btn"]')) {
                    
                    setTimeout(() => {
                        this.markCurrentStepAsCompleted();
                    }, 100);
                }
            }, { passive: true });
            
            this.log.info('Step advancement listeners setup');
        },

        // Mark current step as completed
        markCurrentStepAsCompleted: function() {
            const currentStep = document.querySelector('[data-form="step"]:not([style*="display: none"]):not(.w-hidden)');
            if (!currentStep) return;

            const stepContainers = currentStep.querySelectorAll('[data-step-type]');
            stepContainers.forEach(container => {
                const stepKey = this.getStepKey(container);
                const currentState = this.stepStates.get(stepKey);
                
                if (currentState === 'TOUCHED') {
                    this.stepStates.set(stepKey, 'COMPLETED');
                    this.log.success(`Step completed: ${stepKey}`);
                    this.showSummaryIfHasContent(stepKey);
                }
            });
        },

        // Only show summary if it has actual content
        showSummaryIfHasContent: function(stepKey) {
            const [stepType, stepNumber, stepSubtype] = stepKey.split('-');
            
            // Find corresponding summary containers
            let summaryContainers = document.querySelectorAll(
                `[data-summary-type="${stepType}"][data-summary-number="${stepNumber}"][data-summary-subtype="${stepSubtype}"]`
            );

            if (summaryContainers.length === 0) {
                summaryContainers = document.querySelectorAll(
                    `[data-summary-type="${stepType}"][data-summary-number="${stepNumber}"]`
                );
            }

            summaryContainers.forEach(container => {
                // Check if container has fields with actual content
                const summaryFields = container.querySelectorAll('[data-summary-field]');
                let hasContent = false;
                
                summaryFields.forEach(field => {
                    if (field.textContent && field.textContent.trim() !== '') {
                        hasContent = true;
                    }
                });
                
                if (hasContent) {
                    container.style.display = 'block';
                    this.log.success(`Summary visible: ${stepKey} (has content)`);
                }
            });
        },

        // Setup field event listeners
        setupFieldEventListeners: function() {
            const forms = document.querySelectorAll('[data-form="multistep"]');
            
            forms.forEach(form => {
                this.attachEventListenersToForm(form);
            });
            
            this.log.info('Field event listeners setup');
        },

        // Attach event listeners to specific form
        attachEventListenersToForm: function(form) {
            // Remove any existing listeners first
            const existingHandler = form._summaryHandler;
            if (existingHandler) {
                form.removeEventListener('input', existingHandler);
                form.removeEventListener('change', existingHandler);
            }

            // Create new handler
            const handler = (event) => {
                if (this.shouldHandleField(event.target)) {
                    requestAnimationFrame(() => {
                        this.handleFieldChange(event.target);
                    });
                }
            };

            // Attach listeners
            form.addEventListener('input', handler, { passive: true });
            form.addEventListener('change', handler, { passive: true });
            
            // Store reference to prevent duplicates
            form._summaryHandler = handler;

            // Special handling for "same as main contact"
            form.addEventListener('change', (event) => {
                if (event.target.matches('[data-step-field-name="sameAsMainContact"]')) {
                    this.handleSameAsMainContact(event.target);
                }
            }, { passive: true });
        },

        // Field filtering
        shouldHandleField: function(field) {
            const hasStepFieldName = field.dataset.stepFieldName || field.dataset.stepField;
            const isFormControl = field.matches(`
                [data-form="next-btn"], [data-form="back-btn"], [data-form="submit"],
                [data-go-to], [data-skip], button, [type="submit"], [type="button"], .w-button
            `);
            
            return hasStepFieldName && !isFormControl;
        },

        // Handle field changes
        handleFieldChange: function(field) {
            if (!this.mainLibraryReady) return;
            
            const fieldName = field.dataset.stepFieldName || field.dataset.stepField;
            if (!fieldName) return;

            // Mark step as touched
            const stepElement = field.closest('[data-step-type]');
            if (stepElement) {
                const stepKey = this.getStepKey(stepElement);
                const currentState = this.stepStates.get(stepKey);
                
                if (currentState === 'UNTOUCHED') {
                    this.stepStates.set(stepKey, 'TOUCHED');
                    this.log.info(`Step touched: ${stepKey}`);
                }
            }

            try {
                let value = this.getFieldValue(field);
                
                // FIXED: Enhanced phone field handling
                if (fieldName === 'phone' || fieldName === 'countryCode') {
                    this.handlePhoneFieldUpdate(field, fieldName, value);
                    return;
                }
                
                const summaryElements = this.findSummaryElements(field, fieldName);
                
                summaryElements.forEach(summaryElement => {
                    this.updateSummaryDisplay(summaryElement, value, field);
                });
                
                if (summaryElements.length > 0) {
                    this.log.info(`Updated ${summaryElements.length} summary element(s) for: ${fieldName} = "${value}"`);
                }
            } catch (error) {
                this.log.error('Summary update error:', error);
            }
        },

        // Get field value
        getFieldValue: function(field) {
            if (field.type === 'radio') {
                const checkedRadio = document.querySelector(`input[name="${field.name}"]:checked`);
                return checkedRadio ? checkedRadio.value : '';
            } else if (field.type === 'checkbox') {
                return field.checked ? (field.value || 'Yes') : '';
            } else if (field.tagName.toLowerCase() === 'select') {
                const selectedOption = field.options[field.selectedIndex];
                return selectedOption ? selectedOption.text : '';
            } else {
                return field.value || '';
            }
        },

        // FIXED: Enhanced phone field update handling
        handlePhoneFieldUpdate: function(field, fieldName, value) {
            const fieldId = field.id || field.name;
            
            // Use the mapping we created earlier
            let phoneMapping = null;
            
            if (fieldName === 'phone') {
                phoneMapping = this.phoneFieldMappings.get(fieldId);
            } else if (fieldName === 'countryCode') {
                // Find mapping where this field is the country code field
                for (const [phoneFieldId, mapping] of this.phoneFieldMappings) {
                    if (mapping.countryCodeField.id === fieldId || mapping.countryCodeField.name === fieldId) {
                        phoneMapping = mapping;
                        break;
                    }
                }
            }
            
            if (!phoneMapping) {
                this.log.warning(`No phone mapping found for field: ${fieldId}`);
                return;
            }

            try {
                const phoneValue = this.getFieldValue(phoneMapping.phoneField);
                const countryCodeValue = this.getFieldValue(phoneMapping.countryCodeField);
                
                const formattedPhone = this.formatPhone(phoneValue, countryCodeValue);
                
                // Find summary elements for the phone field
                const summaryElements = this.findSummaryElements(phoneMapping.phoneField, 'phone');
                summaryElements.forEach(summaryElement => {
                    summaryElement.textContent = formattedPhone;
                });
                
                if (formattedPhone) {
                    this.log.phone(`Updated phone summary: "${formattedPhone}"`);
                }
            } catch (error) {
                this.log.error('Phone formatting error:', error);
            }
        },

        // FIXED: Clean phone formatting with better error handling
        formatPhone: function(phoneValue, countryCodeValue) {
            try {
                // Return empty string if no phone value
                if (!phoneValue || phoneValue.trim() === '') return '';
                
                // Clean country code (remove emoji flags)
                let cleanCountryCode = '+1';
                if (countryCodeValue && typeof countryCodeValue === 'string') {
                    const codeMatch = countryCodeValue.match(/\+\d+/);
                    if (codeMatch) {
                        cleanCountryCode = codeMatch[0];
                    }
                }
                
                const cleanPhone = phoneValue.replace(/\D/g, '');
                
                if (cleanCountryCode === '+1' && cleanPhone.length === 10) {
                    return `+1 (${cleanPhone.substr(0,3)}) ${cleanPhone.substr(3,3)}-${cleanPhone.substr(6,4)}`;
                } else {
                    return `${cleanCountryCode} ${phoneValue}`;
                }
            } catch (error) {
                this.log.error('Phone formatting failed:', error);
                return phoneValue || ''; // Fallback to original value
            }
        },

        // Find summary elements
        findSummaryElements: function(field, fieldName) {
            const summaryElements = [];
            const stepElement = field.closest('[data-step-type]');
            if (!stepElement) return summaryElements;

            const stepType = stepElement.dataset.stepType;
            const stepNumber = stepElement.dataset.stepNumber || '1';
            const stepSubtype = stepElement.dataset.stepSubtype;

            // Try exact match first
            let summaryContainers = document.querySelectorAll(
                `[data-summary-type="${stepType}"][data-summary-number="${stepNumber}"][data-summary-subtype="${stepSubtype}"]`
            );

            // Fallback to less specific matches
            if (summaryContainers.length === 0) {
                summaryContainers = document.querySelectorAll(
                    `[data-summary-type="${stepType}"][data-summary-number="${stepNumber}"]`
                );
            }

            summaryContainers.forEach(container => {
                let summaryField = container.querySelector(`[data-summary-field="${fieldName}"]`);
                
                // Handle taxCollection -> taxClassification mapping
                if (!summaryField && fieldName === 'taxCollection') {
                    summaryField = container.querySelector(`[data-summary-field="taxClassification"]`);
                }
                
                if (summaryField) {
                    summaryElements.push(summaryField);
                }
            });

            return summaryElements;
        },

        // Update summary display (NO PLACEHOLDERS)
        updateSummaryDisplay: function(summaryElement, value, sourceField) {
            if (!this.mainLibraryReady) return;
            
            let displayValue = value;

            // Handle different field types
            if (sourceField.type === 'tel' || sourceField.dataset.stepFieldName === 'phone') {
                displayValue = this.formatPhoneForSummary(value, sourceField);
            } else if (sourceField.dataset.stepFieldName === 'countryCode') {
                const countryName = sourceField.options[sourceField.selectedIndex]?.text || value;
                displayValue = countryName;
            } else if (sourceField.type === 'checkbox' && sourceField.dataset.stepFieldName !== 'sameAsMainContact') {
                displayValue = sourceField.checked ? 'Yes' : '';
            } else if (sourceField.type === 'radio') {
                displayValue = value || '';
            }

            // NO PLACEHOLDERS - empty fields stay empty
            summaryElement.textContent = displayValue || '';
        },

        // FIXED: Format phone for summary with better error handling
        formatPhoneForSummary: function(phoneValue, sourceField) {
            try {
                if (!phoneValue || phoneValue.trim() === '') return '';
                
                const fieldId = sourceField.id || sourceField.name;
                const phoneMapping = this.phoneFieldMappings.get(fieldId);
                
                let countryCode = '+1';
                if (phoneMapping && phoneMapping.countryCodeField.value) {
                    const codeMatch = phoneMapping.countryCodeField.value.match(/\+\d+/);
                    if (codeMatch) {
                        countryCode = codeMatch[0];
                    }
                }
                
                const cleaned = phoneValue.replace(/\D/g, '');
                if (countryCode === '+1' && cleaned.length === 10) {
                    return `+1 (${cleaned.substr(0,3)}) ${cleaned.substr(3,3)}-${cleaned.substr(6,4)}`;
                }
                
                return `${countryCode} ${phoneValue}`;
            } catch (error) {
                this.log.error('Phone summary formatting failed:', error);
                return phoneValue || '';
            }
        },

        // Handle "same as main contact" (ONLY controlled auto-population)
        handleSameAsMainContact: function(checkbox) {
            if (!checkbox.checked) return;
            
            const memberContainer = checkbox.closest('[data-step-type="member"]');
            if (!memberContainer) return;

            const mainContactData = this.getMainContactData();
            
            // Mark step as touched
            const stepKey = this.getStepKey(memberContainer);
            this.stepStates.set(stepKey, 'TOUCHED');
            
            // Only populate these specific fields
            ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'country', 'postalCode', 'phone'].forEach(fieldName => {
                const memberField = memberContainer.querySelector(`[data-step-field-name="${fieldName}"]`);
                if (memberField && mainContactData[fieldName]) {
                    memberField.value = mainContactData[fieldName];
                    memberField.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            
            this.log.success('Same as main contact applied');
        },

        // Get main contact data
        getMainContactData: function() {
            const mainContactContainer = document.querySelector('[data-step-type="contact"][data-step-subtype="info"]');
            if (!mainContactContainer) return {};

            const data = {};
            const fields = mainContactContainer.querySelectorAll('[data-step-field-name]');
            
            fields.forEach(field => {
                const fieldName = field.dataset.stepFieldName;
                if (fieldName) {
                    data[fieldName] = this.getFieldValue(field);
                }
            });

            return data;
        }
    };

    // Initialize
    console.log('📦 Loading Summary Cards V8 (Debug Fixed)');
    WebflowSummaryCards.init();

    // Export to global scope
    window.WebflowSummaryCardsV8 = WebflowSummaryCards;

})(window, document); 