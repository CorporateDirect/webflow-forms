/**
 * Webflow Forms - Summary Card Extension V7 (Clean Implementation)
 * - NO placeholder text (empty fields stay empty)
 * - Only show summary cards for completed steps with actual content
 * - Clean phone formatting without emoji flags
 * - Controlled auto-population only via "Same as Main Contact"
 * @version 1.0.7
 * @author Chris Brummer
 */

(function(window, document) {
    'use strict';

    // Check if we're already initialized to prevent duplicates
    if (window.WebflowSummaryCardsV7Initialized) {
        console.log('📦 Summary Cards V7 already initialized, skipping...');
        return;
    }
    window.WebflowSummaryCardsV7Initialized = true;

    // Summary Card Manager V7
    const WebflowSummaryCards = {
        version: '1.0.7-clean',
        mainLibraryReady: false,
        stepStates: new Map(), // Track step states: UNTOUCHED, TOUCHED, COMPLETED
        
        // Initialize the summary card system
        init: function() {
            console.log('🔄 Summary Cards V7 (Clean Implementation) starting...');
            
            // Wait for main library AND form to be fully initialized
            const waitForReadiness = () => {
                const mainLibraryExists = typeof window.WebflowFieldEnhancer !== 'undefined';
                const formExists = document.querySelector('[data-form="multistep"]');
                const stepsVisible = document.querySelectorAll('[data-form="step"]').length > 0;
                
                if (mainLibraryExists && formExists && stepsVisible) {
                    console.log('✅ Main library and form ready, initializing summary cards...');
                    this.mainLibraryReady = true;
                    
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

        // Setup
        setup: function() {
            console.log('🔄 Initializing Summary Card System V7...');
            
            if (!this.mainLibraryReady) {
                console.warn('❌ Main library not ready, aborting summary setup');
                return;
            }
            
            this.initializeStepStates();
            this.hideAllSummaryCards(); // Start with all hidden
            this.setupAdvancementEventListeners();
            this.setupFieldEventListeners();
        },

        // Hide all summary cards initially
        hideAllSummaryCards: function() {
            const allSummaryCards = document.querySelectorAll('[data-summary-type]');
            allSummaryCards.forEach(card => {
                card.style.display = 'none';
            });
            console.log(`🙈 Hidden ${allSummaryCards.length} summary cards initially`);
        },

        // Initialize step states
        initializeStepStates: function() {
            const steps = document.querySelectorAll('[data-step-type]');
            steps.forEach(step => {
                const stepKey = this.getStepKey(step);
                this.stepStates.set(stepKey, 'UNTOUCHED');
            });
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
                    console.log(`✅ Step completed: ${stepKey}`);
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
                    console.log(`👁️ Summary visible: ${stepKey} (has content)`);
                }
            });
        },

        // Setup field event listeners
        setupFieldEventListeners: function() {
            const forms = document.querySelectorAll('[data-form="multistep"]');
            
            forms.forEach(form => {
                // Use ONE set of event listeners to prevent duplicates
                this.attachEventListenersToForm(form);
            });
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
                    console.log(`👆 Step touched: ${stepKey}`);
                }
            }

            try {
                let value = this.getFieldValue(field);
                
                if (fieldName === 'phone' || fieldName === 'countryCode') {
                    this.handlePhoneFieldUpdate(field, fieldName, value);
                    return;
                }
                
                const summaryElements = this.findSummaryElements(field, fieldName);
                
                summaryElements.forEach(summaryElement => {
                    this.updateSummaryDisplay(summaryElement, value, field);
                });
                
                if (summaryElements.length > 0) {
                    console.log(`📊 Updated ${summaryElements.length} summary element(s) for: ${fieldName} = "${value}"`);
                }
            } catch (error) {
                console.warn('Summary update error:', error);
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

        // Handle phone field updates
        handlePhoneFieldUpdate: function(field, fieldName, value) {
            const stepElement = field.closest('[data-step-type]');
            if (!stepElement) return;

            const phoneField = stepElement.querySelector('[data-step-field-name="phone"]');
            const countryCodeField = stepElement.querySelector('[data-step-field-name="countryCode"]');
            
            if (!phoneField || !countryCodeField) return;

            const phoneValue = this.getFieldValue(phoneField);
            const countryCodeValue = this.getFieldValue(countryCodeField);
            
            const formattedPhone = this.formatPhone(phoneValue, countryCodeValue);
            
            const summaryElements = this.findSummaryElements(phoneField, 'phone');
            summaryElements.forEach(summaryElement => {
                summaryElement.textContent = formattedPhone;
            });
            
            if (formattedPhone) {
                console.log(`📞 Updated phone summary with: "${formattedPhone}"`);
            }
        },

        // Clean phone formatting (NO PLACEHOLDERS)
        formatPhone: function(phoneValue, countryCodeValue) {
            // Return empty string if no phone value
            if (!phoneValue || phoneValue.trim() === '') return '';
            
            // Clean country code (remove emoji flags)
            let cleanCountryCode = '+1';
            if (countryCodeValue) {
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

        // Format phone for summary (NO PLACEHOLDERS)
        formatPhoneForSummary: function(phoneValue, sourceField) {
            if (!phoneValue || phoneValue.trim() === '') return '';
            
            const stepElement = sourceField.closest('[data-step-type]');
            const countryCodeField = stepElement?.querySelector('[data-step-field-name="countryCode"]');
            
            let countryCode = '+1';
            if (countryCodeField && countryCodeField.value) {
                const codeMatch = countryCodeField.value.match(/\+\d+/);
                if (codeMatch) {
                    countryCode = codeMatch[0];
                }
            }
            
            const cleaned = phoneValue.replace(/\D/g, '');
            if (countryCode === '+1' && cleaned.length === 10) {
                return `+1 (${cleaned.substr(0,3)}) ${cleaned.substr(3,3)}-${cleaned.substr(6,4)}`;
            }
            
            return `${countryCode} ${phoneValue}`;
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
            
            console.log('✅ Same as main contact applied');
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
    console.log('📦 Loading Summary Cards V7 (Clean Implementation)');
    WebflowSummaryCards.init();

    // Export to global scope
    window.WebflowSummaryCardsV7 = WebflowSummaryCards;

})(window, document);