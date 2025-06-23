// Branching Radio Validation System for Webflow Forms
// Handles radio buttons with .radio_field.radio-type.is-active-inputactive class
// Provides validation, error messages, and button state management

const BranchingRadioValidator = {
    
    config: {
        branchingRadioSelector: '.radio_field.radio-type.is-active-inputactive',
        branchingRadioContainerSelector: '.radio_component',
        errorMessageSelector: '.text-size-tiny.error-state',
        nextButtonSelector: '[data-form="next-btn"], input[type="submit"]',
        submitButtonSelector: 'input[type="submit"], button[type="submit"]',
        errorClass: 'wf-radio-error',
        buttonDisabledClass: 'wf-button-disabled',
        defaultErrorMessage: 'Please make a selection to continue'
    },
    
    radioGroups: new Map(),
    initialized: false,
    
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
    
    discoverRadioGroups: function(context) {
        const branchingRadios = context.querySelectorAll(this.config.branchingRadioSelector + ' input[type="radio"]');
        
        branchingRadios.forEach(radio => {
            const name = radio.name;
            if (!name) return;
            
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
    },
    
    isBranchingRadio: function(radio) {
        return radio.type === 'radio' && radio.closest(this.config.branchingRadioSelector);
    },
    
    handleRadioChange: function(radio) {
        const groupName = radio.name;
        const group = this.radioGroups.get(groupName);
        
        if (!group) return;
        
        group.isValid = true;
        this.clearGroupError(group);
        this.updateButtonStates();
        
        console.log(`✅ Branching radio group "${groupName}" validated: ${radio.value}`);
    },
    
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
    
    validateStep: function(step) {
        let stepValid = true;
        
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
    
    validateGroup: function(groupName) {
        const group = this.radioGroups.get(groupName);
        if (!group || !group.isRequired) return true;
        
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
    
    isGroupVisible: function(group) {
        if (!group.currentStep) return true;
        
        return group.currentStep.style.display !== 'none' && 
               group.currentStep.offsetParent !== null;
    },
    
    showGroupError: function(group) {
        if (!group.errorElement) return;
        
        group.radios.forEach(radio => {
            const radioField = radio.closest(this.config.branchingRadioSelector);
            if (radioField) {
                radioField.classList.add(this.config.errorClass);
            }
            radio.setAttribute('aria-invalid', 'true');
        });
        
        group.errorElement.style.display = 'block';
        group.errorElement.setAttribute('role', 'alert');
        
        console.log(`❌ Showing error for branching radio group: ${group.name}`);
    },
    
    clearGroupError: function(group) {
        if (!group.errorElement) return;
        
        group.radios.forEach(radio => {
            const radioField = radio.closest(this.config.branchingRadioSelector);
            if (radioField) {
                radioField.classList.remove(this.config.errorClass);
            }
            radio.removeAttribute('aria-invalid');
        });
        
        group.errorElement.style.display = 'none';
        group.errorElement.removeAttribute('role');
    },
    
    updateButtonStates: function() {
        const buttons = document.querySelectorAll(this.config.nextButtonSelector);
        
        buttons.forEach(button => {
            const step = button.closest('[data-form="step"]');
            if (!step || step.style.display === 'none') return;
            
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
            
            if (hasRequiredGroups && !allRequiredValid) {
                button.disabled = true;
                button.classList.add(this.config.buttonDisabledClass);
            } else {
                button.disabled = false;
                button.classList.remove(this.config.buttonDisabledClass);
            }
        });
    },
    
    focusFirstError: function(step = null) {
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
    
    addStyles: function() {
        if (document.getElementById('branching-radio-validation-styles')) return;
        
        const styles = `
            <style id="branching-radio-validation-styles">
            .radio_field.${this.config.errorClass} {
                border-color: #dc3545 !important;
                background-color: rgba(220, 53, 69, 0.05) !important;
            }
            
            .${this.config.buttonDisabledClass} {
                opacity: 0.6 !important;
                cursor: not-allowed !important;
                pointer-events: none !important;
            }
            
            .text-size-tiny.error-state[style*="display: block"] {
                animation: fadeInError 0.3s ease-in-out;
            }
            
            @keyframes fadeInError {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .radio_field.${this.config.errorClass}:focus-within {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    },
    
    // Public API
    isGroupValid: function(groupName) {
        const group = this.radioGroups.get(groupName);
        return group ? group.isValid : true;
    },
    
    getInvalidGroups: function() {
        const invalid = [];
        this.radioGroups.forEach((group, name) => {
            if (group.isRequired && !group.isValid) {
                invalid.push(name);
            }
        });
        return invalid;
    },
    
    clearAllErrors: function() {
        this.radioGroups.forEach(group => {
            this.clearGroupError(group);
        });
    },
    
    refresh: function() {
        this.radioGroups.clear();
        this.init();
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        BranchingRadioValidator.init();
    });
} else {
    BranchingRadioValidator.init();
}

window.BranchingRadioValidator = BranchingRadioValidator;

console.log('🎯 Branching Radio Validator loaded successfully'); 