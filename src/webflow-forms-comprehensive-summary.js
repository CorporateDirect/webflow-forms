/**
 * Webflow Forms - Comprehensive Summary Card System
 * - Integrates with comprehensive fix
 * - Fixed phone formatting in summary cards
 * - Enhanced field mapping and error handling
 * @version 3.0.0-comprehensive
 * @author Chris Brummer
 */

(function(window, document) {
    'use strict';

    console.log('🚀 Loading Comprehensive Summary Cards v3.0.0');

    // Check if comprehensive fix is loaded
    if (!window.WebflowFormsComprehensive) {
        console.warn('⚠️ Comprehensive fix not found - summary cards may not work properly');
    }

    // Prevent multiple initialization
    if (window.WebflowSummaryCardsComprehensive) {
        console.warn('⚠️ Comprehensive Summary Cards already loaded, skipping...');
        return;
    }

    const WebflowSummaryCardsComprehensive = {
        version: '3.0.0-comprehensive',
        initialized: false,
        stepStates: new Map(),
        fieldMappings: new Map(),
        
        // Enhanced logging system
        log: {
            info: (msg, data) => console.log(`📋 SUMMARY: ${msg}`, data || ''),
            success: (msg, data) => console.log(`✅ SUMMARY: ${msg}`, data || ''),
            warning: (msg, data) => console.warn(`⚠️ SUMMARY: ${msg}`, data || ''),
            error: (msg, data) => console.error(`❌ SUMMARY: ${msg}`, data || ''),
            debug: (msg, data) => console.log(`🔍 SUMMARY DEBUG: ${msg}`, data || ''),
            phone: (msg, data) => console.log(`📞 SUMMARY PHONE: ${msg}`, data || '')
        },

        init: function() {
            this.log.info('Starting comprehensive summary cards initialization...');
            
            // Wait for comprehensive fix to be ready
            const waitForComprehensiveFix = () => {
                const comprehensiveFixReady = window.WebflowFormsComprehensive?.initialized;
                const formExists = document.querySelector('[data-form="multistep"]');
                const stepsVisible = document.querySelectorAll('[data-form="step"]').length > 0;
                
                if (comprehensiveFixReady && formExists && stepsVisible) {
                    this.log.success('Comprehensive fix and form ready, initializing summary cards...');
                    setTimeout(() => this.setup(), 500);
                } else {
                    this.log.info(`⏳ Waiting... ComprehensiveFix:${comprehensiveFixReady} Form:${!!formExists} Steps:${stepsVisible}`);
                    setTimeout(waitForComprehensiveFix, 200);
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(waitForComprehensiveFix, 1000);
                });
            } else {
                setTimeout(waitForComprehensiveFix, 1000);
            }
        },

        setup: function() {
            this.log.info('Setting up comprehensive summary card system...');
            
            try {
                this.initializeStepStates();
                this.mapFormFields();
                this.hideAllSummaryCards();
                this.setupEventListeners();
                this.initialized = true;
                this.log.success('Comprehensive summary card system ready!');
                
                // Export debug methods
                window.debugSummaryComprehensive = {
                    getStepStates: () => this.stepStates,
                    getFieldMappings: () => this.fieldMappings,
                    updateSummary: (fieldName, value) => this.updateSummaryForField(fieldName, value),
                    version: this.version
                };
                
            } catch (error) {
                this.log.error('Setup failed:', error);
            }
        },

        // Initialize step states tracking
        initializeStepStates: function() {
            const steps = document.querySelectorAll('[data-step-type]');
            steps.forEach(step => {
                const stepKey = this.getStepKey(step);
                this.stepStates.set(stepKey, {
                    status: 'UNTOUCHED',
                    hasContent: false,
                    lastUpdated: null
                });
            });
            this.log.success(`Initialized ${steps.length} step states`);
        },

        // Map all form fields to their summary counterparts
        mapFormFields: function() {
            this.log.info('Mapping form fields to summary elements...');
            
            const formFields = document.querySelectorAll('[data-step-field-name]');
            
            formFields.forEach(field => {
                const fieldName = field.getAttribute('data-step-field-name');
                const stepElement = field.closest('[data-step-type]');
                
                if (fieldName && stepElement) {
                    const stepType = stepElement.getAttribute('data-step-type');
                    const stepNumber = stepElement.getAttribute('data-step-number') || '1';
                    const stepSubtype = stepElement.getAttribute('data-step-subtype');
                    
                    const fieldInfo = {
                        element: field,
                        fieldName: fieldName,
                        stepType: stepType,
                        stepNumber: stepNumber,
                        stepSubtype: stepSubtype,
                        stepKey: this.getStepKey(stepElement),
                        summaryElements: this.findSummaryElements(stepType, stepNumber, stepSubtype, fieldName)
                    };
                    
                    this.fieldMappings.set(field.id || field.name, fieldInfo);
                    this.log.debug(`Mapped field: ${fieldName} (${fieldInfo.summaryElements.length} summary elements)`);
                }
            });
            
            this.log.success(`Mapped ${this.fieldMappings.size} form fields`);
        },

        // Find summary elements for a given field
        findSummaryElements: function(stepType, stepNumber, stepSubtype, fieldName) {
            const summaryElements = [];
            
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
                
                // Handle special field name mappings
                if (!summaryField) {
                    summaryField = this.findSummaryFieldWithMapping(container, fieldName);
                }
                
                if (summaryField) {
                    summaryElements.push(summaryField);
                }
            });

            return summaryElements;
        },

        // Handle special field name mappings
        findSummaryFieldWithMapping: function(container, fieldName) {
            const mappings = {
                'taxCollection': 'taxClassification',
                'phone': 'phoneNumber',
                'countryCode': 'phoneCountry'
            };
            
            const mappedFieldName = mappings[fieldName];
            if (mappedFieldName) {
                return container.querySelector(`[data-summary-field="${mappedFieldName}"]`);
            }
            
            return null;
        },

        // Hide all summary cards initially
        hideAllSummaryCards: function() {
            const allSummaryCards = document.querySelectorAll('[data-summary-type]');
            allSummaryCards.forEach(card => {
                card.style.display = 'none';
            });
            this.log.success(`Hidden ${allSummaryCards.length} summary cards initially`);
        },

        // Get unique step key
        getStepKey: function(stepElement) {
            const stepType = stepElement.getAttribute('data-step-type');
            const stepNumber = stepElement.getAttribute('data-step-number') || '1';
            const stepSubtype = stepElement.getAttribute('data-step-subtype') || '';
            return `${stepType}-${stepNumber}-${stepSubtype}`;
        },

        // Setup event listeners
        setupEventListeners: function() {
            this.log.info('Setting up comprehensive summary event listeners...');
            
            // Listen for field changes
            document.addEventListener('input', (event) => {
                if (event.target.matches('[data-step-field-name]')) {
                    this.handleFieldChange(event.target);
                }
            });
            
            document.addEventListener('change', (event) => {
                if (event.target.matches('select[data-step-field-name], input[type="radio"][data-step-field-name], input[type="checkbox"][data-step-field-name]')) {
                    this.handleFieldChange(event.target);
                }
            });
            
            // Listen for step advancement
            document.addEventListener('click', (event) => {
                if (event.target.matches('[data-form="next-btn"]') || 
                    event.target.closest('[data-form="next-btn"]')) {
                    setTimeout(() => this.markCurrentStepAsCompleted(), 100);
                }
            }, { passive: true });
            
            this.log.success('Event listeners setup complete');
        },

        // Handle individual field changes
        handleFieldChange: function(field) {
            const fieldMapping = this.fieldMappings.get(field.id || field.name);
            if (!fieldMapping) return;

            // Get field value
            const value = this.getFieldValue(field);
            
            // Update all summary elements for this field
            fieldMapping.summaryElements.forEach(summaryElement => {
                this.updateSummaryDisplay(summaryElement, value, field, fieldMapping);
            });

            // Mark step as touched
            this.markStepAsTouched(fieldMapping.stepKey);

            this.log.debug(`Updated summary for field: ${fieldMapping.fieldName} = "${value}"`);
        },

        // Get the appropriate value from a field
        getFieldValue: function(field) {
            if (field.type === 'radio') {
                const checkedRadio = document.querySelector(`input[name="${field.name}"]:checked`);
                return checkedRadio ? checkedRadio.value : '';
            } else if (field.type === 'checkbox') {
                return field.checked ? (field.value || 'Yes') : 'No';
            } else if (field.tagName.toLowerCase() === 'select') {
                const selectedOption = field.options[field.selectedIndex];
                return selectedOption ? selectedOption.text : '';
            } else {
                return field.value || '';
            }
        },

        // Update the summary display element
        updateSummaryDisplay: function(summaryElement, value, sourceField, fieldMapping) {
            let displayValue = value;

            // Apply special formatting based on field type
            if (sourceField.type === 'tel' || fieldMapping.fieldName === 'phone') {
                displayValue = this.formatPhoneForSummary(value, sourceField);
            } else if (sourceField.type === 'email' || fieldMapping.fieldName === 'email') {
                displayValue = value || 'email@example.com';
            } else if (fieldMapping.fieldName === 'countryCode') {
                const countryName = sourceField.options[sourceField.selectedIndex]?.text || value;
                displayValue = countryName;
            }

            // Update the summary element
            summaryElement.textContent = displayValue || this.getPlaceholderText(fieldMapping.fieldName);
            
            // Add updated class for visual feedback
            summaryElement.classList.add('summary-updated');
            setTimeout(() => {
                summaryElement.classList.remove('summary-updated');
            }, 2000);
        },

        // Format phone number for summary display with proper country code integration
        formatPhoneForSummary: function(phoneValue, sourceField) {
            if (!phoneValue) return '+1 (xxx) xxx-xxxx';
            
            // Try to get country code from comprehensive fix
            if (window.WebflowFormsComprehensive?.phoneFieldMappings) {
                const phoneMapping = window.WebflowFormsComprehensive.phoneFieldMappings.get(
                    sourceField.id || sourceField.name
                );
                
                if (phoneMapping && phoneMapping.countryCodeField) {
                    const selectedOption = phoneMapping.countryCodeField.options[phoneMapping.countryCodeField.selectedIndex];
                    let countryCode = '+1';
                    
                    if (selectedOption) {
                        const optionValue = selectedOption.value;
                        const optionText = selectedOption.text;
                        
                        if (optionValue && optionValue.startsWith('+')) {
                            countryCode = optionValue;
                        } else if (optionText.includes('+')) {
                            const match = optionText.match(/\+\d+/);
                            if (match) {
                                countryCode = match[0];
                            }
                        }
                    }
                    
                    // Return formatted phone with country code
                    const formattedPhone = phoneValue.startsWith('+') ? phoneValue : `${countryCode} ${phoneValue}`;
                    this.log.phone(`Formatted phone for summary: ${phoneValue} → ${formattedPhone}`);
                    return formattedPhone;
                }
            }
            
            // Fallback formatting
            if (phoneValue.length >= 10) {
                const cleaned = phoneValue.replace(/\D/g, '');
                if (cleaned.length === 10) {
                    return `+1 (${cleaned.substr(0, 3)}) ${cleaned.substr(3, 3)}-${cleaned.substr(6, 4)}`;
                } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
                    return `+1 (${cleaned.substr(1, 3)}) ${cleaned.substr(4, 3)}-${cleaned.substr(7, 4)}`;
                }
            }
            
            return phoneValue;
        },

        // Get placeholder text for different field types
        getPlaceholderText: function(fieldName) {
            const placeholders = {
                'firstName': 'First Name',
                'lastName': 'Last Name',
                'email': 'email@example.com',
                'phone': '+1 (xxx) xxx-xxxx',
                'address': 'Address',
                'city': 'City',
                'state': 'State',
                'country': 'Country',
                'postalCode': 'Postal Code',
                'entityName': 'Entity Name',
                'trustName': 'Trust Name',
                'trustee': 'Trustee Name'
            };
            
            return placeholders[fieldName] || 'Not provided';
        },

        // Mark step as touched
        markStepAsTouched: function(stepKey) {
            const stepState = this.stepStates.get(stepKey);
            if (stepState && stepState.status === 'UNTOUCHED') {
                stepState.status = 'TOUCHED';
                stepState.lastUpdated = new Date();
                this.log.debug(`Step marked as touched: ${stepKey}`);
            }
        },

        // Mark current step as completed
        markCurrentStepAsCompleted: function() {
            const currentStep = document.querySelector('[data-form="step"]:not([style*="display: none"]):not(.w-hidden)');
            if (!currentStep) return;

            const stepContainers = currentStep.querySelectorAll('[data-step-type]');
            stepContainers.forEach(container => {
                const stepKey = this.getStepKey(container);
                const stepState = this.stepStates.get(stepKey);
                
                if (stepState && stepState.status === 'TOUCHED') {
                    stepState.status = 'COMPLETED';
                    stepState.lastUpdated = new Date();
                    this.log.success(`Step completed: ${stepKey}`);
                    this.showSummaryIfHasContent(stepKey);
                }
            });
        },

        // Show summary if it has actual content
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
                    const text = field.textContent?.trim();
                    if (text && text !== '' && !this.isPlaceholderText(text)) {
                        hasContent = true;
                    }
                });
                
                if (hasContent) {
                    container.style.display = 'block';
                    this.log.success(`Showed summary card: ${stepKey}`);
                    
                    // Mark step state as having content
                    const stepState = this.stepStates.get(stepKey);
                    if (stepState) {
                        stepState.hasContent = true;
                    }
                } else {
                    this.log.debug(`Summary card has no content, keeping hidden: ${stepKey}`);
                }
            });
        },

        // Check if text is a placeholder
        isPlaceholderText: function(text) {
            const placeholderTexts = [
                'First Name', 'Last Name', 'email@example.com', '+1 (xxx) xxx-xxxx',
                'Address', 'City', 'State', 'Country', 'Postal Code',
                'Entity Name', 'Trust Name', 'Trustee Name', 'Not provided'
            ];
            
            return placeholderTexts.includes(text);
        },

        // Update summary for a specific field (for external use)
        updateSummaryForField: function(fieldName, value) {
            this.fieldMappings.forEach((fieldMapping, fieldId) => {
                if (fieldMapping.fieldName === fieldName) {
                    fieldMapping.summaryElements.forEach(summaryElement => {
                        this.updateSummaryDisplay(summaryElement, value, fieldMapping.element, fieldMapping);
                    });
                }
            });
        }
    };

    // Initialize the comprehensive summary cards
    WebflowSummaryCardsComprehensive.init();
    
    // Export to global scope
    window.WebflowSummaryCardsComprehensive = WebflowSummaryCardsComprehensive;

})(window, document);
