/**
 * Webflow Forms - Summary Card Extension
 * Handles real-time summary card updates based on form field changes
 * Works with the data attribute system in webflow-forms.js
 * @version 1.0.0
 * @author Chris Brummer
 */

(function(window, document) {
    'use strict';

    // Summary Card Manager
    const WebflowSummaryCards = {
        version: '1.0.0',
        
        // Initialize the summary card system
        init: function() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        },

        // Setup the summary card functionality
        setup: function() {
            console.log('🔄 Initializing Summary Card System...');
            this.setupEventListeners();
            this.populateInitialValues();
            this.observeFormChanges();
        },

        // Set up event listeners for form field changes
        setupEventListeners: function() {
            const forms = document.querySelectorAll('[data-form="multistep"]');
            
            forms.forEach(form => {
                console.log('📋 Setting up summary listeners for form:', form.id || 'unnamed');
                
                // Handle input changes (text, email, tel, etc.)
                form.addEventListener('input', (event) => {
                    this.handleFieldChange(event.target);
                });
                
                // Handle select, radio, and checkbox changes
                form.addEventListener('change', (event) => {
                    this.handleFieldChange(event.target);
                });
                
                // Special handling for "same as main contact" checkboxes
                form.addEventListener('change', (event) => {
                    if (event.target.matches('[data-step-field-name="sameAsMainContact"]')) {
                        this.handleSameAsMainContact(event.target);
                    }
                });
            });
        },

        // Handle individual field changes
        handleFieldChange: function(field) {
            const fieldName = field.dataset.stepFieldName || field.dataset.stepField;
            if (!fieldName) return;

            // Get field value
            let value = this.getFieldValue(field);
            
            // Special handling for phone-related fields
            if (fieldName === 'phone' || fieldName === 'countryCode') {
                this.handlePhoneFieldUpdate(field, fieldName, value);
                return;
            }
            
            // Find corresponding summary elements
            const summaryElements = this.findSummaryElements(field, fieldName);
            
            if (summaryElements.length > 0) {
                summaryElements.forEach(summaryElement => {
                    this.updateSummaryDisplay(summaryElement, value, field);
                });
                console.log(`📊 Updated ${summaryElements.length} summary element(s) for: ${fieldName} = "${value}"`);
            }
        },

        // Handle phone field updates (combines countryCode + phone)
        handlePhoneFieldUpdate: function(field, fieldName, value) {
            console.log(`📞 Handling phone field update: ${fieldName} = "${value}"`);
            
            // Get the step context to find related fields
            const stepElement = field.closest('[data-step-type]');
            if (!stepElement) return;

            // Find both phone and countryCode fields in this step
            const phoneField = stepElement.querySelector('[data-step-field-name="phone"]');
            const countryCodeField = stepElement.querySelector('[data-step-field-name="countryCode"]');
            
            if (!phoneField || !countryCodeField) {
                console.warn('Could not find both phone and countryCode fields in step');
                return;
            }

            // Get current values
            const phoneValue = this.getFieldValue(phoneField);
            const countryCodeValue = this.getFieldValue(countryCodeField);
            
            // Format the combined phone number
            const formattedPhone = this.formatInternationalPhone(phoneValue, countryCodeValue, countryCodeField);
            
            // Update summary elements for phone field
            const summaryElements = this.findSummaryElements(phoneField, 'phone');
            summaryElements.forEach(summaryElement => {
                summaryElement.textContent = formattedPhone;
                
                // Add visual feedback
                summaryElement.classList.add('summary-updated');
                setTimeout(() => {
                    summaryElement.classList.remove('summary-updated');
                }, 1500);
            });
            
            console.log(`📞 Updated phone summary with: "${formattedPhone}"`);
        },

        // Format international phone number using libphonenumber
        formatInternationalPhone: function(phoneValue, countryCodeValue, countryCodeField) {
            if (!phoneValue) {
                return '+1 (xxx) xxx-xxxx';
            }
            
            try {
                // Get the country ISO code for libphonenumber
                let countryIso = this.getCountryIsoFromField(countryCodeField, countryCodeValue);
                
                // If we can't determine the country, default to US
                if (!countryIso) {
                    countryIso = 'US';
                }
                
                // Try to use libphonenumber if available
                if (typeof parsePhoneNumber === 'function') {
                    console.log(`📞 Parsing phone with libphonenumber: "${phoneValue}" for country "${countryIso}"`);
                    
                    try {
                        const parsedNumber = parsePhoneNumber(phoneValue, countryIso);
                        if (parsedNumber && parsedNumber.isValid()) {
                            const formatted = parsedNumber.formatInternational();
                            console.log(`📞 Libphonenumber formatted: "${formatted}"`);
                            return formatted;
                        }
                    } catch (parseError) {
                        console.warn('Libphonenumber parsing failed:', parseError);
                    }
                }
                
                // Fallback to manual formatting
                return this.fallbackPhoneFormat(phoneValue, countryCodeValue);
                
            } catch (error) {
                console.warn('Phone formatting error:', error);
                return this.fallbackPhoneFormat(phoneValue, countryCodeValue);
            }
        },

        // Get country ISO code from the country code field
        getCountryIsoFromField: function(countryCodeField, countryCodeValue) {
            if (!countryCodeField || !countryCodeValue) return null;
            
            // Try to get ISO code from the selected option's data attribute or text
            const selectedOption = countryCodeField.options[countryCodeField.selectedIndex];
            if (!selectedOption) return null;
            
            // Check if option has data-iso attribute
            if (selectedOption.dataset.iso) {
                return selectedOption.dataset.iso;
            }
            
            // Try to extract from option text (e.g., "United States (+1)" -> "US")
            const optionText = selectedOption.text;
            
            // Common country mappings based on dialing codes
            const dialingCodeToIso = {
                '+1': 'US',
                '+1 ': 'US',
                '+44': 'GB',
                '+33': 'FR',
                '+49': 'DE',
                '+81': 'JP',
                '+86': 'CN',
                '+91': 'IN',
                '+55': 'BR',
                '+61': 'AU',
                '+7': 'RU',
                '+39': 'IT',
                '+34': 'ES',
                '+31': 'NL',
                '+46': 'SE',
                '+47': 'NO',
                '+45': 'DK',
                '+358': 'FI',
                '+41': 'CH',
                '+43': 'AT',
                '+32': 'BE',
                '+351': 'PT',
                '+30': 'GR',
                '+48': 'PL',
                '+420': 'CZ',
                '+36': 'HU',
                '+40': 'RO',
                '+359': 'BG',
                '+385': 'HR',
                '+386': 'SI',
                '+421': 'SK',
                '+370': 'LT',
                '+371': 'LV',
                '+372': 'EE'
            };
            
            // Try to match the country code value or extract from option text
            if (dialingCodeToIso[countryCodeValue]) {
                return dialingCodeToIso[countryCodeValue];
            }
            
            // Extract dialing code from option text and map it
            const dialingCodeMatch = optionText.match(/\(\+(\d+)\)/);
            if (dialingCodeMatch) {
                const fullCode = `+${dialingCodeMatch[1]}`;
                return dialingCodeToIso[fullCode];
            }
            
            // Try direct country name mapping
            const countryNameToIso = {
                'united states': 'US',
                'usa': 'US',
                'america': 'US',
                'united kingdom': 'GB',
                'uk': 'GB',
                'great britain': 'GB',
                'england': 'GB',
                'france': 'FR',
                'germany': 'DE',
                'japan': 'JP',
                'china': 'CN',
                'india': 'IN',
                'brazil': 'BR',
                'australia': 'AU',
                'russia': 'RU',
                'italy': 'IT',
                'spain': 'ES',
                'netherlands': 'NL',
                'sweden': 'SE',
                'norway': 'NO',
                'denmark': 'DK',
                'finland': 'FI',
                'switzerland': 'CH',
                'austria': 'AT',
                'belgium': 'BE',
                'portugal': 'PT',
                'greece': 'GR',
                'poland': 'PL',
                'canada': 'CA'
            };
            
            const countryName = optionText.toLowerCase().split('(')[0].trim();
            return countryNameToIso[countryName] || null;
        },

        // Fallback phone formatting when libphonenumber is not available
        fallbackPhoneFormat: function(phoneValue, countryCodeValue) {
            const cleanPhone = phoneValue.replace(/\D/g, '');
            let countryCode = countryCodeValue || '+1';
            
            // Ensure country code starts with +
            if (!countryCode.startsWith('+')) {
                countryCode = '+' + countryCode;
            }
            
            // Format based on country
            if ((countryCode === '+1' || countryCode === '+1 ') && cleanPhone.length === 10) {
                // US/Canada format
                return `+1 (${cleanPhone.substr(0,3)}) ${cleanPhone.substr(3,3)}-${cleanPhone.substr(6,4)}`;
            } else if (countryCode === '+44' && cleanPhone.length >= 10) {
                // UK format
                return `+44 ${cleanPhone.substr(0,4)} ${cleanPhone.substr(4,3)} ${cleanPhone.substr(7)}`;
            } else if (countryCode === '+33' && cleanPhone.length === 10) {
                // France format
                return `+33 ${cleanPhone.substr(0,1)} ${cleanPhone.substr(1,2)} ${cleanPhone.substr(3,2)} ${cleanPhone.substr(5,2)} ${cleanPhone.substr(7,2)}`;
            } else if (countryCode === '+49' && cleanPhone.length >= 10) {
                // Germany format
                return `+49 ${cleanPhone.substr(0,3)} ${cleanPhone.substr(3,4)} ${cleanPhone.substr(7)}`;
            } else {
                // Generic international format
                return `${countryCode} ${phoneValue}`;
            }
        },

        // Get the appropriate value from a field
        getFieldValue: function(field) {
            if (field.type === 'radio') {
                // For radio buttons, find the checked one in the group
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

        // Find summary elements that should be updated for a given field
        findSummaryElements: function(field, fieldName) {
            const summaryElements = [];
            
            // Get the step context
            const stepElement = field.closest('[data-step-type]');
            if (!stepElement) {
                console.warn(`Field ${fieldName} not found within a step container`);
                return summaryElements;
            }

            const stepType = stepElement.dataset.stepType;
            const stepNumber = stepElement.dataset.stepNumber || '1';
            const stepSubtype = stepElement.dataset.stepSubtype;

            // Find matching summary containers
            let summaryContainers = [];

            // Try exact match first
            summaryContainers = document.querySelectorAll(
                `[data-summary-type="${stepType}"][data-summary-number="${stepNumber}"][data-summary-subtype="${stepSubtype}"]`
            );

            // If no exact match, try without subtype
            if (summaryContainers.length === 0) {
                summaryContainers = document.querySelectorAll(
                    `[data-summary-type="${stepType}"][data-summary-number="${stepNumber}"]`
                );
            }

            // If still no match, try just type and number
            if (summaryContainers.length === 0) {
                summaryContainers = document.querySelectorAll(
                    `[data-summary-type="${stepType}"]`
                );
            }

            summaryContainers.forEach(container => {
                // Find the specific field element within this container
                const summaryField = container.querySelector(`[data-summary-field="${fieldName}"]`);
                if (summaryField) {
                    summaryElements.push(summaryField);
                }
            });

            return summaryElements;
        },

        // Update the summary display element
        updateSummaryDisplay: function(summaryElement, value, sourceField) {
            // Special formatting for different field types
            let displayValue = value;

            // Phone number formatting
            if (sourceField.type === 'tel' || sourceField.dataset.stepFieldName === 'phone') {
                displayValue = this.formatPhoneForSummary(value, sourceField);
            }
            // Email formatting
            else if (sourceField.type === 'email' || sourceField.dataset.stepFieldName === 'email') {
                displayValue = value || 'email@example.com';
            }
            // Country code handling
            else if (sourceField.dataset.stepFieldName === 'countryCode') {
                const countryName = sourceField.options[sourceField.selectedIndex]?.text || value;
                displayValue = countryName;
            }
            // Checkbox special handling
            else if (sourceField.type === 'checkbox' && sourceField.dataset.stepFieldName !== 'sameAsMainContact') {
                displayValue = sourceField.checked ? 'Yes' : 'No';
            }
            // Radio button special handling
            else if (sourceField.type === 'radio') {
                displayValue = value || 'Not selected';
            }

            // Update the summary element
            const finalValue = displayValue || this.getPlaceholderText(sourceField.dataset.stepFieldName || sourceField.dataset.stepField);
            summaryElement.textContent = finalValue;
            
            // Add visual feedback
            summaryElement.classList.add('summary-updated');
            setTimeout(() => {
                summaryElement.classList.remove('summary-updated');
            }, 1500);
        },

        // Format phone number for summary display
        formatPhoneForSummary: function(phoneValue, sourceField) {
            if (!phoneValue) return '+1 (xxx) xxx-xxxx';
            
            // Try to get country code from nearby field
            const stepElement = sourceField.closest('[data-step-type]');
            const countryCodeField = stepElement?.querySelector('[data-step-field-name="countryCode"]');
            let countryCode = '+1'; // Default
            
            if (countryCodeField && countryCodeField.value) {
                // Extract the country code from the select option
                const selectedOption = countryCodeField.options[countryCodeField.selectedIndex];
                if (selectedOption && selectedOption.value !== 'Another option') {
                    countryCode = selectedOption.value;
                }
            }
            
            // Basic formatting for US/CA numbers
            if (phoneValue.length >= 10) {
                const cleaned = phoneValue.replace(/\D/g, '');
                if (cleaned.length === 10 && (countryCode === '+1' || countryCode === '+1 ')) {
                    return `+1 (${cleaned.substr(0,3)}) ${cleaned.substr(3,3)}-${cleaned.substr(6,4)}`;
                }
            }
            
            // For other formats, just prepend country code
            return `${countryCode} ${phoneValue}`;
        },

        // Handle "same as main contact" checkbox
        handleSameAsMainContact: function(checkbox) {
            console.log('📋 Handling "same as main contact" checkbox:', checkbox.checked);
            
            if (!checkbox.checked) return;

            const memberContainer = checkbox.closest('[data-step-type="member"]');
            if (!memberContainer) {
                console.warn('Same as main contact checkbox not in member container');
                return;
            }

            // Get main contact data
            const mainContactData = this.getMainContactData();
            console.log('📋 Main contact data:', mainContactData);
            
            // Update member fields and their summaries
            Object.keys(mainContactData).forEach(fieldName => {
                if (['firstName', 'lastName', 'email', 'address', 'city', 'state', 'country', 'postalCode', 'phone'].includes(fieldName)) {
                    const memberField = memberContainer.querySelector(`[data-step-field-name="${fieldName}"]`);
                    if (memberField) {
                        memberField.value = mainContactData[fieldName];
                        
                        // Trigger change event to update summary
                        const changeEvent = new Event('input', { bubbles: true });
                        memberField.dispatchEvent(changeEvent);
                    }
                }
            });
        },

        // Get main contact data from form
        getMainContactData: function() {
            const mainContactContainer = document.querySelector('[data-step-type="contact"][data-step-subtype="info"]');
            if (!mainContactContainer) {
                console.warn('Main contact container not found');
                return {};
            }

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

        // Get placeholder text for empty fields
        getPlaceholderText: function(fieldName) {
            const placeholders = {
                firstName: 'First Name',
                lastName: 'Last Name',
                middleInitial: 'M.I.',
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
                managerName: 'Manager Name',
                trusteeName1: 'Trustee Name',
                trusteeName2: 'Trustee Name 2',
                trusteeName3: 'Trustee Name 3',
                trustees: 'Trustee Names',
                memberType: 'Individual',
                sameAsMainContact: 'No',
                foreignQualification: 'No',
                taxClassification: 'Single Member',
                ownerProfile: 'Not Applicable'
            };
            
            return placeholders[fieldName] || 'Not specified';
        },

        // Populate initial summary values from existing form data
        populateInitialValues: function() {
            console.log('📋 Populating initial summary values...');
            
            const allFields = document.querySelectorAll('[data-step-field-name], [data-step-field]');
            let populatedCount = 0;
            
            allFields.forEach(field => {
                const hasValue = field.value || (field.type === 'radio' && field.checked) || (field.type === 'checkbox' && field.checked);
                if (hasValue) {
                    this.handleFieldChange(field);
                    populatedCount++;
                }
            });
            
            console.log(`📊 Populated ${populatedCount} initial summary values`);
        },

        // Observe form changes using MutationObserver (for dynamic content)
        observeFormChanges: function() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        // Check if new form fields were added
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const newFields = node.querySelectorAll('[data-step-field-name], [data-step-field]');
                                if (newFields.length > 0) {
                                    console.log(`📋 Detected ${newFields.length} new form fields, updating summaries`);
                                    this.populateInitialValues();
                                }
                            }
                        });
                    }
                });
            });

            // Start observing
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        },

        // Manual trigger for updating all summaries (useful for debugging)
        updateAllSummaries: function() {
            console.log('🔄 Manually updating all summaries...');
            this.populateInitialValues();
        },

        // Debug function to show current field-summary mappings
        debugMappings: function() {
            console.log('🔍 Current field-summary mappings:');
            
            const allFields = document.querySelectorAll('[data-step-field-name], [data-step-field]');
            allFields.forEach(field => {
                const fieldName = field.dataset.stepFieldName || field.dataset.stepField;
                const summaryElements = this.findSummaryElements(field, fieldName);
                
                console.log(`Field: ${fieldName} (${field.id}) -> ${summaryElements.length} summary element(s)`);
                summaryElements.forEach(el => {
                    console.log(`  - Summary: ${el.textContent} (in ${el.closest('[data-summary-type]')?.dataset.summaryType})`);
                });
            });
        }
    };

    // Auto-initialize
    WebflowSummaryCards.init();

    // Export to global scope
    window.WebflowSummaryCards = WebflowSummaryCards;

    // Add CSS for visual feedback
    const style = document.createElement('style');
    style.textContent = `
        .summary-updated {
            background-color: #e8f5e8 !important;
            transition: background-color 0.3s ease;
        }
        
        .multi-form_summary-field-text {
            transition: background-color 0.3s ease;
        }
    `;
    document.head.appendChild(style);

})(window, document); 