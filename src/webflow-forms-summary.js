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

        // Handle phone field updates (combines countryCode + phone)
        handlePhoneFieldUpdate: function(field, fieldName, value) {
            if (!this.mainLibraryReady) return;
            
            console.log(`📞 Handling phone field update: ${fieldName} = "${value}"`);
            
            const stepElement = field.closest('[data-step-type]');
            if (!stepElement) return;

            const phoneField = stepElement.querySelector('[data-step-field-name="phone"]');
            const countryCodeField = stepElement.querySelector('[data-step-field-name="countryCode"]');
            
            if (!phoneField || !countryCodeField) {
                console.warn('Could not find both phone and countryCode fields in step');
                return;
            }

            const phoneValue = this.getFieldValue(phoneField);
            const countryCodeValue = this.getFieldValue(countryCodeField);
            
            const formattedPhone = this.formatInternationalPhone(phoneValue, countryCodeValue, countryCodeField);
            
            const summaryElements = this.findSummaryElements(phoneField, 'phone');
            summaryElements.forEach(summaryElement => {
                summaryElement.textContent = formattedPhone;
                summaryElement.classList.add('summary-updated');
                setTimeout(() => {
                    summaryElement.classList.remove('summary-updated');
                }, 1500);
            });
            
            console.log(`📞 Updated phone summary with: "${formattedPhone}"`);
        },

        // Format international phone number
        formatInternationalPhone: function(phoneValue, countryCodeValue, countryCodeField) {
            if (!phoneValue) return '+1 (xxx) xxx-xxxx';
            
            try {
                let countryIso = this.getCountryIsoFromField(countryCodeField, countryCodeValue);
                if (!countryIso) countryIso = 'US';
                
                if (typeof parsePhoneNumber === 'function') {
                    try {
                        const parsedNumber = parsePhoneNumber(phoneValue, countryIso);
                        if (parsedNumber && parsedNumber.isValid()) {
                            return parsedNumber.formatInternational();
                        }
                    } catch (parseError) {
                        console.warn('Libphonenumber parsing failed:', parseError);
                    }
                }
                
                return this.fallbackPhoneFormat(phoneValue, countryCodeValue);
            } catch (error) {
                console.warn('Phone formatting error:', error);
                return this.fallbackPhoneFormat(phoneValue, countryCodeValue);
            }
        },

        // Get country ISO from field
        getCountryIsoFromField: function(countryCodeField, countryCodeValue) {
            if (!countryCodeField || !countryCodeValue) return null;
            
            const selectedOption = countryCodeField.options[countryCodeField.selectedIndex];
            if (!selectedOption) return null;
            
            if (selectedOption.dataset.iso) return selectedOption.dataset.iso;
            
            const dialingCodeToIso = {
                '+1': 'US', '+44': 'GB', '+33': 'FR', '+49': 'DE', '+81': 'JP',
                '+86': 'CN', '+91': 'IN', '+55': 'BR', '+61': 'AU', '+7': 'RU'
            };
            
            if (dialingCodeToIso[countryCodeValue]) {
                return dialingCodeToIso[countryCodeValue];
            }
            
            const optionText = selectedOption.text;
            const dialingCodeMatch = optionText.match(/\(\+(\d+)\)/);
            if (dialingCodeMatch) {
                const fullCode = `+${dialingCodeMatch[1]}`;
                return dialingCodeToIso[fullCode];
            }
            
            return 'US'; // fallback
        },

        // Fallback phone formatting
        fallbackPhoneFormat: function(phoneValue, countryCodeValue) {
            const cleanPhone = phoneValue.replace(/\D/g, '');
            let countryCode = countryCodeValue || '+1';
            
            if (!countryCode.startsWith('+')) {
                countryCode = '+' + countryCode;
            }
            
            if ((countryCode === '+1' || countryCode === '+1 ') && cleanPhone.length === 10) {
                return `+1 (${cleanPhone.substr(0,3)}) ${cleanPhone.substr(3,3)}-${cleanPhone.substr(6,4)}`;
            } else {
                return `${countryCode} ${phoneValue}`;
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

            let summaryContainers = document.querySelectorAll(
                `[data-summary-type="${stepType}"][data-summary-number="${stepNumber}"][data-summary-subtype="${stepSubtype}"]`
            );

            if (summaryContainers.length === 0) {
                summaryContainers = document.querySelectorAll(
                    `[data-summary-type="${stepType}"][data-summary-number="${stepNumber}"]`
                );
            }

            if (summaryContainers.length === 0) {
                summaryContainers = document.querySelectorAll(
                    `[data-summary-type="${stepType}"]`
                );
            }

            summaryContainers.forEach(container => {
                const summaryField = container.querySelector(`[data-summary-field="${fieldName}"]`);
                if (summaryField) {
                    summaryElements.push(summaryField);
                }
            });

            return summaryElements;
        },

        // Update summary display
        updateSummaryDisplay: function(summaryElement, value, sourceField) {
            if (!this.mainLibraryReady) return;
            
            let displayValue = value;

            if (sourceField.type === 'tel' || sourceField.dataset.stepFieldName === 'phone') {
                displayValue = this.formatPhoneForSummary(value, sourceField);
            } else if (sourceField.type === 'email' || sourceField.dataset.stepFieldName === 'email') {
                displayValue = value || 'email@example.com';
            } else if (sourceField.dataset.stepFieldName === 'countryCode') {
                const countryName = sourceField.options[sourceField.selectedIndex]?.text || value;
                displayValue = countryName;
            } else if (sourceField.type === 'checkbox' && sourceField.dataset.stepFieldName !== 'sameAsMainContact') {
                displayValue = sourceField.checked ? 'Yes' : 'No';
            } else if (sourceField.type === 'radio') {
                displayValue = value || 'Not selected';
            }

            const finalValue = displayValue || this.getPlaceholderText(sourceField.dataset.stepFieldName || sourceField.dataset.stepField);
            summaryElement.textContent = finalValue;
            
            summaryElement.classList.add('summary-updated');
            setTimeout(() => {
                summaryElement.classList.remove('summary-updated');
            }, 1500);
        },

        // Format phone for summary
        formatPhoneForSummary: function(phoneValue, sourceField) {
            if (!phoneValue) return '+1 (xxx) xxx-xxxx';
            
            const stepElement = sourceField.closest('[data-step-type]');
            const countryCodeField = stepElement?.querySelector('[data-step-field-name="countryCode"]');
            let countryCode = '+1';
            
            if (countryCodeField && countryCodeField.value) {
                const selectedOption = countryCodeField.options[countryCodeField.selectedIndex];
                if (selectedOption && selectedOption.value !== 'Another option') {
                    countryCode = selectedOption.value;
                }
            }
            
            if (phoneValue.length >= 10) {
                const cleaned = phoneValue.replace(/\D/g, '');
                if (cleaned.length === 10 && (countryCode === '+1' || countryCode === '+1 ')) {
                    return `+1 (${cleaned.substr(0,3)}) ${cleaned.substr(3,3)}-${cleaned.substr(6,4)}`;
                }
            }
            
            return `${countryCode} ${phoneValue}`;
        },

        // Handle same as main contact
        handleSameAsMainContact: function(checkbox) {
            if (!this.mainLibraryReady || !checkbox.checked) return;
            
            const memberContainer = checkbox.closest('[data-step-type="member"]');
            if (!memberContainer) return;

            const mainContactData = this.getMainContactData();
            
            Object.keys(mainContactData).forEach(fieldName => {
                if (['firstName', 'lastName', 'email', 'address', 'city', 'state', 'country', 'postalCode', 'phone'].includes(fieldName)) {
                    const memberField = memberContainer.querySelector(`[data-step-field-name="${fieldName}"]`);
                    if (memberField) {
                        memberField.value = mainContactData[fieldName];
                        const changeEvent = new Event('input', { bubbles: true });
                        memberField.dispatchEvent(changeEvent);
                    }
                }
            });
        },

        // Get main contact data
        getMainContactData: function() {
            const mainContactContainer = document.querySelector('[data-step-type="contact"][data-step-subtype="info"]');
            if (!mainContactContainer) return {};

            const data = {};
            const fields = mainContactContainer.querySelectorAll('[data-step-field-name], [data-step-field]');
            
            fields.forEach(field => {
                const fieldName = field.dataset.stepFieldName || field.dataset.stepField;
                if (fieldName) {
                    data[fieldName] = this.getFieldValue(field);
                }
            });

            return data;
        },

        // Get placeholder text
        getPlaceholderText: function(fieldName) {
            const placeholders = {
                firstName: 'First Name',
                lastName: 'Last Name',
                email: 'email@example.com',
                address: '123 Main St',
                city: 'City',
                state: 'State',
                country: 'Country',
                postalCode: '12345',
                phone: '+1 (xxx) xxx-xxxx',
                companyName1: 'Company Name',
                companyName2: 'Company Name 2',
                companyName3: 'Company Name 3',
                extension: 'LLC',
                entityName: 'Entity Name',
                trustName: 'Trust Name',
                managerName: 'Manager Name'
            };
            
            return placeholders[fieldName] || 'Not specified';
        },

        // Populate initial values (safe)
        populateInitialValues: function() {
            if (!this.mainLibraryReady) return;
            
            console.log('📋 Populating initial summary values (safe mode)...');
            
            const allFields = document.querySelectorAll('[data-step-field-name], [data-step-field]');
            let populatedCount = 0;
            
            allFields.forEach(field => {
                if (this.shouldHandleField(field)) {
                    const hasValue = field.value || (field.type === 'radio' && field.checked) || (field.type === 'checkbox' && field.checked);
                    if (hasValue) {
                        this.handleFieldChange(field);
                        populatedCount++;
                    }
                }
            });
            
            console.log(`📊 Populated ${populatedCount} initial summary values`);
        }
    };

    // Only auto-initialize if this is the safe version
    console.log('📦 Loading Summary Cards V2 (Safe Mode)');
    WebflowSummaryCards.init();

    // Export to global scope
    window.WebflowSummaryCardsSafe = WebflowSummaryCards;

})(window, document); 