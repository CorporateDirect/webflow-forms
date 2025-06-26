/**
 * Webflow Multi-Step Form Summary Cards V3
 * Handles hiding/showing summary cards and updating with real form data
 * Version: 1.0.2-progressive
 */
(function(window, document) {
    'use strict';

    var WebflowSummaryCards = {
        version: '1.0.2-progressive',
        mainLibraryReady: false,
        
        init: function() {
            console.log('🔄 Summary Cards V3 (Progressive Display) starting...');
            
            var checkReady = function() {
                var mainLibraryExists = typeof window.WebflowFieldEnhancer !== 'undefined';
                var formExists = document.querySelector('[data-form="multistep"]');
                var stepsExist = document.querySelectorAll('[data-form="step"]').length > 0;
                
                if (mainLibraryExists && formExists && stepsExist) {
                    console.log('✅ Main library and form ready, initializing V3 summary cards...');
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
            console.log('🔄 Initializing Summary Card System V3 (Progressive Display)...');
            
            if (!this.mainLibraryReady) {
                console.warn('❌ Main library not ready, aborting summary setup');
                return;
            }

            // Step 1: Hide all summary cards and clean up dummy text
            this.hideAllSummaryCards();
            this.initializePlaceholderText();
            
            // Step 2: Set up event listeners
            this.setupProgressiveEventListeners();
            
            // Step 3: Show cards for already completed sections
            setTimeout(() => {
                this.showRelevantSummaryCards();
                this.populateInitialValues();
            }, 500);
        },

        hideAllSummaryCards: function() {
            console.log('👁️ Hiding all summary cards initially...');
            
            var summaryContainers = document.querySelectorAll('[data-summary-type]');
            var hiddenCount = 0;
            
            summaryContainers.forEach(function(container) {
                // Hide the container
                container.style.display = 'none';
                container.classList.add('summary-hidden');
                hiddenCount++;
            });
            
            console.log('👁️ Hidden ' + hiddenCount + ' summary containers');
        },

        initializePlaceholderText: function() {
            console.log('📝 Initializing placeholder text...');
            
            var summaryFields = document.querySelectorAll('[data-summary-field]');
            var placeholderCount = 0;
            
            summaryFields.forEach((field) => {
                var fieldName = field.getAttribute('data-summary-field');
                var placeholder = this.getPlaceholderText(fieldName);
                
                // Only replace if it looks like dummy text
                var currentText = field.textContent.trim();
                if (this.isDummyText(currentText, fieldName)) {
                    field.textContent = placeholder;
                    field.classList.add('summary-placeholder');
                    placeholderCount++;
                }
            });
            
            console.log('📝 Set ' + placeholderCount + ' placeholder texts');
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

        showRelevantSummaryCards: function() {
            console.log('📊 Checking which summary cards should be visible...');
            
            var currentStep = document.querySelector('[data-form="step"]:not([style*="display: none"])');
            if (!currentStep) return;

            var currentStepIndex = Array.from(document.querySelectorAll('[data-form="step"]')).indexOf(currentStep);
            
            // Show summary cards for completed sections
            var completedSections = this.getCompletedSections(currentStepIndex);
            
            completedSections.forEach((section) => {
                this.showSummaryCardsForSection(section);
            });
        },

        getCompletedSections: function(currentStepIndex) {
            var sections = [];
            
            // Check each previous step for completion
            for (var i = 0; i < currentStepIndex; i++) {
                var step = document.querySelectorAll('[data-form="step"]')[i];
                if (step && this.isStepCompleted(step)) {
                    var stepInfo = this.getStepInfo(step);
                    if (stepInfo) {
                        sections.push(stepInfo);
                    }
                }
            }
            
            return sections;
        },

        isStepCompleted: function(step) {
            var requiredFields = step.querySelectorAll('[required]');
            var allFilled = true;
            
            requiredFields.forEach(function(field) {
                if (!field.value || (field.type === 'radio' && !step.querySelector('input[name="' + field.name + '"]:checked'))) {
                    allFilled = false;
                }
            });
            
            return allFilled;
        },

        getStepInfo: function(step) {
            var stepTypeElement = step.querySelector('[data-step-type]');
            if (!stepTypeElement) return null;
            
            return {
                type: stepTypeElement.dataset.stepType,
                number: stepTypeElement.dataset.stepNumber || '1',
                subtype: stepTypeElement.dataset.stepSubtype || ''
            };
        },

        showSummaryCardsForSection: function(section) {
            var selector = '[data-summary-type="' + section.type + '"]';
            if (section.number) {
                selector += '[data-summary-number="' + section.number + '"]';
            }
            if (section.subtype) {
                selector += '[data-summary-subtype="' + section.subtype + '"]';
            }
            
            var summaryContainers = document.querySelectorAll(selector);
            
            summaryContainers.forEach(function(container) {
                container.style.display = '';
                container.classList.remove('summary-hidden');
                container.classList.add('summary-visible');
                console.log('👁️ Showing summary for: ' + section.type + (section.subtype ? '-' + section.subtype : ''));
            });
        },

        setupProgressiveEventListeners: function() {
            var self = this;
            
            document.querySelectorAll('[data-form="multistep"]').forEach(function(form) {
                console.log('📋 Setting up V3 progressive listeners for form:', form.id || 'unnamed');
                
                // Field change listeners
                document.addEventListener('input', function(e) {
                    if (form.contains(e.target) && self.shouldHandleField(e.target)) {
                        requestAnimationFrame(function() {
                            self.handleFieldChange(e.target);
                        });
                    }
                }, { passive: true, capture: false });

                document.addEventListener('change', function(e) {
                    if (form.contains(e.target) && self.shouldHandleField(e.target)) {
                        requestAnimationFrame(function() {
                            self.handleFieldChange(e.target);
                        });
                    }
                }, { passive: true, capture: false });

                // Step navigation listeners
                document.addEventListener('click', function(e) {
                    if (e.target.matches('[data-form="next-btn"], [data-form="back-btn"]')) {
                        setTimeout(function() {
                            self.showRelevantSummaryCards();
                        }, 300);
                    }
                }, { passive: true });

                // Same as main contact listener
                document.addEventListener('change', function(e) {
                    if (form.contains(e.target) && e.target.matches('[data-step-field-name="sameAsMainContact"]')) {
                        requestAnimationFrame(function() {
                            self.handleSameAsMainContact(e.target);
                        });
                    }
                }, { passive: true, capture: false });
            });
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
            
            return fieldName && !isNavigationElement && !isStepHidden;
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
                '+1': 'US',
                '+44': 'GB',
                '+33': 'FR',
                '+49': 'DE',
                '+81': 'JP',
                '+86': 'CN',
                '+91': 'IN',
                '+55': 'BR',
                '+61': 'AU',
                '+7': 'RU'
            };
            
            if (countryMapping[countryCode]) {
                return countryMapping[countryCode];
            }
            
            // Try to extract from option text
            var match = selectedOption.text.match(/\(\+(\d+)\)/);
            if (match) {
                return countryMapping['+' + match[1]];
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
            
            // Find matching summary containers
            var summaryContainers = document.querySelectorAll('[data-summary-type="' + stepType + '"][data-summary-number="' + stepNumber + '"][data-summary-subtype="' + stepSubtype + '"]');
            
            // Fallback searches if no exact match
            if (summaryContainers.length === 0) {
                summaryContainers = document.querySelectorAll('[data-summary-type="' + stepType + '"][data-summary-number="' + stepNumber + '"]');
            }
            if (summaryContainers.length === 0) {
                summaryContainers = document.querySelectorAll('[data-summary-type="' + stepType + '"]');
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
                managerName: 'Manager Name'
            };
            
            return placeholders[fieldName] || 'Not specified';
        },

        populateInitialValues: function() {
            if (!this.mainLibraryReady) return;
            
            console.log('📋 Populating initial summary values (V3)...');
            
            var formFields = document.querySelectorAll('[data-step-field-name], [data-step-field]');
            var updatedCount = 0;
            var self = this;
            
            formFields.forEach(function(field) {
                if (self.shouldHandleField(field) && 
                    (field.value || (field.type === 'radio' && field.checked) || (field.type === 'checkbox' && field.checked))) {
                    self.handleFieldChange(field);
                    updatedCount++;
                }
            });
            
            console.log('📊 Populated ' + updatedCount + ' initial summary values');
        }
    };

    // Initialize
    console.log('📦 Loading Summary Cards V3 (Progressive Display)');
    WebflowSummaryCards.init();
    
    // Global reference for debugging
    window.WebflowSummaryCardsV3 = WebflowSummaryCards;

})(window, document); 