/**
 * Webflow Multi-Step Form Summary Cards V4
 * Fixes: Google Places, Phone Numbers, Member Types, Empty Fields, Child Entities
 * Version: 1.0.3-fixed
 */
(function(window, document) {
    'use strict';

    var WebflowSummaryCards = {
        version: '1.0.3-fixed',
        mainLibraryReady: false,
        
        init: function() {
            console.log('🔄 Summary Cards V4 (Fixed) starting...');
            
            var checkReady = function() {
                var mainLibraryExists = typeof window.WebflowFieldEnhancer !== 'undefined';
                var formExists = document.querySelector('[data-form="multistep"]');
                var stepsExist = document.querySelectorAll('[data-form="step"]').length > 0;
                
                if (mainLibraryExists && formExists && stepsExist) {
                    console.log('✅ Main library and form ready, initializing V4 summary cards...');
                    WebflowSummaryCards.mainLibraryReady = true;
                    setTimeout(function() {
                        WebflowSummaryCards.setup();
                    }, 1000);
                } else {
                    console.log('⏳ Waiting... Main:' + mainLibraryExists + ' Form:' + !!formExists + ' Steps:' + stepsExist);
                    setTimeout(checkReady, 200);
                }
            };
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(checkReady, 1000);
                });
            } else {
                setTimeout(checkReady, 1000);
            }
        },

        setup: function() {
            console.log('🔄 Initializing Summary Card System V4 (Fixed)...');
            
            if (!this.mainLibraryReady) {
                console.warn('❌ Main library not ready, aborting summary setup');
                return;
            }

            // Step 1: Hide all summary cards and clean up dummy text
            this.hideAllSummaryCards();
            this.clearDummyText();
            
            // Step 2: Set up comprehensive event listeners
            this.setupFixedEventListeners();
            
            // Step 3: Set up Google Places monitoring
            this.setupGooglePlacesMonitoring();
            
            // Step 4: Show cards for current state and populate values
            setTimeout(() => {
                this.updateSummaryVisibility();
                this.populateAllValues();
            }, 500);
        },

        hideAllSummaryCards: function() {
            console.log('👁️ Hiding all summary cards initially...');
            
            var summaryContainers = document.querySelectorAll('[data-summary-type]');
            var hiddenCount = 0;
            
            summaryContainers.forEach(function(container) {
                container.style.display = 'none';
                container.classList.add('summary-hidden');
                hiddenCount++;
            });
            
            console.log('👁️ Hidden ' + hiddenCount + ' summary containers');
        },

        clearDummyText: function() {
            console.log('🧹 Clearing dummy text from summary fields...');
            
            var summaryFields = document.querySelectorAll('[data-summary-field]');
            var clearedCount = 0;
            
            summaryFields.forEach((field) => {
                var fieldName = field.getAttribute('data-summary-field');
                var currentText = field.textContent.trim();
                
                if (this.isDummyText(currentText, fieldName)) {
                    field.textContent = this.getPlaceholderText(fieldName);
                    field.classList.add('summary-placeholder');
                    clearedCount++;
                }
            });
            
            console.log('🧹 Cleared ' + clearedCount + ' dummy text fields');
        },

        isDummyText: function(text, fieldName) {
            var dummyPatterns = [
                'Your First Name', 'Your Last Name', 'Your first name', 'Your last name',
                'email@email.com', 'ChrisCorp', 'ChrisCorp2', 'ChrisCorp3',
                '123 Park Ave.', 'Gotham', 'New York', 'United States',
                '111111', '+1 (111) 111-1111', 'Your entity name', 'Your full name',
                'Trust name', 'Trustee full name', 'Nevada'
            ];
            
            return dummyPatterns.some(pattern => text.includes(pattern)) || 
                   text === 'Your ' + fieldName || 
                   text.toLowerCase().includes('dummy') ||
                   text.toLowerCase().includes('placeholder');
        },

        setupFixedEventListeners: function() {
            var self = this;
            
            // Enhanced field change listeners
            document.addEventListener('input', function(e) {
                if (self.shouldHandleField(e.target)) {
                    requestAnimationFrame(function() {
                        self.handleFieldChange(e.target);
                    });
                }
            }, { passive: true, capture: true });

            document.addEventListener('change', function(e) {
                if (self.shouldHandleField(e.target)) {
                    requestAnimationFrame(function() {
                        self.handleFieldChange(e.target);
                    });
                }
            }, { passive: true, capture: true });

            // Step navigation listeners
            document.addEventListener('click', function(e) {
                if (e.target.matches('[data-form="next-btn"], [data-form="back-btn"], [data-go-to], [data-answer]')) {
                    setTimeout(function() {
                        self.updateSummaryVisibility();
                    }, 300);
                }
            }, { passive: true });

            // Same as main contact listener
            document.addEventListener('change', function(e) {
                if (e.target.matches('[data-step-field-name="sameAsMainContact"]')) {
                    requestAnimationFrame(function() {
                        self.handleSameAsMainContact(e.target);
                    });
                }
            }, { passive: true, capture: false });

            console.log('📋 Set up V4 fixed event listeners');
        },

        setupGooglePlacesMonitoring: function() {
            var self = this;
            
            // Monitor all Google Places fields for changes
            var placesFields = document.querySelectorAll('[data-google-places="true"]');
            
            placesFields.forEach(function(field) {
                // Use MutationObserver to catch Google Places updates
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                            self.handleFieldChange(field);
                        }
                    });
                });
                
                observer.observe(field, { attributes: true, attributeFilter: ['value'] });
                
                // Also watch for property changes (Google Places updates the value property)
                var originalValue = field.value;
                setInterval(function() {
                    if (field.value !== originalValue) {
                        originalValue = field.value;
                        self.handleFieldChange(field);
                    }
                }, 500);
            });
            
            console.log('🌍 Set up Google Places monitoring for ' + placesFields.length + ' fields');
        },

        shouldHandleField: function(element) {
            var fieldName = element.dataset.stepFieldName || element.dataset.stepField;
            var isNavigationElement = element.matches(`
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
            var step = element.closest('[data-form="step"]');
            var isStepHidden = step && (step.style.display === 'none' || step.classList.contains('w-hidden') || step.hasAttribute('hidden'));
            var isInMultistepForm = !!element.closest('[data-form="multistep"]');
            
            return fieldName && !isNavigationElement && !isStepHidden && isInMultistepForm;
        },

        handleFieldChange: function(element) {
            if (!this.mainLibraryReady) return;
            
            var fieldName = element.dataset.stepFieldName || element.dataset.stepField;
            if (!fieldName) return;
            
            try {
                var value = this.getFieldValue(element);
                
                // Handle phone number combination
                if (fieldName === 'phone' || fieldName === 'countryCode') {
                    this.handlePhoneFieldUpdate(element, fieldName, value);
                    return;
                }
                
                // Handle empty fields properly
                if (!value && element.type !== 'checkbox') {
                    // Don't update summary if field is empty, leave placeholder
                    return;
                }
                
                // Find and update summary elements
                var summaryElements = this.findSummaryElements(element, fieldName);
                if (summaryElements.length > 0) {
                    var self = this;
                    summaryElements.forEach(function(summaryElement) {
                        self.updateSummaryDisplay(summaryElement, value, element);
                    });
                    console.log('📊 Updated ' + summaryElements.length + ' summary element(s) for: ' + fieldName + ' = "' + value + '"');
                }
                
            } catch (error) {
                console.warn('Summary update error:', error);
            }
        },

        getFieldValue: function(element) {
            if (element.type === 'radio') {
                var checkedRadio = document.querySelector('input[name="' + element.name + '"]:checked');
                return checkedRadio ? checkedRadio.value : '';
            }
            
            if (element.type === 'checkbox') {
                return element.checked ? (element.value || 'Yes') : 'No';
            }
            
            if (element.tagName.toLowerCase() === 'select') {
                var selectedOption = element.options[element.selectedIndex];
                return selectedOption ? selectedOption.text : '';
            }
            
            return element.value || '';
        },

        handlePhoneFieldUpdate: function(element, fieldType, value) {
            if (!this.mainLibraryReady) return;
            
            console.log('📞 Handling phone field update: ' + fieldType + ' = "' + value + '"');
            
            var stepContainer = element.closest('[data-step-type]');
            if (!stepContainer) return;
            
            var phoneField = stepContainer.querySelector('[data-step-field-name="phone"]');
            var countryCodeField = stepContainer.querySelector('[data-step-field-name="countryCode"]');
            
            if (phoneField && countryCodeField) {
                var phoneValue = this.getFieldValue(phoneField);
                var countryCodeValue = this.getFieldValue(countryCodeField);
                
                // Only update if both fields have values
                if (phoneValue && countryCodeValue && countryCodeValue !== 'Another option') {
                    var formattedPhone = this.formatInternationalPhone(phoneValue, countryCodeValue, countryCodeField);
                    
                    // Update phone summary elements
                    var phoneSummaryElements = this.findSummaryElements(phoneField, 'phone');
                    phoneSummaryElements.forEach(function(element) {
                        element.textContent = formattedPhone;
                        element.classList.remove('summary-placeholder');
                        element.classList.add('summary-updated');
                        setTimeout(function() {
                            element.classList.remove('summary-updated');
                        }, 1500);
                    });
                    
                    console.log('📞 Updated phone summary with: "' + formattedPhone + '"');
                }
            } else {
                console.warn('Could not find both phone and countryCode fields in step');
            }
        },

        formatInternationalPhone: function(phoneNumber, countryCode, countryCodeField) {
            if (!phoneNumber) return '+1 (xxx) xxx-xxxx';
            
            try {
                var countryIso = this.getCountryIsoFromField(countryCodeField, countryCode);
                if (!countryIso) countryIso = 'US';
                
                // Try libphonenumber if available
                if (typeof parsePhoneNumber === 'function') {
                    try {
                        var parsed = parsePhoneNumber(phoneNumber, countryIso);
                        if (parsed && parsed.isValid()) {
                            return parsed.formatInternational();
                        }
                    } catch (e) {
                        console.warn('Libphonenumber parsing failed:', e);
                    }
                }
                
                return this.fallbackPhoneFormat(phoneNumber, countryCode);
            } catch (error) {
                console.warn('Phone formatting error:', error);
                return this.fallbackPhoneFormat(phoneNumber, countryCode);
            }
        },

        getCountryIsoFromField: function(countryCodeField, countryCode) {
            if (!countryCodeField || !countryCode) return null;
            
            var selectedOption = countryCodeField.options[countryCodeField.selectedIndex];
            if (!selectedOption) return null;
            
            // Check if option has ISO data attribute
            if (selectedOption.dataset.iso) {
                return selectedOption.dataset.iso;
            }
            
            // Fallback mapping
            var countryMapping = {
                '+1': 'US', '+44': 'GB', '+33': 'FR', '+49': 'DE', '+81': 'JP',
                '+86': 'CN', '+91': 'IN', '+55': 'BR', '+61': 'AU', '+7': 'RU'
            };
            
            if (countryMapping[countryCode]) {
                return countryMapping[countryCode];
            }
            
            return 'US'; // Default fallback
        },

        fallbackPhoneFormat: function(phoneNumber, countryCode) {
            var digitsOnly = phoneNumber.replace(/\D/g, '');
            var code = countryCode || '+1';
            
            if (!code.startsWith('+')) {
                code = '+' + code;
            }
            
            // US/Canada formatting
            if ((code === '+1' || code === '+1 ') && digitsOnly.length === 10) {
                return '+1 (' + digitsOnly.substr(0, 3) + ') ' + digitsOnly.substr(3, 3) + '-' + digitsOnly.substr(6, 4);
            }
            
            // Other countries - simple format
            return code + ' ' + phoneNumber;
        },

        findSummaryElements: function(formElement, fieldName) {
            var summaryElements = [];
            var stepContainer = formElement.closest('[data-step-type]');
            
            if (!stepContainer) return summaryElements;
            
            var stepType = stepContainer.dataset.stepType;
            var stepNumber = stepContainer.dataset.stepNumber || '1';
            var stepSubtype = stepContainer.dataset.stepSubtype;
            
            // Find matching summary containers with more flexible matching
            var selectors = [
                '[data-summary-type="' + stepType + '"][data-summary-number="' + stepNumber + '"][data-summary-subtype="' + stepSubtype + '"]',
                '[data-summary-type="' + stepType + '"][data-summary-number="' + stepNumber + '"]',
                '[data-summary-type="' + stepType + '"]'
            ];
            
            var summaryContainers = [];
            for (var i = 0; i < selectors.length; i++) {
                summaryContainers = document.querySelectorAll(selectors[i]);
                if (summaryContainers.length > 0) break;
            }
            
            // Find field elements within containers
            summaryContainers.forEach(function(container) {
                var fieldElement = container.querySelector('[data-summary-field="' + fieldName + '"]');
                if (fieldElement) {
                    summaryElements.push(fieldElement);
                }
            });
            
            return summaryElements;
        },

        updateSummaryVisibility: function() {
            console.log('📊 Updating summary card visibility...');
            
            // First hide all cards
            var allSummaryContainers = document.querySelectorAll('[data-summary-type]');
            allSummaryContainers.forEach(function(container) {
                container.style.display = 'none';
                container.classList.add('summary-hidden');
                container.classList.remove('summary-visible');
            });
            
            // Show cards based on current form state
            this.showCompletedSectionSummaries();
            this.showActiveSectionSummaries();
        },

        showCompletedSectionSummaries: function() {
            var self = this;
            
            // Find all completed sections
            var steps = document.querySelectorAll('[data-form="step"]');
            
            steps.forEach(function(step, index) {
                var isCurrentStep = step.style.display !== 'none' && !step.classList.contains('w-hidden');
                
                if (!isCurrentStep && self.isStepCompleted(step)) {
                    var stepContainers = step.querySelectorAll('[data-step-type]');
                    
                    stepContainers.forEach(function(container) {
                        var stepType = container.dataset.stepType;
                        var stepNumber = container.dataset.stepNumber || '1';
                        var stepSubtype = container.dataset.stepSubtype;
                        
                        self.showSummaryCardForSection(stepType, stepNumber, stepSubtype);
                    });
                }
            });
        },

        showActiveSectionSummaries: function() {
            // Show summary for sections that have been interacted with in current step
            var currentStep = document.querySelector('[data-form="step"]:not([style*="display: none"])');
            if (!currentStep) return;
            
            var self = this;
            var activeContainers = currentStep.querySelectorAll('[data-step-type]');
            
            activeContainers.forEach(function(container) {
                // Check if this section has any filled fields
                var fields = container.querySelectorAll('[data-step-field-name], [data-step-field]');
                var hasValues = false;
                
                fields.forEach(function(field) {
                    if (field.value || (field.type === 'checkbox' && field.checked) || (field.type === 'radio' && field.checked)) {
                        hasValues = true;
                    }
                });
                
                if (hasValues) {
                    var stepType = container.dataset.stepType;
                    var stepNumber = container.dataset.stepNumber || '1';
                    var stepSubtype = container.dataset.stepSubtype;
                    
                    self.showSummaryCardForSection(stepType, stepNumber, stepSubtype);
                }
            });
        },

        showSummaryCardForSection: function(stepType, stepNumber, stepSubtype) {
            var selectors = [
                '[data-summary-type="' + stepType + '"][data-summary-number="' + stepNumber + '"][data-summary-subtype="' + stepSubtype + '"]',
                '[data-summary-type="' + stepType + '"][data-summary-number="' + stepNumber + '"]',
                '[data-summary-type="' + stepType + '"]'
            ];
            
            for (var i = 0; i < selectors.length; i++) {
                var containers = document.querySelectorAll(selectors[i]);
                if (containers.length > 0) {
                    containers.forEach(function(container) {
                        container.style.display = '';
                        container.classList.remove('summary-hidden');
                        container.classList.add('summary-visible');
                    });
                    console.log('👁️ Showing summary for: ' + stepType + (stepSubtype ? '-' + stepSubtype : '') + ' #' + stepNumber);
                    break;
                }
            }
        },

        isStepCompleted: function(step) {
            var requiredFields = step.querySelectorAll('[required]');
            var allFilled = true;
            
            requiredFields.forEach(function(field) {
                if (!field.value && !(field.type === 'radio' && step.querySelector('input[name="' + field.name + '"]:checked'))) {
                    allFilled = false;
                }
            });
            
            return allFilled;
        },

        updateSummaryDisplay: function(summaryElement, value, formElement) {
            if (!this.mainLibraryReady) return;
            
            var displayValue = value;
            
            // Special formatting for different field types
            if (formElement.type === 'tel' || formElement.dataset.stepFieldName === 'phone') {
                displayValue = this.formatPhoneForSummary(value, formElement);
            } else if (formElement.type === 'email' || formElement.dataset.stepFieldName === 'email') {
                displayValue = value || 'email@example.com';
            } else if (formElement.dataset.stepFieldName === 'countryCode') {
                var selectedOption = formElement.options[formElement.selectedIndex];
                displayValue = selectedOption?.text || value;
            } else if (formElement.type === 'checkbox' && formElement.dataset.stepFieldName !== 'sameAsMainContact') {
                displayValue = formElement.checked ? 'Yes' : 'No';
            } else if (formElement.type === 'radio') {
                displayValue = value || 'Not selected';
            }
            
            var finalValue = displayValue || this.getPlaceholderText(formElement.dataset.stepFieldName || formElement.dataset.stepField);
            
            summaryElement.textContent = finalValue;
            summaryElement.classList.remove('summary-placeholder');
            summaryElement.classList.add('summary-updated');
            
            setTimeout(function() {
                summaryElement.classList.remove('summary-updated');
            }, 1500);
        },

        formatPhoneForSummary: function(phoneNumber, formElement) {
            if (!phoneNumber) return '+1 (xxx) xxx-xxxx';
            
            var stepContainer = formElement.closest('[data-step-type]');
            var countryCodeField = stepContainer?.querySelector('[data-step-field-name="countryCode"]');
            var countryCode = '+1';
            
            if (countryCodeField && countryCodeField.value) {
                var selectedOption = countryCodeField.options[countryCodeField.selectedIndex];
                if (selectedOption && selectedOption.value !== 'Another option') {
                    countryCode = selectedOption.value;
                }
            }
            
            // US formatting
            if (phoneNumber.length >= 10) {
                var digitsOnly = phoneNumber.replace(/\D/g, '');
                if (digitsOnly.length === 10 && (countryCode === '+1' || countryCode === '+1 ')) {
                    return '+1 (' + digitsOnly.substr(0, 3) + ') ' + digitsOnly.substr(3, 3) + '-' + digitsOnly.substr(6, 4);
                }
            }
            
            return countryCode + ' ' + phoneNumber;
        },

        handleSameAsMainContact: function(element) {
            if (!this.mainLibraryReady || !element.checked) return;
            
            var memberStep = element.closest('[data-step-type="member"]');
            if (!memberStep) return;
            
            var mainContactData = this.getMainContactData();
            
            Object.keys(mainContactData).forEach(function(fieldName) {
                if (['firstName', 'lastName', 'email', 'address', 'city', 'state', 'country', 'postalCode', 'phone'].includes(fieldName)) {
                    var targetField = memberStep.querySelector('[data-step-field-name="' + fieldName + '"]');
                    if (targetField) {
                        targetField.value = mainContactData[fieldName];
                        var event = new Event('input', { bubbles: true });
                        targetField.dispatchEvent(event);
                    }
                }
            });
        },

        getMainContactData: function() {
            var mainContactStep = document.querySelector('[data-step-type="contact"][data-step-subtype="info"]');
            if (!mainContactStep) return {};
            
            var data = {};
            var self = this;
            
            mainContactStep.querySelectorAll('[data-step-field-name], [data-step-field]').forEach(function(field) {
                var fieldName = field.dataset.stepFieldName || field.dataset.stepField;
                if (fieldName) {
                    data[fieldName] = self.getFieldValue(field);
                }
            });
            
            return data;
        },

        getPlaceholderText: function(fieldName) {
            var placeholders = {
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
                managerName: 'Manager Name',
                trustees: 'Trustee Names',
                trustee1: 'Trustee Name',
                trustee2: 'Trustee Name',
                trustee3: 'Trustee Name'
            };
            
            return placeholders[fieldName] || 'Not specified';
        },

        populateAllValues: function() {
            if (!this.mainLibraryReady) return;
            
            console.log('📋 Populating all current values (V4)...');
            
            var formFields = document.querySelectorAll('[data-step-field-name], [data-step-field]');
            var updatedCount = 0;
            var self = this;
            
            formFields.forEach(function(field) {
                if (self.shouldHandleField(field) && 
                    (field.value || (field.type === 'radio' && field.checked) || (field.type === 'checkbox' && field.checked))) {
                    
                    // Add delay to ensure proper processing
                    setTimeout(function() {
                        self.handleFieldChange(field);
                    }, 100 * updatedCount);
                    
                    updatedCount++;
                }
            });
            
            console.log('📊 Populating ' + updatedCount + ' field values');
        }
    };

    // Initialize
    console.log('📦 Loading Summary Cards V4 (Fixed)');
    WebflowSummaryCards.init();
    
    // Global reference for debugging
    window.WebflowSummaryCardsV4 = WebflowSummaryCards;

})(window, document); 