// Branching Radio Validation System for Webflow Forms
// Handles radio buttons with .radio_field.radio-type.is-active-inputactive class
// Provides validation, error messages, and button state management

const BranchingRadioValidator = {
    
    config: {
        // Selectors for branching radio buttons
        branchingRadioSelector: '.radio_field.radio-type.is-active-inputactive',
        branchingRadioContainerSelector: '.radio_component',
        errorMessageSelector: '.text-size-tiny.error-state',
        
        // Button selectors
        nextButtonSelector: '[data-form="next-btn"], input[type="submit"]',
        submitButtonSelector: 'input[type="submit"], button[type="submit"]',
        
        // Error styling classes
        errorClass: 'wf-radio-error',
        buttonDisabledClass: 'wf-button-disabled',
        
        // Default error message
        defaultErrorMessage: 'Please make a selection to continue'
    },
    
    // Store radio groups and their state
    radioGroups: new Map(),
    initialized: false,
    
    // Initialize the validation system
    init: function(context = document) {
        if (this.initialized && context === document) return;
        
        console.log('🎯 Initializing Branching Radio Validator');
        
        this.discoverRadioGroups(context);
        this.setupEventListeners(context);
        this.updateButtonStates();
        this.addStyles();
        
        if (context === document) {
            this.initialized = true;
        }
        
        console.log(`✅ Found ${this.radioGroups.size} branching radio groups`);
    },
    
    // Discover all branching radio groups
    discoverRadioGroups: function(context) {
        const branchingRadios = context.querySelectorAll(this.config.branchingRadioSelector + ' input[type="radio"]');
        
        branchingRadios.forEach(radio => {
            const name = radio.name;
            if (!name) return;
            
            // Find the container and error message element
            const container = radio.closest(this.config.branchingRadioContainerSelector);
            const errorElement = container ? container.parentElement.querySelector(this.config.errorMessageSelector) : null;
            
            if (!this.radioGroups.has(name)) {
                this.radioGroups.set(name, {
                    name: name,
                    radios: [],
                    container: container,
                    errorElement: errorElement,
                    isRequired: true, // All branching radios are required
                    customMessage: this.getCustomErrorMessage(container, errorElement),
                    currentStep: radio.closest('[data-form="step"]'),
                    isValid: false
                });
            }
            
            const group = this.radioGroups.get(name);
            group.radios.push(radio);
        });
    },
    
    // Get custom error message from container
    getCustomErrorMessage: function(container, errorElement) {
        // Check for data-validation-message attribute
        if (container && container.dataset.validationMessage) {
            return container.dataset.validationMessage;
        }
        
        // Extract text from error element
        if (errorElement && errorElement.textContent.trim()) {
            const text = errorElement.textContent.trim();
            // Remove HTML tags if present
            return text.replace(/<[^>]*>/g, '');
        }
        
        return this.config.defaultErrorMessage;
    },
    
    // Setup event listeners
    setupEventListeners: function(context) {
        // Listen for radio changes
        context.addEventListener('change', (e) => {
            if (this.isBranchingRadio(e.target)) {
                this.handleRadioChange(e.target);
            }
        });
        
        // Listen for form submissions
        context.addEventListener('submit', (e) => {
            if (!this.validateCurrentStep(e.target)) {
                e.preventDefault();
                e.stopPropagation();
                this.focusFirstError();
                return false;
            }
        });
        
        // Listen for next button clicks
        context.addEventListener('click', (e) => {
            if (e.target.matches(this.config.nextButtonSelector)) {
                const currentStep = e.target.closest('[data-form="step"]');
                if (currentStep && !this.validateStep(currentStep)) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.focusFirstError(currentStep);
                    return false;
                }
            }
        });
        
        // Listen for step changes to update button states
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Step visibility changed, update button states
                    setTimeout(() => this.updateButtonStates(), 100);
                }
            });
        });
        
        // Observe step visibility changes
        context.querySelectorAll('[data-form="step"]').forEach(step => {
            observer.observe(step, { attributes: true, attributeFilter: ['style'] });
        });
    },
    
    // Check if radio is a branching radio
    isBranchingRadio: function(radio) {
        return radio.type === 'radio' && radio.closest(this.config.branchingRadioSelector);
    },
    
    // Handle radio selection change
    handleRadioChange: function(radio) {
        const groupName = radio.name;
        const group = this.radioGroups.get(groupName);
        
        if (!group) return;
        
        // Update group validation status
        group.isValid = true;
        
        // Clear errors for this group
        this.clearGroupError(group);
        
        // Update button states
        this.updateButtonStates();
        
        console.log(`✅ Branching radio group "${groupName}" validated: ${radio.value}`);
    },
    
    // Validate current step
    validateCurrentStep: function(form) {
        const visibleSteps = Array.from(form.querySelectorAll('[data-form="step"]')).filter(step => {
            return step.style.display !== 'none' && step.offsetParent !== null;
        });
        
        let allValid = true;
        
        visibleSteps.forEach(step => {
            if (!this.validateStep(step)) {
                allValid = false;
            }
        });
        
        return allValid;
    },
    
    // Validate specific step
    validateStep: function(step) {
        let stepValid = true;
        
        // Get all branching radio groups in this step
        this.radioGroups.forEach((group, groupName) => {
            const hasRadioInStep = group.radios.some(radio => step.contains(radio));
            
            if (hasRadioInStep && group.isRequired) {
                if (!this.validateGroup(groupName)) {
                    stepValid = false;
                }
            }
        });
        
        return stepValid;
    },
    
    // Validate specific radio group
    validateGroup: function(groupName) {
        const group = this.radioGroups.get(groupName);
        if (!group || !group.isRequired) return true;
        
        // Check if group is in visible step
        if (!this.isGroupVisible(group)) return true;
        
        const hasSelection = group.radios.some(radio => radio.checked);
        
        if (hasSelection) {
            this.clearGroupError(group);
            group.isValid = true;
            return true;
        } else {
            this.showGroupError(group);
            group.isValid = false;
            return false;
        }
    },
    
    // Validate all groups
    validateAll: function() {
        let allValid = true;
        
        this.radioGroups.forEach((group, groupName) => {
            if (!this.validateGroup(groupName)) {
                allValid = false;
            }
        });
        
        return allValid;
    },
    
    // Check if group is in visible step
    isGroupVisible: function(group) {
        if (!group.currentStep) return true;
        
        return group.currentStep.style.display !== 'none' && 
               group.currentStep.offsetParent !== null;
    },
    
    // Show error for group
    showGroupError: function(group) {
        if (!group.errorElement) return;
        
        // Add error class to radio buttons
        group.radios.forEach(radio => {
            const radioField = radio.closest(this.config.branchingRadioSelector);
            if (radioField) {
                radioField.classList.add(this.config.errorClass);
            }
            radio.setAttribute('aria-invalid', 'true');
        });
        
        // Show error message
        group.errorElement.style.display = 'block';
        group.errorElement.setAttribute('role', 'alert');
        
        console.log(`❌ Showing error for branching radio group: ${group.name}`);
    },
    
    // Clear error for group
    clearGroupError: function(group) {
        if (!group.errorElement) return;
        
        // Remove error class from radio buttons
        group.radios.forEach(radio => {
            const radioField = radio.closest(this.config.branchingRadioSelector);
            if (radioField) {
                radioField.classList.remove(this.config.errorClass);
            }
            radio.removeAttribute('aria-invalid');
        });
        
        // Hide error message
        group.errorElement.style.display = 'none';
        group.errorElement.removeAttribute('role');
    },
    
    // Update button states (disable until selections made)
    updateButtonStates: function() {
        const buttons = document.querySelectorAll(this.config.nextButtonSelector);
        
        buttons.forEach(button => {
            const step = button.closest('[data-form="step"]');
            if (!step || step.style.display === 'none') return;
            
            // Check if current step has required branching radio groups
            let hasRequiredGroups = false;
            let allRequiredValid = true;
            
            this.radioGroups.forEach((group, groupName) => {
                const hasRadioInStep = group.radios.some(radio => step.contains(radio));
                
                if (hasRadioInStep && group.isRequired) {
                    hasRequiredGroups = true;
                    const hasSelection = group.radios.some(radio => radio.checked);
                    if (!hasSelection) {
                        allRequiredValid = false;
                    }
                }
            });
            
            // Enable/disable button based on validation
            if (hasRequiredGroups && !allRequiredValid) {
                button.disabled = true;
                button.classList.add(this.config.buttonDisabledClass);
            } else {
                button.disabled = false;
                button.classList.remove(this.config.buttonDisabledClass);
            }
        });
    },
    
    // Focus first error
    focusFirstError: function(step = null) {
        const searchContext = step || document;
        
        for (let [groupName, group] of this.radioGroups) {
            if (step && !group.radios.some(radio => step.contains(radio))) continue;
            
            if (group.isRequired && !group.isValid) {
                const firstRadio = group.radios[0];
                if (firstRadio) {
                    firstRadio.focus();
                    firstRadio.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    break;
                }
            }
        }
    },
    
    // Trigger custom event
    triggerCustomEvent: function(element, eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    },
    
    // Add validation styles
    addStyles: function() {
        if (document.getElementById('branching-radio-validation-styles')) return;
        
        const styles = `
            <style id="branching-radio-validation-styles">
            /* Error state for branching radio buttons */
            .radio_field.${this.config.errorClass} {
                border-color: #dc3545 !important;
                background-color: rgba(220, 53, 69, 0.05) !important;
            }
            
            /* Disabled button state */
            .${this.config.buttonDisabledClass} {
                opacity: 0.6 !important;
                cursor: not-allowed !important;
                pointer-events: none !important;
            }
            
            /* Error message styling enhancement */
            .text-size-tiny.error-state[style*="display: block"] {
                animation: fadeInError 0.3s ease-in-out;
            }
            
            @keyframes fadeInError {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Focus state for invalid radios */
            .radio_field.${this.config.errorClass}:focus-within {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    },
    
    // Public API methods
    
    // Check if specific group is valid
    isGroupValid: function(groupName) {
        const group = this.radioGroups.get(groupName);
        return group ? group.isValid : true;
    },
    
    // Get all invalid groups
    getInvalidGroups: function() {
        const invalid = [];
        this.radioGroups.forEach((group, name) => {
            if (group.isRequired && !group.isValid) {
                invalid.push(name);
            }
        });
        return invalid;
    },
    
    // Clear all errors
    clearAllErrors: function() {
        this.radioGroups.forEach(group => {
            this.clearGroupError(group);
        });
    },
    
    // Refresh validation (useful after dynamic content changes)
    refresh: function() {
        this.radioGroups.clear();
        this.init();
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        BranchingRadioValidator.init();
    });
} else {
    BranchingRadioValidator.init();
}

// Export for global access
window.BranchingRadioValidator = BranchingRadioValidator;

// Integration with existing webflow-forms if available
if (typeof window.WebflowForms !== 'undefined') {
    console.log('🔗 Integrating BranchingRadioValidator with WebflowForms');
    
    // Hook into existing form validation
    const originalValidate = window.WebflowForms.validateCurrentStep || function() { return true; };
    window.WebflowForms.validateCurrentStep = function() {
        const webflowValid = originalValidate.call(this);
        const branchingValid = BranchingRadioValidator.validateCurrentStep(document.querySelector('form'));
        return webflowValid && branchingValid;
    };
}

console.log('🎯 Branching Radio Validator loaded successfully'); 