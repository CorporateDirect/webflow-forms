/**
 * Webflow Forms - Enhanced Debug Version with Comprehensive Fixes
 * - Fixes branched logic validation issues
 * - Fixes phone formatting errors  
 * - Improves error message handling
 * - Enhanced console logging for debugging
 * @version 2.0.0-debug
 * @author Chris Brummer
 */

(function(window, document) {
    'use strict';

    console.log('🚀 Loading Enhanced Debug Forms Library v2.0.0');

    // Prevent multiple initialization
    if (window.WebflowFormsEnhanced) {
        console.warn('⚠️ Enhanced Forms already loaded, skipping...');
        return;
    }

    const WebflowFormsEnhanced = {
        version: '2.0.0-debug',
        initialized: false,
        validationData: new Map(),
        branchingData: new Map(),
        fieldProcessingQueue: new Set(),
        
        // Enhanced logging system
        log: {
            info: (msg, data) => console.log(`📋 FORMS: ${msg}`, data || ''),
            success: (msg, data) => console.log(`✅ FORMS: ${msg}`, data || ''),
            warning: (msg, data) => console.warn(`⚠️ FORMS: ${msg}`, data || ''),
            error: (msg, data) => console.error(`❌ FORMS: ${msg}`, data || ''),
            debug: (msg, data) => console.log(`🔍 DEBUG: ${msg}`, data || ''),
            validation: (msg, data) => console.log(`🎯 VALIDATION: ${msg}`, data || ''),
            branching: (msg, data) => console.log(`🌳 BRANCHING: ${msg}`, data || '')
        },

        init: function() {
            this.log.info('Starting enhanced form initialization...');
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => this.setup(), 500);
                });
            } else {
                setTimeout(() => this.setup(), 500);
            }
        },

        setup: function() {
            this.log.info('Setting up enhanced form system...');
            
            try {
                this.initializeErrorSystem();
                this.initializeBranchingLogic();
                this.initializeValidationSystem();
                this.setupEventListeners();
                this.initialized = true;
                this.log.success('Enhanced form system ready!');
                
                // Export debug methods
                window.debugForms = {
                    getValidationData: () => this.validationData,
                    getBranchingData: () => this.branchingData,
                    validateStep: (stepId) => this.validateStep(stepId),
                    clearErrors: () => this.clearAllErrors(),
                    showErrors: () => this.showAllErrors()
                };
                
            } catch (error) {
                this.log.error('Setup failed:', error);
            }
        },

        // Fix Issue #4: Error Messages Always Visible
        initializeErrorSystem: function() {
            this.log.info('Initializing error system...');
            
            // Hide all error messages initially
            const errorElements = document.querySelectorAll('.error-message, [class*="error"]');
            errorElements.forEach(element => {
                if (element.textContent.trim()) {
                    element.style.display = 'none';
                    this.log.debug(`Hidden error element: ${element.className}`);
                }
            });

            // Remove error styling from all fields initially
            const fieldsWithErrors = document.querySelectorAll('.field-error, [class*="error"]');
            fieldsWithErrors.forEach(field => {
                if (field.matches('input, select, textarea')) {
                    this.removeErrorStyling(field);
                    this.log.debug(`Removed error styling from: ${field.id || field.name}`);
                }
            });

            this.log.success(`Cleaned up ${errorElements.length} error elements and ${fieldsWithErrors.length} field errors`);
        },

        // Fix Issue #1: Branched Logic Validation
        initializeBranchingLogic: function() {
            this.log.info('Initializing enhanced branching logic...');
            
            // Map all branching controls
            const branchingInputs = document.querySelectorAll('input[type="radio"][name*="Type"], input[type="radio"][name*="Management"]');
            
            branchingInputs.forEach(input => {
                const branchKey = input.name;
                if (!this.branchingData.has(branchKey)) {
                    this.branchingData.set(branchKey, {
                        name: branchKey,
                        options: [],
                        selected: null,
                        targetSteps: new Map()
                    });
                }
                
                // Map option to target step
                const branchData = this.branchingData.get(branchKey);
                branchData.options.push(input.value);
                
                // Determine target step from data attributes or value
                const targetStep = this.determineTargetStep(input);
                if (targetStep) {
                    branchData.targetSteps.set(input.value, targetStep);
                    this.log.branching(`Mapped ${input.value} → ${targetStep}`);
                }
            });

            this.log.success(`Mapped ${this.branchingData.size} branching patterns`);
        },

        determineTargetStep: function(input) {
            // Try different methods to determine target step
            const value = input.value.toLowerCase();
            
            if (value.includes('individual')) return 'individual';
            if (value.includes('entity')) return 'entity';
            if (value.includes('trust')) return 'trust';
            if (value.includes('manager')) return 'manager-managed';
            if (value.includes('member')) return 'member-managed';
            
            return null;
        },

        // Enhanced validation system that respects branching
        initializeValidationSystem: function() {
            this.log.info('Initializing enhanced validation system...');
            
            const requiredFields = document.querySelectorAll('[required], [data-required="true"]');
            
            requiredFields.forEach(field => {
                const fieldId = field.id || field.name;
                const stepContainer = field.closest('[data-step-type], [data-form="step"]');
                const stepItemContainer = field.closest('[data-step-item], [data-step-subtype]');
                
                const validationInfo = {
                    element: field,
                    fieldId: fieldId,
                    stepId: stepContainer?.id || 'unknown',
                    stepItem: stepItemContainer?.dataset.stepItem || stepItemContainer?.dataset.stepSubtype,
                    isBranchDependent: !!stepItemContainer,
                    branchType: this.getBranchTypeForField(field),
                    isRequired: true
                };
                
                this.validationData.set(fieldId, validationInfo);
                this.log.validation(`Mapped validation: ${fieldId} (branch: ${validationInfo.branchType || 'none'})`);
            });

            this.log.success(`Mapped ${this.validationData.size} validation rules`);
        },

        getBranchTypeForField: function(field) {
            const container = field.closest('[data-step-item], [data-step-subtype]');
            if (!container) return null;
            
            const itemType = container.dataset.stepItem || container.dataset.stepSubtype;
            if (itemType) {
                if (itemType.includes('individual')) return 'individual';
                if (itemType.includes('entity')) return 'entity';
                if (itemType.includes('trust')) return 'trust';
            }
            
            return null;
        },

        // Enhanced step validation that checks branching state
        validateCurrentStep: function() {
            this.log.validation('Starting enhanced step validation...');
            
            const currentStep = document.querySelector('[data-form="step"]:not([style*="display: none"]):not(.w-hidden)');
            if (!currentStep) {
                this.log.warning('No current step found');
                return true;
            }

            const stepId = currentStep.id;
            this.log.validation(`Validating step: ${stepId}`);
            
            // Get all fields in current step
            const fieldsInStep = currentStep.querySelectorAll('[data-step-field-name], [required]');
            let invalidFields = [];
            
            fieldsInStep.forEach(field => {
                const fieldId = field.id || field.name;
                const validationInfo = this.validationData.get(fieldId);
                
                if (validationInfo && validationInfo.isRequired) {
                    // Check if field should be validated based on branching state
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
                        // Field should not be validated due to branching
                        this.removeErrorStyling(field);
                        this.log.validation(`⏭️ Skipped: ${fieldId} (not in active branch)`);
                    }
                }
            });

            const isValid = invalidFields.length === 0;
            this.log.validation(`Step validation result: ${isValid ? '✅ PASSED' : '❌ FAILED'} (${invalidFields.length} errors)`);
            
            return isValid;
        },

        // Determine if field should be validated based on current branching state
        shouldValidateField: function(field, validationInfo) {
            if (!validationInfo.isBranchDependent) {
                return true; // Always validate non-branch fields
            }

            // Find the branching control that affects this field
            const stepContainer = field.closest('[data-form="step"]');
            const branchingInputs = stepContainer?.querySelectorAll('input[type="radio"]:checked');
            
            if (!branchingInputs || branchingInputs.length === 0) {
                this.log.debug(`No branching selection found for field: ${field.id}`);
                return false; // No branch selected, don't validate
            }

            // Check if any selected branch matches this field's branch type
            for (const branchInput of branchingInputs) {
                const selectedBranchType = this.determineTargetStep(branchInput);
                if (selectedBranchType === validationInfo.branchType) {
                    this.log.debug(`Field ${field.id} is in active branch: ${selectedBranchType}`);
                    return true;
                }
            }

            this.log.debug(`Field ${field.id} is NOT in active branch (type: ${validationInfo.branchType})`);
            return false;
        },

        isFieldValid: function(field) {
            const value = field.value?.trim() || '';
            
            if (field.type === 'email') {
                return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            }
            
            if (field.type === 'tel') {
                return value && value.length >= 10;
            }
            
            if (field.tagName === 'SELECT') {
                return field.selectedIndex > 0 && value !== '';
            }
            
            return value !== '';
        },

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
            const fieldId = field.id;
            return document.querySelector(`[data-error-for="${fieldId}"], .error-message[data-field="${fieldId}"]`);
        },

        setupEventListeners: function() {
            this.log.info('Setting up enhanced event listeners...');
            
            // Enhanced branching listeners
            document.addEventListener('change', (event) => {
                if (event.target.matches('input[type="radio"][name*="Type"]')) {
                    this.handleBranchingChange(event.target);
                }
            });

            // Enhanced validation listeners
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

        handleBranchingChange: function(radioInput) {
            const branchName = radioInput.name;
            const selectedValue = radioInput.value;
            
            this.log.branching(`Branch change: ${branchName} → ${selectedValue}`);
            
            // Update branching data
            if (this.branchingData.has(branchName)) {
                this.branchingData.get(branchName).selected = selectedValue;
            }

            // Clear validation errors for hidden branch fields
            this.clearBranchValidationErrors(radioInput);
        },

        clearBranchValidationErrors: function(branchingInput) {
            const stepContainer = branchingInput.closest('[data-form="step"]');
            const allBranchFields = stepContainer.querySelectorAll('[data-step-item] input, [data-step-item] select, [data-step-item] textarea');
            
            allBranchFields.forEach(field => {
                const validationInfo = this.validationData.get(field.id || field.name);
                if (validationInfo && !this.shouldValidateField(field, validationInfo)) {
                    this.removeErrorStyling(field);
                    this.log.debug(`Cleared errors for hidden field: ${field.id}`);
                }
            });
        },

        handleFieldChange: function(field) {
            // Real-time validation for individual fields
            const validationInfo = this.validationData.get(field.id || field.name);
            if (validationInfo && this.shouldValidateField(field, validationInfo)) {
                if (this.isFieldValid(field)) {
                    this.removeErrorStyling(field);
                } else if (field.value.trim()) { // Only show error if user has started typing
                    this.applyErrorStyling(field);
                }
            }
        },

        handleNextButton: function(event) {
            this.log.info('Next button clicked - validating...');
            
            if (!this.validateCurrentStep()) {
                event.preventDefault();
                event.stopPropagation();
                this.log.warning('Navigation blocked due to validation errors');
                return false;
            }
            
            this.log.success('Validation passed - allowing navigation');
            return true;
        },

        // Debug helper methods
        clearAllErrors: function() {
            document.querySelectorAll('.field-error').forEach(field => {
                this.removeErrorStyling(field);
            });
            this.log.info('All errors cleared');
        },

        showAllErrors: function() {
            this.validationData.forEach((info, fieldId) => {
                const field = document.getElementById(fieldId);
                if (field && !this.isFieldValid(field)) {
                    this.applyErrorStyling(field);
                }
            });
            this.log.info('All errors shown');
        }
    };

    // Initialize the enhanced system
    WebflowFormsEnhanced.init();
    
    // Export to global scope
    window.WebflowFormsEnhanced = WebflowFormsEnhanced;

})(window, document); 