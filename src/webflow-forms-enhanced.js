/**
 * Webflow Forms Enhanced - With Advanced Radio Validation
 * Extends webflow-forms-fixed.js with comprehensive radio field error messaging
 * @version 1.3.0
 * @author Chris Brummer
 */

// Import libphonenumber for dynamic phone formatting and country data
import { AsYouType, getExampleNumber, parsePhoneNumber, getCountries, getCountryCallingCode } from 'libphonenumber-js';

const WebflowFieldEnhancer = {
    version: '1.3.0',
    
    config: {
        autoInit: true,
        enhancedClass: 'wf-field-enhanced',
        focusClass: 'wf-field-focus',
        typingClass: 'wf-field-typing',
        branchingEnabled: true,
        // Radio validation config
        radioValidation: {
            errorClass: 'wf-radio-error',
            errorMessageClass: 'wf-radio-error-message',
            successClass: 'wf-radio-success',
            errorContainerClass: 'wf-error-container',
            showSuccessState: true,
            animationDuration: 300
        }
    },

    // Cache for country data and phone formatting
    countryDataCache: null,
    phoneFormatCache: new Map(),
    
    // Enhanced branching logic state management
    branchingState: {
        currentStep: null,
        stepHistory: [],
        conditionalSteps: new Map(),
        branchingRules: new Map(),
        // Radio validation state
        radioGroups: new Map(),
        errorMessages: new Map(),
        validationErrors: new Map()
    },

    // ================================
    // ENHANCED RADIO VALIDATION SYSTEM
    // ================================

    // Initialize radio validation for forms
    initRadioValidation: function(form = document) {
        console.log('🔘 Initializing enhanced radio validation...');
        
        // Discover all radio groups
        this.discoverRadioGroups(form);
        
        // Setup validation listeners
        this.setupRadioValidationListeners(form);
        
        // Add validation styles
        this.addRadioValidationStyles();
        
        // Initial validation
        this.validateAllRadioGroups();
        
        console.log(`✅ Radio validation ready - ${this.branchingState.radioGroups.size} groups found`);
    },

    // Discover and map all radio button groups
    discoverRadioGroups: function(context) {
        const radioInputs = context.querySelectorAll('input[type="radio"]');
        const groups = new Map();
        
        radioInputs.forEach(radio => {
            const groupName = radio.name;
            if (!groupName) return;
            
            if (!groups.has(groupName)) {
                groups.set(groupName, {
                    name: groupName,
                    radios: [],
                    isRequired: false,
                    container: null,
                    errorMessage: null,
                    customMessage: null,
                    isVisible: true
                });
            }
            
            const group = groups.get(groupName);
            group.radios.push(radio);
            
            // Check if required
            if (radio.required || radio.hasAttribute('required')) {
                group.isRequired = true;
            }
            
            // Find container
            if (!group.container) {
                group.container = this.findRadioGroupContainer(radio);
            }
            
            // Get custom error message
            if (!group.customMessage) {
                group.customMessage = this.getCustomErrorMessage(radio);
            }
        });
        
        this.branchingState.radioGroups = groups;
        
        groups.forEach((group, name) => {
            console.log(`📋 Radio group "${name}": ${group.radios.length} options, Required: ${group.isRequired}`);
        });
    },

    // Find the container that holds the radio group
    findRadioGroupContainer: function(radio) {
        // Look for designated containers
        let container = radio.closest('.radio-group, .radio_group, .form-group, .form_group, fieldset');
        
        if (!container) {
            // Find parent that contains all radios with same name
            let parent = radio.parentElement;
            while (parent && parent !== document.body) {
                const radiosInParent = parent.querySelectorAll(`input[type="radio"][name="${radio.name}"]`);
                if (radiosInParent.length > 1) {
                    container = parent;
                    break;
                }
                parent = parent.parentElement;
            }
        }
        
        return container || radio.closest('.w-form-formdata') || radio.parentElement;
    },

    // Get custom error message from data attributes
    getCustomErrorMessage: function(radio) {
        // Check container first
        const container = radio.closest('[data-validation-message]');
        if (container) {
            return container.dataset.validationMessage;
        }
        
        // Check radio itself
        return radio.dataset.validationMessage || 'Please select an option';
    },

    // Setup validation event listeners
    setupRadioValidationListeners: function(context) {
        // Listen for radio changes
        context.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                this.handleRadioValidationChange(e.target);
            }
        });
        
        // Listen for form submissions
        context.addEventListener('submit', (e) => {
            if (!this.validateAllRadioGroups()) {
                e.preventDefault();
                this.focusFirstRadioError();
            }
        });
        
        // Listen for step navigation
        context.addEventListener('click', (e) => {
            if (e.target.matches('[data-form="next-btn"], [data-step="next"]')) {
                const currentStep = e.target.closest('[data-form="step"]');
                if (currentStep && !this.validateRadioGroupsInStep(currentStep)) {
                    e.preventDefault();
                    this.focusFirstRadioError(currentStep);
                }
            }
        });
    },

    // Handle radio change for validation
    handleRadioValidationChange: function(radio) {
        const groupName = radio.name;
        const group = this.branchingState.radioGroups.get(groupName);
        
        if (!group) return;
        
        // Clear errors for this group
        this.clearRadioGroupError(group);
        
        // Show success state if enabled
        if (this.config.radioValidation.showSuccessState) {
            this.showRadioGroupSuccess(group);
        }
        
        // Update button states
        this.updateButtonStates();
        
        // Trigger custom event
        this.triggerCustomEvent(radio, 'radioValidated', {
            groupName: groupName,
            isValid: true,
            selectedValue: radio.value
        });
    },

    // Validate all radio groups
    validateAllRadioGroups: function() {
        let allValid = true;
        
        this.branchingState.radioGroups.forEach((group) => {
            if (!this.validateRadioGroup(group)) {
                allValid = false;
            }
        });
        
        return allValid;
    },

    // Validate radio groups in a specific step
    validateRadioGroupsInStep: function(step) {
        let stepValid = true;
        
        this.branchingState.radioGroups.forEach((group) => {
            const hasRadioInStep = group.radios.some(radio => step.contains(radio));
            
            if (hasRadioInStep && !this.validateRadioGroup(group)) {
                stepValid = false;
            }
        });
        
        return stepValid;
    },

    // Validate individual radio group
    validateRadioGroup: function(group) {
        if (!group.isRequired) return true;
        
        // Check if group is visible
        if (!this.isRadioGroupVisible(group)) return true;
        
        const hasSelection = group.radios.some(radio => radio.checked);
        
        if (hasSelection) {
            this.clearRadioGroupError(group);
            if (this.config.radioValidation.showSuccessState) {
                this.showRadioGroupSuccess(group);
            }
            return true;
        } else {
            this.showRadioGroupError(group);
            return false;
        }
    },

    // Check if radio group is visible
    isRadioGroupVisible: function(group) {
        // Check if any radio in the group is visible
        return group.radios.some(radio => {
            const step = radio.closest('[data-form="step"]');
            if (step && step.style.display === 'none') return false;
            
            const stepItem = radio.closest('.step_item, .step-item');
            if (stepItem && stepItem.style.display === 'none') return false;
            
            return radio.offsetParent !== null; // Element is visible
        });
    },

    // Show error for radio group
    showRadioGroupError: function(group) {
        // Clear success state
        this.clearRadioGroupSuccess(group);
        
        // Add error styling to all radios
        group.radios.forEach(radio => {
            this.addRadioErrorState(radio);
        });
        
        // Create error message
        this.createRadioErrorMessage(group);
        
        // Store error state
        this.branchingState.validationErrors.set(group.name, {
            type: 'radio_required',
            message: group.customMessage,
            group: group
        });
        
        console.log(`❌ Radio group "${group.name}" validation failed`);
    },

    // Clear error for radio group
    clearRadioGroupError: function(group) {
        // Remove error styling
        group.radios.forEach(radio => {
            this.removeRadioErrorState(radio);
        });
        
        // Remove error message
        this.removeRadioErrorMessage(group);
        
        // Clear error state
        this.branchingState.validationErrors.delete(group.name);
    },

    // Show success state for radio group
    showRadioGroupSuccess: function(group) {
        group.radios.forEach(radio => {
            this.addRadioSuccessState(radio);
        });
        
        // Auto-clear success after delay
        setTimeout(() => {
            this.clearRadioGroupSuccess(group);
        }, 2000);
        
        console.log(`✅ Radio group "${group.name}" validation passed`);
    },

    // Clear success state
    clearRadioGroupSuccess: function(group) {
        group.radios.forEach(radio => {
            this.removeRadioSuccessState(radio);
        });
    },

    // Add error state to individual radio
    addRadioErrorState: function(radio) {
        radio.classList.add(this.config.radioValidation.errorClass);
        radio.setAttribute('aria-invalid', 'true');
        
        // Style the wrapper/container
        const wrapper = this.findRadioWrapper(radio);
        if (wrapper) {
            wrapper.classList.add(this.config.radioValidation.errorClass);
        }
        
        // Style the label
        const label = this.findRadioLabel(radio);
        if (label) {
            label.classList.add(this.config.radioValidation.errorClass);
        }
    },

    // Remove error state from radio
    removeRadioErrorState: function(radio) {
        radio.classList.remove(this.config.radioValidation.errorClass);
        radio.removeAttribute('aria-invalid');
        
        const wrapper = this.findRadioWrapper(radio);
        if (wrapper) {
            wrapper.classList.remove(this.config.radioValidation.errorClass);
        }
        
        const label = this.findRadioLabel(radio);
        if (label) {
            label.classList.remove(this.config.radioValidation.errorClass);
        }
    },

    // Add success state to radio
    addRadioSuccessState: function(radio) {
        if (!radio.checked) return; // Only show success on selected radio
        
        radio.classList.add(this.config.radioValidation.successClass);
        
        const wrapper = this.findRadioWrapper(radio);
        if (wrapper) {
            wrapper.classList.add(this.config.radioValidation.successClass);
        }
        
        const label = this.findRadioLabel(radio);
        if (label) {
            label.classList.add(this.config.radioValidation.successClass);
        }
    },

    // Remove success state from radio
    removeRadioSuccessState: function(radio) {
        radio.classList.remove(this.config.radioValidation.successClass);
        
        const wrapper = this.findRadioWrapper(radio);
        if (wrapper) {
            wrapper.classList.remove(this.config.radioValidation.successClass);
        }
        
        const label = this.findRadioLabel(radio);
        if (label) {
            label.classList.remove(this.config.radioValidation.successClass);
        }
    },

    // Find radio wrapper element
    findRadioWrapper: function(radio) {
        return radio.closest('.radio-wrapper, .radio_wrapper, .form-check, .w-radio, .radio-option');
    },

    // Find radio label
    findRadioLabel: function(radio) {
        if (radio.id) {
            const label = document.querySelector(`label[for="${radio.id}"]`);
            if (label) return label;
        }
        return radio.closest('label') || radio.parentElement.querySelector('label');
    },

    // Create error message for radio group
    createRadioErrorMessage: function(group) {
        // Remove existing error message
        this.removeRadioErrorMessage(group);
        
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = this.config.radioValidation.errorMessageClass;
        errorElement.textContent = group.customMessage;
        errorElement.role = 'alert';
        errorElement.setAttribute('aria-live', 'polite');
        
        // Find or create error container
        let errorContainer = group.container.querySelector(`.${this.config.radioValidation.errorContainerClass}`);
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = this.config.radioValidation.errorContainerClass;
            group.container.appendChild(errorContainer);
        }
        
        // Insert error message
        errorContainer.appendChild(errorElement);
        
        // Animate in
        errorElement.style.opacity = '0';
        errorElement.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            errorElement.style.transition = `all ${this.config.radioValidation.animationDuration}ms ease`;
            errorElement.style.opacity = '1';
            errorElement.style.transform = 'translateY(0)';
        }, 10);
        
        // Store reference
        group.errorMessage = errorElement;
    },

    // Remove error message for radio group
    removeRadioErrorMessage: function(group) {
        if (group.errorMessage) {
            const errorElement = group.errorMessage;
            
            // Animate out
            errorElement.style.transition = `all ${this.config.radioValidation.animationDuration}ms ease`;
            errorElement.style.opacity = '0';
            errorElement.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                if (errorElement.parentNode) {
                    errorElement.parentNode.removeChild(errorElement);
                }
            }, this.config.radioValidation.animationDuration);
            
            group.errorMessage = null;
        }
    },

    // Focus first radio with error
    focusFirstRadioError: function(context = document) {
        const firstErrorRadio = context.querySelector(`input[type="radio"].${this.config.radioValidation.errorClass}`);
        
        if (firstErrorRadio) {
            firstErrorRadio.focus();
            firstErrorRadio.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            return true;
        }
        
        return false;
    },

    // Get radio validation summary
    getRadioValidationSummary: function() {
        const summary = {
            totalGroups: this.branchingState.radioGroups.size,
            validGroups: 0,
            invalidGroups: 0,
            requiredGroups: 0,
            errors: []
        };
        
        this.branchingState.radioGroups.forEach((group, name) => {
            const isValid = !group.isRequired || group.radios.some(radio => radio.checked);
            
            if (group.isRequired) {
                summary.requiredGroups++;
            }
            
            if (isValid) {
                summary.validGroups++;
            } else {
                summary.invalidGroups++;
                summary.errors.push({
                    groupName: name,
                    message: group.customMessage,
                    radioCount: group.radios.length
                });
            }
        });
        
        return summary;
    },

    // Add CSS styles for radio validation
    addRadioValidationStyles: function() {
        const styleId = 'wf-radio-validation-styles';
        if (document.getElementById(styleId)) return;
        
        const config = this.config.radioValidation;
        
        const styles = `
            <style id="${styleId}">
            /* Radio Validation Styles */
            
            /* Error States */
            .${config.errorClass} {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
            }
            
            .${config.errorClass} + label,
            .${config.errorClass} label {
                color: #dc3545 !important;
            }
            
            .radio-wrapper.${config.errorClass},
            .radio_wrapper.${config.errorClass},
            .w-radio.${config.errorClass},
            .radio-option.${config.errorClass} {
                border-color: #dc3545 !important;
                background-color: rgba(220, 53, 69, 0.05) !important;
            }
            
            /* Success States */
            .${config.successClass} {
                border-color: #28a745 !important;
                box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25) !important;
            }
            
            .${config.successClass} + label,
            .${config.successClass} label {
                color: #28a745 !important;
            }
            
            .radio-wrapper.${config.successClass},
            .radio_wrapper.${config.successClass},
            .w-radio.${config.successClass},
            .radio-option.${config.successClass} {
                border-color: #28a745 !important;
                background-color: rgba(40, 167, 69, 0.05) !important;
            }
            
            /* Error Messages */
            .${config.errorMessageClass} {
                color: #dc3545;
                font-size: 0.875rem;
                margin-top: 0.5rem;
                display: block;
                font-weight: 500;
            }
            
            .${config.errorMessageClass}::before {
                content: "⚠️ ";
                margin-right: 0.25rem;
            }
            
            /* Error Container */
            .${config.errorContainerClass} {
                margin-top: 0.5rem;
            }
            
            /* Focus states for accessibility */
            input[type="radio"]:focus.${config.errorClass} {
                outline: 2px solid #dc3545;
                outline-offset: 2px;
            }
            
            input[type="radio"]:focus.${config.successClass} {
                outline: 2px solid #28a745;
                outline-offset: 2px;
            }
            
            /* Animation for error states */
            .${config.errorClass} {
                animation: shake 0.5s ease-in-out;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            /* Success animation */
            .${config.successClass} {
                animation: pulse 0.5s ease-in-out;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .${config.errorMessageClass} {
                    font-size: 0.8rem;
                }
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    },

    // ================================
    // ENHANCED VALIDATION INTEGRATION
    // ================================

    // Override existing validateCurrentStep to include radio validation
    validateCurrentStep: function() {
        const step = this.branchingState.currentStep;
        if (!step) return false;
        
        // Validate regular required fields
        const requiredFields = step.querySelectorAll('input[required]:not([type="radio"]), select[required], textarea[required]');
        for (const field of requiredFields) {
            if (!field.value.trim()) {
                console.log('Validation failed for field:', field.name || field.id);
                return false;
            }
        }
        
        // Validate radio groups in this step
        if (!this.validateRadioGroupsInStep(step)) {
            console.log('Radio validation failed for current step');
            return false;
        }
        
        return true;
    },

    // Enhanced form validation that includes radio groups
    validateForm: function(form) {
        let isValid = true;
        
        // Validate regular fields
        const requiredFields = form.querySelectorAll('input[required]:not([type="radio"]), select[required], textarea[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('field-error');
                isValid = false;
            } else {
                field.classList.remove('field-error');
            }
        });
        
        // Validate radio groups
        if (!this.validateAllRadioGroups()) {
            isValid = false;
        }
        
        return isValid;
    },

    // ================================
    // EXISTING METHODS (keep all existing functionality)
    // ================================

    // All existing methods from webflow-forms-fixed.js go here...
    // (keeping them unchanged to maintain compatibility)

    // Clear all caches
    clearCaches: function() {
        this.countryDataCache = null;
        this.phoneFormatCache.clear();
        this.branchingState.conditionalSteps.clear();
        this.branchingState.branchingRules.clear();
        this.branchingState.stepHistory = [];
        this.branchingState.radioGroups.clear();
        this.branchingState.errorMessages.clear();
        this.branchingState.validationErrors.clear();
    },

    // Enhanced initialization
    init: function() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeAll());
        } else {
            this.initializeAll();
        }
    },

    // Initialize all features
    initializeAll: function() {
        // Initialize existing features
        this.initBranchingLogic();
        this.enhanceAllForms();
        
        // Initialize enhanced radio validation
        this.initRadioValidation();
        
        console.log(`🚀 Webflow Forms Enhanced v${this.version} initialized`);
    },

    // Enhanced form processing
    enhanceAllForms: function() {
        const forms = document.querySelectorAll('form');
        let processedFields = 0;
        
        forms.forEach(form => {
            // Process all fields in the form
            const fields = form.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
                this.enhanceField(field);
                processedFields++;
            });
            
            // Initialize radio validation for this form
            this.initRadioValidation(form);
        });
        
        console.log(`📋 Processed ${processedFields} fields across ${forms.length} forms`);
    },

    // Enhanced field processing (existing method enhanced)
    enhanceField: function(field) {
        // Add enhanced class
        field.classList.add(this.config.enhancedClass);
        
        // Process based on field type and data attributes
        if (field.dataset.countryCode !== undefined) {
            this.setupCountryCodeSelect(field);
        }
        
        if (field.dataset.phoneFormat !== undefined) {
            this.setupPhoneFormatting(field);
        }
        
        if (field.dataset.googlePlaces !== undefined) {
            this.setupGooglePlaces(field);
        }
        
        // Radio fields are handled by the radio validation system
        if (field.type === 'radio') {
            // Radio validation is handled globally, no individual setup needed
            return;
        }
        
        // Add enhanced interactions
        this.addEnhancedInteractions(field);
    },

    // Keep all existing methods for compatibility...
    // (Include all methods from webflow-forms-fixed.js)

    // Trigger custom events
    triggerCustomEvent: function(element, eventName, detail = {}) {
        try {
            const event = new CustomEvent(`webflowField:${eventName}`, {
                detail: detail,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
        } catch (error) {
            console.warn('Error triggering custom event:', eventName, error);
        }
    }
};

// Auto-initialize if config allows
if (WebflowFieldEnhancer.config.autoInit) {
    WebflowFieldEnhancer.init();
}

// Export to global scope
window.WebflowFieldEnhancer = WebflowFieldEnhancer;
window.WebflowForms = WebflowFieldEnhancer; // Backward compatibility

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebflowFieldEnhancer;
} 