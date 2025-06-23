/**
 * Radio Field Validation & Error Messaging Enhancement
 * Extends the existing webflow-forms validation system
 * @version 1.0.0
 */

const RadioFieldValidator = {
    // Configuration
    config: {
        errorClass: 'wf-radio-error',
        errorMessageClass: 'wf-radio-error-message',
        successClass: 'wf-radio-success',
        validatingClass: 'wf-radio-validating',
        errorContainerClass: 'wf-error-container',
        animationDuration: 300,
        showSuccessState: true,
        customErrorMessages: {
            required: 'Please select an option',
            required_custom: 'This field is required'
        }
    },

    // State management
    state: {
        radioGroups: new Map(),
        errorMessages: new Map(),
        validationListeners: new Map()
    },

    // Initialize radio validation system
    init: function(form = document) {
        console.log('🔘 Initializing radio field validation system...');
        
        // Find all radio groups
        this.discoverRadioGroups(form);
        
        // Setup validation listeners
        this.setupValidationListeners(form);
        
        // Add required styling
        this.addValidationStyles();
        
        // Initial validation check
        this.validateAllGroups();
        
        console.log(`✅ Radio validation initialized - ${this.state.radioGroups.size} groups found`);
    },

    // Discover and map all radio button groups
    discoverRadioGroups: function(context) {
        const radioInputs = context.querySelectorAll('input[type="radio"]');
        const groups = new Map();
        
        radioInputs.forEach(radio => {
            const groupName = radio.name;
            if (!groupName) return; // Skip radios without names
            
            if (!groups.has(groupName)) {
                groups.set(groupName, {
                    name: groupName,
                    radios: [],
                    isRequired: false,
                    container: null,
                    errorMessage: null,
                    customMessage: null
                });
            }
            
            const group = groups.get(groupName);
            group.radios.push(radio);
            
            // Check if any radio in group is required
            if (radio.required || radio.hasAttribute('required')) {
                group.isRequired = true;
            }
            
            // Find the common container (form, fieldset, or parent div)
            if (!group.container) {
                group.container = this.findRadioGroupContainer(radio);
            }
            
            // Check for custom error message
            if (!group.customMessage) {
                group.customMessage = this.getCustomErrorMessage(radio);
            }
        });
        
        this.state.radioGroups = groups;
        console.log(`📋 Discovered ${groups.size} radio groups:`, Array.from(groups.keys()));
    },

    // Find the container that holds the radio group
    findRadioGroupContainer: function(radio) {
        // Look for common radio group containers
        let container = radio.closest('.radio-group, .radio_group, .form-group, .form_group');
        
        if (!container) {
            container = radio.closest('fieldset');
        }
        
        if (!container) {
            // Look for a parent that contains all radios with the same name
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
        
        // Fallback to immediate parent
        return container || radio.parentElement;
    },

    // Get custom error message from data attributes
    getCustomErrorMessage: function(radio) {
        // Check various data attributes for custom messages
        const container = radio.closest('[data-error-message], [data-required-message], [data-validation-message]');
        
        if (container) {
            return container.dataset.errorMessage || 
                   container.dataset.requiredMessage || 
                   container.dataset.validationMessage;
        }
        
        // Check the radio itself
        return radio.dataset.errorMessage || 
               radio.dataset.requiredMessage || 
               radio.dataset.validationMessage;
    },

    // Setup event listeners for validation
    setupValidationListeners: function(context) {
        // Listen for radio button changes
        context.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                this.handleRadioChange(e.target);
            }
        });
        
        // Listen for form submission attempts
        context.addEventListener('submit', (e) => {
            if (!this.validateAllGroups()) {
                e.preventDefault();
                this.focusFirstError();
            }
        });
        
        // Listen for step navigation (multi-step forms)
        context.addEventListener('click', (e) => {
            if (e.target.matches('[data-form="next-btn"], [data-step="next"]')) {
                const currentStep = e.target.closest('[data-form="step"]');
                if (currentStep && !this.validateStep(currentStep)) {
                    e.preventDefault();
                    this.focusFirstError(currentStep);
                }
            }
        });
    },

    // Handle radio button change
    handleRadioChange: function(radio) {
        const groupName = radio.name;
        const group = this.state.radioGroups.get(groupName);
        
        if (!group) return;
        
        // Clear any existing errors for this group
        this.clearGroupError(group);
        
        // Show success state if enabled
        if (this.config.showSuccessState) {
            this.showGroupSuccess(group);
        }
        
        // Trigger validation update for button states
        this.triggerValidationUpdate();
    },

    // Validate all radio groups
    validateAllGroups: function() {
        let allValid = true;
        
        this.state.radioGroups.forEach((group) => {
            if (!this.validateGroup(group)) {
                allValid = false;
            }
        });
        
        return allValid;
    },

    // Validate a specific step
    validateStep: function(step) {
        let stepValid = true;
        
        this.state.radioGroups.forEach((group) => {
            // Check if any radio in this group is within the step
            const hasRadioInStep = group.radios.some(radio => step.contains(radio));
            
            if (hasRadioInStep && !this.validateGroup(group)) {
                stepValid = false;
            }
        });
        
        return stepValid;
    },

    // Validate individual radio group
    validateGroup: function(group) {
        if (!group.isRequired) return true;
        
        const hasSelection = group.radios.some(radio => radio.checked);
        
        if (hasSelection) {
            this.clearGroupError(group);
            if (this.config.showSuccessState) {
                this.showGroupSuccess(group);
            }
            return true;
        } else {
            this.showGroupError(group);
            return false;
        }
    },

    // Show error for radio group
    showGroupError: function(group) {
        // Clear any existing success state
        this.clearGroupSuccess(group);
        
        // Add error class to all radios in group
        group.radios.forEach(radio => {
            this.addErrorStateToRadio(radio);
        });
        
        // Create or update error message
        this.createErrorMessage(group);
        
        console.log(`❌ Radio group "${group.name}" validation failed`);
    },

    // Clear error for radio group
    clearGroupError: function(group) {
        // Remove error classes from radios
        group.radios.forEach(radio => {
            this.removeErrorStateFromRadio(radio);
        });
        
        // Remove error message
        this.removeErrorMessage(group);
    },

    // Show success state for radio group
    showGroupSuccess: function(group) {
        group.radios.forEach(radio => {
            this.addSuccessStateToRadio(radio);
        });
        
        // Auto-remove success state after delay
        setTimeout(() => {
            this.clearGroupSuccess(group);
        }, 2000);
        
        console.log(`✅ Radio group "${group.name}" validation passed`);
    },

    // Clear success state
    clearGroupSuccess: function(group) {
        group.radios.forEach(radio => {
            this.removeSuccessStateFromRadio(radio);
        });
    },

    // Add error state to individual radio
    addErrorStateToRadio: function(radio) {
        // Add error class to radio
        radio.classList.add(this.config.errorClass);
        
        // Add error state to radio container/wrapper
        const wrapper = this.findRadioWrapper(radio);
        if (wrapper) {
            wrapper.classList.add(this.config.errorClass);
        }
        
        // Add error state to label
        const label = this.findRadioLabel(radio);
        if (label) {
            label.classList.add(this.config.errorClass);
        }
        
        // Set ARIA attributes for accessibility
        radio.setAttribute('aria-invalid', 'true');
    },

    // Remove error state from radio
    removeErrorStateFromRadio: function(radio) {
        radio.classList.remove(this.config.errorClass);
        
        const wrapper = this.findRadioWrapper(radio);
        if (wrapper) {
            wrapper.classList.remove(this.config.errorClass);
        }
        
        const label = this.findRadioLabel(radio);
        if (label) {
            label.classList.remove(this.config.errorClass);
        }
        
        radio.removeAttribute('aria-invalid');
    },

    // Add success state to radio
    addSuccessStateToRadio: function(radio) {
        radio.classList.add(this.config.successClass);
        
        const wrapper = this.findRadioWrapper(radio);
        if (wrapper) {
            wrapper.classList.add(this.config.successClass);
        }
        
        const label = this.findRadioLabel(radio);
        if (label) {
            label.classList.add(this.config.successClass);
        }
    },

    // Remove success state from radio
    removeSuccessStateFromRadio: function(radio) {
        radio.classList.remove(this.config.successClass);
        
        const wrapper = this.findRadioWrapper(radio);
        if (wrapper) {
            wrapper.classList.remove(this.config.successClass);
        }
        
        const label = this.findRadioLabel(radio);
        if (label) {
            label.classList.remove(this.config.successClass);
        }
    },

    // Find radio wrapper element
    findRadioWrapper: function(radio) {
        return radio.closest('.radio-wrapper, .radio_wrapper, .form-check, .w-radio');
    },

    // Find radio label
    findRadioLabel: function(radio) {
        // Try to find label by 'for' attribute
        if (radio.id) {
            const label = document.querySelector(`label[for="${radio.id}"]`);
            if (label) return label;
        }
        
        // Try to find parent label
        return radio.closest('label');
    },

    // Create error message for group
    createErrorMessage: function(group) {
        // Remove existing error message
        this.removeErrorMessage(group);
        
        // Get error message text
        const messageText = group.customMessage || 
                           this.config.customErrorMessages.required;
        
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = this.config.errorMessageClass;
        errorElement.textContent = messageText;
        errorElement.role = 'alert';
        errorElement.setAttribute('aria-live', 'polite');
        
        // Find insertion point
        const insertionPoint = this.findErrorInsertionPoint(group);
        
        // Insert error message
        if (insertionPoint) {
            insertionPoint.appendChild(errorElement);
            
            // Animate in
            errorElement.style.opacity = '0';
            errorElement.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                errorElement.style.transition = `all ${this.config.animationDuration}ms ease`;
                errorElement.style.opacity = '1';
                errorElement.style.transform = 'translateY(0)';
            }, 10);
        }
        
        // Store reference
        group.errorMessage = errorElement;
        
        // Set up auto-removal on interaction
        this.setupErrorRemovalListeners(group);
    },

    // Remove error message
    removeErrorMessage: function(group) {
        if (group.errorMessage) {
            const errorElement = group.errorMessage;
            
            // Animate out
            errorElement.style.transition = `all ${this.config.animationDuration}ms ease`;
            errorElement.style.opacity = '0';
            errorElement.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                if (errorElement.parentNode) {
                    errorElement.parentNode.removeChild(errorElement);
                }
            }, this.config.animationDuration);
            
            group.errorMessage = null;
        }
    },

    // Find where to insert error message
    findErrorInsertionPoint: function(group) {
        // Look for designated error container
        let container = group.container.querySelector(`.${this.config.errorContainerClass}`);
        
        if (!container) {
            // Create error container
            container = document.createElement('div');
            container.className = this.config.errorContainerClass;
            group.container.appendChild(container);
        }
        
        return container;
    },

    // Setup listeners to remove errors on interaction
    setupErrorRemovalListeners: function(group) {
        const removeError = () => {
            if (group.radios.some(radio => radio.checked)) {
                this.clearGroupError(group);
            }
        };
        
        group.radios.forEach(radio => {
            radio.addEventListener('change', removeError, { once: true });
        });
    },

    // Focus first radio with error
    focusFirstError: function(context = document) {
        const firstErrorRadio = context.querySelector(`input[type="radio"].${this.config.errorClass}`);
        
        if (firstErrorRadio) {
            firstErrorRadio.focus();
            
            // Scroll into view
            firstErrorRadio.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            return true;
        }
        
        return false;
    },

    // Trigger validation update (for integration with existing system)
    triggerValidationUpdate: function() {
        // Trigger custom event for integration with existing button state management
        document.dispatchEvent(new CustomEvent('radioValidationUpdate', {
            detail: {
                validationResult: this.getValidationSummary()
            }
        }));
    },

    // Get validation summary
    getValidationSummary: function() {
        const summary = {
            totalGroups: this.state.radioGroups.size,
            validGroups: 0,
            invalidGroups: 0,
            requiredGroups: 0,
            groupDetails: []
        };
        
        this.state.radioGroups.forEach((group, name) => {
            const isValid = !group.isRequired || group.radios.some(radio => radio.checked);
            
            if (group.isRequired) {
                summary.requiredGroups++;
            }
            
            if (isValid) {
                summary.validGroups++;
            } else {
                summary.invalidGroups++;
            }
            
            summary.groupDetails.push({
                name: name,
                isRequired: group.isRequired,
                isValid: isValid,
                radioCount: group.radios.length
            });
        });
        
        return summary;
    },

    // Add validation styles
    addValidationStyles: function() {
        const styleId = 'wf-radio-validation-styles';
        
        if (document.getElementById(styleId)) return;
        
        const styles = `
            <style id="${styleId}">
            /* Radio Field Validation Styles */
            
            /* Error States */
            .${this.config.errorClass} {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
            }
            
            input[type="radio"].${this.config.errorClass} + label,
            .${this.config.errorClass} label {
                color: #dc3545 !important;
            }
            
            .${this.config.errorClass} .radio-wrapper,
            .${this.config.errorClass} .w-radio {
                border-color: #dc3545 !important;
                background-color: rgba(220, 53, 69, 0.05) !important;
            }
            
            /* Success States */
            .${this.config.successClass} {
                border-color: #28a745 !important;
                box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25) !important;
            }
            
            input[type="radio"].${this.config.successClass} + label,
            .${this.config.successClass} label {
                color: #28a745 !important;
            }
            
            .${this.config.successClass} .radio-wrapper,
            .${this.config.successClass} .w-radio {
                border-color: #28a745 !important;
                background-color: rgba(40, 167, 69, 0.05) !important;
            }
            
            /* Error Messages */
            .${this.config.errorMessageClass} {
                color: #dc3545;
                font-size: 0.875rem;
                margin-top: 0.5rem;
                display: block;
                animation: slideIn ${this.config.animationDuration}ms ease;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Error Container */
            .${this.config.errorContainerClass} {
                margin-top: 0.5rem;
            }
            
            /* Validation States with Icons */
            .${this.config.errorClass}::before {
                content: "⚠️";
                margin-right: 0.5rem;
            }
            
            .${this.config.successClass}::before {
                content: "✅";
                margin-right: 0.5rem;
            }
            
            /* Focus enhancements for accessibility */
            input[type="radio"]:focus.${this.config.errorClass} {
                outline: 2px solid #dc3545;
                outline-offset: 2px;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .${this.config.errorMessageClass} {
                    font-size: 0.8rem;
                }
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    },

    // Integration with existing WebflowFieldEnhancer
    integrateWithWebflowForms: function() {
        // Listen for existing validation updates
        document.addEventListener('radioValidationUpdate', (e) => {
            if (window.WebflowFieldEnhancer && window.WebflowFieldEnhancer.updateButtonStates) {
                window.WebflowFieldEnhancer.updateButtonStates();
            }
        });
        
        // Extend existing radio validation
        if (window.WebflowFieldEnhancer) {
            const originalValidateRadio = window.WebflowFieldEnhancer.validateRadioButtonGroups;
            
            window.WebflowFieldEnhancer.validateRadioButtonGroups = (form) => {
                // Use our enhanced validation
                const isValid = this.validateAllGroups();
                
                // Call original if it exists
                if (originalValidateRadio) {
                    originalValidateRadio.call(window.WebflowFieldEnhancer, form);
                }
                
                return isValid;
            };
        }
    },

    // Cleanup method
    destroy: function() {
        // Remove all error messages
        this.state.radioGroups.forEach(group => {
            this.removeErrorMessage(group);
        });
        
        // Clear state
        this.state.radioGroups.clear();
        this.state.errorMessages.clear();
        this.state.validationListeners.clear();
        
        // Remove styles
        const styleElement = document.getElementById('wf-radio-validation-styles');
        if (styleElement) {
            styleElement.remove();
        }
        
        console.log('🧹 Radio validation system destroyed');
    }
};

// Auto-initialize and integrate
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        RadioFieldValidator.init();
        RadioFieldValidator.integrateWithWebflowForms();
    });
} else {
    RadioFieldValidator.init();
    RadioFieldValidator.integrateWithWebflowForms();
}

// Export for use
window.RadioFieldValidator = RadioFieldValidator;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RadioFieldValidator;
} 