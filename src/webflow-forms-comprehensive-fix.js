/**
 * Webflow Forms - Comprehensive Fix for All Issues
 * - Fixes branched logic validation issues
 * - Fixes phone formatting errors  
 * - Improves error message handling
 * - Enhanced conditional field validation
 * - Unified phone-country field mapping
 * @version 3.0.0-comprehensive
 * @author Chris Brummer
 */

(function(window, document) {
    'use strict';

    console.log('🚀 Loading Comprehensive Forms Fix v3.0.0');

    // Prevent multiple initialization
    if (window.WebflowFormsComprehensive) {
        console.warn('⚠️ Comprehensive Forms already loaded, skipping...');
        return;
    }

    const WebflowFormsComprehensive = {
        version: '3.0.0-comprehensive',
        initialized: false,
        branchingData: new Map(),
        phoneFieldMappings: new Map(),
        validationData: new Map(),
        activeStepItems: new Map(),
        currentStep: 0,
        totalSteps: 0,
        
        // Enhanced logging system
        log: {
            info: (msg, data) => console.log(`📋 COMPREHENSIVE: ${msg}`, data || ''),
            success: (msg, data) => console.log(`✅ COMPREHENSIVE: ${msg}`, data || ''),
            warning: (msg, data) => console.warn(`⚠️ COMPREHENSIVE: ${msg}`, data || ''),
            error: (msg, data) => console.error(`❌ COMPREHENSIVE: ${msg}`, data || ''),
            debug: (msg, data) => console.log(`🔍 DEBUG: ${msg}`, data || ''),
            branching: (msg, data) => console.log(`🌳 BRANCHING: ${msg}`, data || ''),
            phone: (msg, data) => console.log(`📞 PHONE: ${msg}`, data || ''),
            validation: (msg, data) => console.log(`🎯 VALIDATION: ${msg}`, data || ''),
            step: (msg, data) => console.log(`👣 STEP: ${msg}`, data || '')
        },

        init: function() {
            this.log.info('Starting comprehensive form fix initialization...');
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => this.setup(), 500);
                });
            } else {
                setTimeout(() => this.setup(), 500);
            }
        },

        setup: function() {
            this.log.info('Setting up comprehensive form fix system...');
            
            try {
                this.initializeStepVisibility();
                this.initializeErrorSystem();
                this.initializeBranchingLogic();
                this.initializePhoneSystem();
                this.initializeValidationSystem();
                this.setupEventListeners();
                
                this.initialized = true;
                this.log.success('Comprehensive form fix system ready!');
                
                // Export debug methods to global scope
                window.debugFormsComprehensive = {
                    getValidationData: () => this.validationData,
                    getBranchingData: () => this.branchingData,
                    getPhoneFieldMappings: () => this.phoneFieldMappings,
                    getActiveStepItems: () => this.activeStepItems,
                    validateStep: () => this.validateCurrentStep(),
                    clearErrors: () => this.clearAllErrors(),
                    getCurrentStep: () => this.currentStep,
                    getTotalSteps: () => this.totalSteps,
                    version: this.version
                };
                
            } catch (error) {
                this.log.error('Setup failed:', error);
            }
        },

        // Initialize step visibility control
        initializeStepVisibility: function() {
            this.log.info('Initializing multi-step visibility control...');
            
            const steps = document.querySelectorAll('[data-form="step"]');
            this.totalSteps = steps.length;
            
            if (this.totalSteps === 0) {
                this.log.warning('No steps found with [data-form="step"]');
                return;
            }
            
            // Hide all steps except the first one
            steps.forEach((step, index) => {
                if (index === 0) {
                    step.style.display = 'block';
                    this.currentStep = 0;
                    this.log.step(`Showing step ${index + 1}`);
                } else {
                    step.style.display = 'none';
                    this.log.step(`Hiding step ${index + 1}`);
                }
            });
            
            this.log.success(`Step visibility initialized - ${this.totalSteps} steps found, showing step 1`);
        },

        // Show specific step
        showStep: function(stepIndex) {
            const steps = document.querySelectorAll('[data-form="step"]');
            
            if (stepIndex < 0 || stepIndex >= steps.length) {
                this.log.error(`Invalid step index: ${stepIndex}`);
                return false;
            }
            
            // Hide all steps
            steps.forEach((step, index) => {
                step.style.display = index === stepIndex ? 'block' : 'none';
            });
            
            this.currentStep = stepIndex;
            this.log.step(`Switched to step ${stepIndex + 1}`);
            return true;
        },

        // Navigate to next step
        nextStep: function() {
            if (this.currentStep < this.totalSteps - 1) {
                return this.showStep(this.currentStep + 1);
            }
            return false;
        },

        // Navigate to previous step
        previousStep: function() {
            if (this.currentStep > 0) {
                return this.showStep(this.currentStep - 1);
            }
            return false;
        },

        // Fix Issue #4: Error Messages Always Visible
        initializeErrorSystem: function() {
            this.log.info('Initializing comprehensive error system...');
            
            // Hide all error messages initially
            const errorElements = document.querySelectorAll('.error-message, .error-state, [class*="error"]');
            let hiddenCount = 0;
            
            errorElements.forEach(element => {
                if (element.textContent.trim() && !element.matches('input, select, textarea')) {
                    element.style.display = 'none';
                    hiddenCount++;
                }
            });

            // Remove error styling from all fields initially
            const fieldsWithErrors = document.querySelectorAll('.field-error, [class*="error"]');
            let cleanedCount = 0;
            
            fieldsWithErrors.forEach(field => {
                if (field.matches('input, select, textarea')) {
                    this.removeErrorStyling(field);
                    cleanedCount++;
                }
            });

            this.log.success(`Error system initialized - Hidden ${hiddenCount} error messages, cleaned ${cleanedCount} field errors`);
        },

        // Fix Issue #1: Enhanced Branching Logic with Proper Step Item Detection
        initializeBranchingLogic: function() {
            this.log.info('Initializing comprehensive branching logic...');
            
            // Map all branching controls and their targets
            const branchingInputs = document.querySelectorAll('input[type="radio"][name*="Type"], input[type="radio"][name*="Management"]');
            
            branchingInputs.forEach(input => {
                const branchKey = input.name;
                if (!this.branchingData.has(branchKey)) {
                    this.branchingData.set(branchKey, {
                        name: branchKey,
                        options: [],
                        selected: null,
                        targetSteps: new Map(),
                        stepElement: input.closest('[data-form="step"]')
                    });
                }
                
                const branchData = this.branchingData.get(branchKey);
                branchData.options.push(input.value);
                
                // Map option to target step item
                const targetStepItem = this.determineTargetStepItem(input);
                if (targetStepItem) {
                    branchData.targetSteps.set(input.value, targetStepItem);
                    this.log.branching(`Mapped ${input.value} → ${targetStepItem}`);
                }
            });

            // Initialize active step items tracking
            this.updateActiveStepItems();

            this.log.success(`Mapped ${this.branchingData.size} branching patterns`);
        },

        // Determine target step item from radio input
        determineTargetStepItem: function(input) {
            const value = input.value.toLowerCase();
            
            // Check for data-go-to attribute first
            const goTo = input.getAttribute('data-go-to');
            if (goTo) {
                return goTo;
            }
            
            // Fallback to value-based detection
            if (value.includes('individual')) return 'individual';
            if (value.includes('entity')) return 'entity';
            if (value.includes('trust')) return 'trust';
            if (value.includes('manager')) return 'manager-managed';
            if (value.includes('member')) return 'member-managed';
            
            return null;
        },

        // Update active step items based on current radio selections
        updateActiveStepItems: function() {
            this.log.debug('Updating active step items...');
            
            const steps = document.querySelectorAll('[data-form="step"]');
            
            steps.forEach(step => {
                const stepId = step.id || 'unknown';
                const radioInputs = step.querySelectorAll('input[type="radio"]:checked');
                const activeItems = [];
                
                radioInputs.forEach(radio => {
                    const targetItem = this.determineTargetStepItem(radio);
                    if (targetItem) {
                        activeItems.push(targetItem);
                    }
                });
                
                this.activeStepItems.set(stepId, activeItems);
                this.log.debug(`Step ${stepId} active items:`, activeItems);
            });
        },

        // Fix Issue #2: Comprehensive Phone System
        initializePhoneSystem: function() {
            this.log.info('Initializing comprehensive phone system...');
            
            // Map phone fields to country code fields
            const phoneFields = document.querySelectorAll('input[type="tel"], input[data-step-field-name="phone"]');
            
            phoneFields.forEach(phoneField => {
                const stepContainer = phoneField.closest('[data-step-type], [data-form="step"]');
                if (stepContainer) {
                    // Look for country code field in same container
                    const countryCodeField = stepContainer.querySelector(
                        'select[data-country-code="true"], select[data-step-field-name="countryCode"]'
                    );
                    
                    if (countryCodeField) {
                        const phoneFieldId = phoneField.id || phoneField.name;
                        const countryFieldId = countryCodeField.id || countryCodeField.name;
                        
                        this.phoneFieldMappings.set(phoneFieldId, {
                            phoneField: phoneField,
                            countryCodeField: countryCodeField,
                            stepContainer: stepContainer
                        });
                        
                        this.log.phone(`Mapped phone field: ${phoneFieldId} ↔ ${countryFieldId}`);
                        
                        // Set up phone formatting
                        this.setupPhoneFormatting(phoneField, countryCodeField);
                    }
                }
            });
            
            this.log.success(`Phone system initialized - Mapped ${this.phoneFieldMappings.size} phone field pairs`);
        },

        // Setup phone formatting for a field pair
        setupPhoneFormatting: function(phoneField, countryCodeField) {
            // Initial format setup
            this.updatePhoneFormat(phoneField, countryCodeField);
            
            // Listen for country changes
            countryCodeField.addEventListener('change', () => {
                this.log.phone(`Country changed for ${phoneField.id}`);
                this.updatePhoneFormat(phoneField, countryCodeField);
                this.formatPhoneNumber(phoneField, countryCodeField);
            });
            
            // Listen for phone input
            phoneField.addEventListener('input', () => {
                this.formatPhoneNumber(phoneField, countryCodeField);
            });
        },

        // Update phone format based on selected country
        updatePhoneFormat: function(phoneField, countryCodeField) {
            const selectedOption = countryCodeField.options[countryCodeField.selectedIndex];
            if (!selectedOption) return;
            
            let countryCode = '+1';
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
            
            phoneField._currentCountryCode = countryCode;
            phoneField._countryISO = this.getCountryISOFromCode(countryCode);
            
            this.log.phone(`Updated phone format: ${phoneField.id} → ${countryCode} (${phoneField._countryISO})`);
        },

        // Format phone number as user types
        formatPhoneNumber: function(phoneField, countryCodeField) {
            const value = phoneField.value;
            const countryISO = phoneField._countryISO || 'US';
            
            if (!value) return;
            
            try {
                if (typeof window.AsYouType !== 'undefined') {
                    const formatter = new window.AsYouType(countryISO);
                    const formatted = formatter.input(value);
                    if (formatted && formatted !== value) {
                        phoneField.value = formatted;
                    }
                }
            } catch (error) {
                this.log.phone('Phone formatting error:', error);
            }
        },

        // Get country ISO code from dialing code
        getCountryISOFromCode: function(dialingCode) {
            const mapping = {
                '+1': 'US', '+44': 'GB', '+33': 'FR', '+49': 'DE', '+81': 'JP',
                '+86': 'CN', '+91': 'IN', '+55': 'BR', '+61': 'AU', '+7': 'RU',
                '+39': 'IT', '+34': 'ES', '+31': 'NL', '+41': 'CH', '+46': 'SE',
                '+47': 'NO', '+45': 'DK', '+358': 'FI', '+43': 'AT', '+32': 'BE'
            };
            return mapping[dialingCode] || 'US';
        },

        // Enhanced validation system that respects branching
        initializeValidationSystem: function() {
            this.log.info('Initializing comprehensive validation system...');
            
            // Map all required fields and conditional fields
            const allFields = document.querySelectorAll('[required], [data-require-for-subtypes]');
            
            allFields.forEach(field => {
                const fieldId = field.id || field.name;
                const stepContainer = field.closest('[data-step-type], [data-form="step"]');
                const stepItemContainer = field.closest('[data-step-item], [data-step-subtype], .step_item');
                
                const validationInfo = {
                    element: field,
                    fieldId: fieldId,
                    stepId: stepContainer?.id || 'unknown',
                    stepContainer: stepContainer,
                    stepItemContainer: stepItemContainer,
                    isRequired: field.hasAttribute('required'),
                    isConditionalRequired: field.hasAttribute('data-require-for-subtypes'),
                    conditionalSubtypes: field.getAttribute('data-require-for-subtypes')?.split(',').map(s => s.trim()) || [],
                    branchType: this.getBranchTypeForField(field),
                    isBranchDependent: !!stepItemContainer
                };
                
                this.validationData.set(fieldId, validationInfo);
                this.log.validation(`Mapped validation: ${fieldId} (required: ${validationInfo.isRequired}, conditional: ${validationInfo.isConditionalRequired}, branch: ${validationInfo.branchType || 'none'})`);
            });

            this.log.success(`Mapped ${this.validationData.size} validation rules`);
        },

        // Get branch type for a field
        getBranchTypeForField: function(field) {
            const container = field.closest('[data-step-item], [data-step-subtype], .step_item');
            if (!container) return null;
            
            // Check data-answer attribute
            const dataAnswer = container.getAttribute('data-answer');
            if (dataAnswer) {
                if (dataAnswer.includes('individual')) return 'individual';
                if (dataAnswer.includes('entity')) return 'entity';
                if (dataAnswer.includes('trust')) return 'trust';
            }
            
            // Check data-step-subtype
            const stepSubtype = container.getAttribute('data-step-subtype');
            if (stepSubtype) {
                if (stepSubtype.includes('individual')) return 'individual';
                if (stepSubtype.includes('entity')) return 'entity';
                if (stepSubtype.includes('trust')) return 'trust';
            }
            
            // Check class names
            const className = container.className;
            if (className.includes('individual')) return 'individual';
            if (className.includes('entity')) return 'entity';
            if (className.includes('trust')) return 'trust';
            
            return null;
        },

        // Enhanced step validation that properly checks branching state
        validateCurrentStep: function() {
            this.log.validation('Starting comprehensive step validation...');
            
            const currentStep = document.querySelector('[data-form="step"]:not([style*="display: none"]):not(.w-hidden)');
            if (!currentStep) {
                this.log.warning('No current step found');
                return true;
            }

            const stepId = currentStep.id || 'unknown';
            this.log.validation(`Validating step: ${stepId}`);
            
            // Update active step items first
            this.updateActiveStepItems();
            
            // Get all fields in current step
            const fieldsInStep = currentStep.querySelectorAll('input, select, textarea');
            let invalidFields = [];
            
            fieldsInStep.forEach(field => {
                // Skip radio buttons - they're handled separately
                if (field.type === 'radio') return;
                
                const fieldId = field.id || field.name;
                const validationInfo = this.validationData.get(fieldId);
                
                if (validationInfo) {
                    // Check if field should be validated based on current state
                    if (this.shouldValidateField(field, validationInfo)) {
                        if (!this.isFieldValid(field)) {
                            invalidFields.push(field);
                            this.applyErrorStyling(field);
                            this.log.validation(`❌ Invalid: ${fieldId} (value: "${field.value}")`);
                        } else {
                            this.removeErrorStyling(field);
                            this.log.validation(`✅ Valid: ${fieldId} (value: "${field.value}")`);
                        }
                    } else {
                        // Field should not be validated - clear any errors
                        this.removeErrorStyling(field);
                        this.log.validation(`⏭️ Skipped: ${fieldId} (not required in current context)`);
                    }
                }
            });

            // Validate radio groups
            const radioGroupsValid = this.validateRadioGroups(currentStep);
            
            const isValid = invalidFields.length === 0 && radioGroupsValid;
            this.log.validation(`Step validation result: ${isValid ? '✅ PASSED' : '❌ FAILED'} (${invalidFields.length} field errors, radio groups: ${radioGroupsValid})`);
            
            return isValid;
        },

        // Determine if field should be validated based on current state
        shouldValidateField: function(field, validationInfo) {
            // Always validate non-branch-dependent required fields
            if (validationInfo.isRequired && !validationInfo.isBranchDependent) {
                return true;
            }
            
            // For branch-dependent fields, check if they're in an active step item
            if (validationInfo.isBranchDependent) {
                const stepItem = validationInfo.stepItemContainer;
                if (!stepItem) return false;
                
                // Check if step item is visible
                const isVisible = stepItem.offsetParent !== null && 
                                getComputedStyle(stepItem).display !== 'none';
                
                if (!isVisible) {
                    this.log.debug(`Field ${validationInfo.fieldId} in hidden step item`);
                    return false;
                }
                
                // For conditional required fields, check subtype match
                if (validationInfo.isConditionalRequired) {
                    const currentSubtype = this.getCurrentSubtypeForStepItem(stepItem);
                    if (currentSubtype && validationInfo.conditionalSubtypes.includes(currentSubtype)) {
                        this.log.debug(`Field ${validationInfo.fieldId} matches current subtype: ${currentSubtype}`);
                        return true;
                    } else {
                        this.log.debug(`Field ${validationInfo.fieldId} does not match current subtype: ${currentSubtype}`);
                        return false;
                    }
                }
                
                // For regular required fields in step items, validate if visible
                return validationInfo.isRequired;
            }
            
            return false;
        },

        // Get current subtype for a step item
        getCurrentSubtypeForStepItem: function(stepItem) {
            // Check data-answer attribute
            const dataAnswer = stepItem.getAttribute('data-answer');
            if (dataAnswer) {
                if (dataAnswer.includes('individual')) return 'individual';
                if (dataAnswer.includes('entity')) return 'entity';
                if (dataAnswer.includes('trust')) return 'trust';
            }
            
            // Check data-step-subtype
            const stepSubtype = stepItem.getAttribute('data-step-subtype');
            if (stepSubtype) {
                return stepSubtype;
            }
            
            // Check parent step for active radio selection
            const step = stepItem.closest('[data-form="step"]');
            if (step) {
                const checkedRadios = step.querySelectorAll('input[type="radio"]:checked');
                for (const radio of checkedRadios) {
                    const targetItem = this.determineTargetStepItem(radio);
                    if (targetItem) {
                        if (targetItem.includes('individual')) return 'individual';
                        if (targetItem.includes('entity')) return 'entity';
                        if (targetItem.includes('trust')) return 'trust';
                    }
                }
            }
            
            return null;
        },

        // Validate radio groups in current step
        validateRadioGroups: function(currentStep) {
            const radioGroups = new Map();
            const radios = currentStep.querySelectorAll('input[type="radio"]');
            
            // Group radios by name
            radios.forEach(radio => {
                const groupName = radio.name;
                if (!radioGroups.has(groupName)) {
                    radioGroups.set(groupName, []);
                }
                radioGroups.get(groupName).push(radio);
            });
            
            let allValid = true;
            
            // Validate each group
            radioGroups.forEach((groupRadios, groupName) => {
                const isRequired = groupRadios.some(radio => radio.hasAttribute('required'));
                const hasSelection = groupRadios.some(radio => radio.checked);
                
                if (isRequired && !hasSelection) {
                    allValid = false;
                    this.log.validation(`❌ Radio group "${groupName}" validation failed - no selection`);
                    
                    // Show error for radio group
                    this.showRadioGroupError(groupRadios);
                } else {
                    this.hideRadioGroupError(groupRadios);
                    if (isRequired) {
                        this.log.validation(`✅ Radio group "${groupName}" validation passed`);
                    }
                }
            });
            
            return allValid;
        },

        // Field validation logic
        isFieldValid: function(field) {
            const value = field.value?.trim() || '';
            
            if (field.type === 'email') {
                return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            }
            
            if (field.type === 'tel') {
                return value && value.length >= 10;
            }
            
            if (field.tagName === 'SELECT') {
                return field.selectedIndex > 0 && value !== '' && value !== 'Another option';
            }
            
            return value !== '';
        },

        // Error styling methods
        applyErrorStyling: function(field) {
            field.classList.add('field-error');
            
            // Show associated error message
            const errorElement = this.findErrorElement(field);
            if (errorElement) {
                errorElement.style.display = 'block';
            }
        },

        removeErrorStyling: function(field) {
            field.classList.remove('field-error');
            
            // Hide associated error message
            const errorElement = this.findErrorElement(field);
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        },

        findErrorElement: function(field) {
            // Look for error element in same container
            const container = field.closest('.multi-form_field-wrapper, .form_field-wrapper, .field-wrapper');
            if (container) {
                const errorElement = container.querySelector('.error-message, .error-state, [class*="error"]:not(input):not(select):not(textarea)');
                if (errorElement && errorElement.textContent.trim()) {
                    return errorElement;
                }
            }
            
            // Fallback to ID-based lookup
            const fieldId = field.id;
            return document.querySelector(`[data-error-for="${fieldId}"], .error-message[data-field="${fieldId}"]`);
        },

        // Radio group error handling
        showRadioGroupError: function(radioGroup) {
            const firstRadio = radioGroup[0];
            const container = firstRadio.closest('.multi-form_field-wrapper, .form_field-wrapper, .field-wrapper');
            if (container) {
                const errorElement = container.querySelector('.error-message, .error-state, [class*="error"]:not(input):not(select):not(textarea)');
                if (errorElement) {
                    errorElement.style.display = 'block';
                }
            }
        },

        hideRadioGroupError: function(radioGroup) {
            const firstRadio = radioGroup[0];
            const container = firstRadio.closest('.multi-form_field-wrapper, .form_field-wrapper, .field-wrapper');
            if (container) {
                const errorElement = container.querySelector('.error-message, .error-state, [class*="error"]:not(input):not(select):not(textarea)');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            }
        },

        // Event listeners
        setupEventListeners: function() {
            this.log.info('Setting up comprehensive event listeners...');
            
            // Branching change listeners
            document.addEventListener('change', (event) => {
                if (event.target.matches('input[type="radio"][name*="Type"], input[type="radio"][name*="Management"]')) {
                    this.handleBranchingChange(event.target);
                }
            });

            // Real-time validation listeners
            document.addEventListener('input', (event) => {
                if (event.target.matches('input, select, textarea')) {
                    setTimeout(() => this.handleFieldChange(event.target), 100);
                }
            });

            // Navigation listeners
            document.addEventListener('click', (event) => {
                if (event.target.matches('[data-form="next-btn"]') || 
                    event.target.closest('[data-form="next-btn"]')) {
                    this.handleNextButton(event);
                }
            });

            this.log.success('Event listeners registered');
        },

        // Event handlers
        handleBranchingChange: function(radioInput) {
            const branchName = radioInput.name;
            const selectedValue = radioInput.value;
            
            this.log.branching(`Branch change: ${branchName} → ${selectedValue}`);
            
            // Update branching data
            if (this.branchingData.has(branchName)) {
                this.branchingData.get(branchName).selected = selectedValue;
            }

            // Update active step items
            this.updateActiveStepItems();

            // Clear validation errors for fields that are no longer relevant
            this.clearIrrelevantValidationErrors();
        },

        clearIrrelevantValidationErrors: function() {
            this.validationData.forEach((validationInfo, fieldId) => {
                if (!this.shouldValidateField(validationInfo.element, validationInfo)) {
                    this.removeErrorStyling(validationInfo.element);
                    this.log.debug(`Cleared errors for field no longer relevant: ${fieldId}`);
                }
            });
        },

        handleFieldChange: function(field) {
            const fieldId = field.id || field.name;
            const validationInfo = this.validationData.get(fieldId);
            
            if (validationInfo && this.shouldValidateField(field, validationInfo)) {
                if (this.isFieldValid(field)) {
                    this.removeErrorStyling(field);
                } else if (field.value.trim()) { // Only show error if user has started typing
                    this.applyErrorStyling(field);
                }
            }
        },

        handleNextButton: function(event) {
            this.log.info('Next button clicked - running comprehensive validation...');
            
            if (!this.validateCurrentStep()) {
                event.preventDefault();
                event.stopPropagation();
                this.log.warning('Navigation blocked due to validation errors');
                return false;
            }
            
            this.log.success('Validation passed - proceeding to next step');
            
            // Navigate to next step
            if (this.nextStep()) {
                event.preventDefault();
                event.stopPropagation();
                this.log.step(`Advanced to step ${this.currentStep + 1}`);
            }
            
            return true;
        },

        // Debug helper methods
        clearAllErrors: function() {
            this.validationData.forEach((validationInfo) => {
                this.removeErrorStyling(validationInfo.element);
            });
            this.log.info('All errors cleared');
        },

        // Phone summary formatting for summary cards
        formatPhoneForSummary: function(phoneValue, sourceField) {
            if (!phoneValue) return '+1 (xxx) xxx-xxxx';
            
            const phoneMapping = this.phoneFieldMappings.get(sourceField.id || sourceField.name);
            if (phoneMapping && phoneMapping.countryCodeField) {
                const countryCode = phoneMapping.countryCodeField.value || '+1';
                // Return formatted phone with country code
                return phoneValue.startsWith('+') ? phoneValue : `${countryCode} ${phoneValue}`;
            }
            
            return phoneValue;
        }
    };

    // Initialize the comprehensive fix
    WebflowFormsComprehensive.init();
    
    // Export to global scope
    window.WebflowFormsComprehensive = WebflowFormsComprehensive;

})(window, document); 