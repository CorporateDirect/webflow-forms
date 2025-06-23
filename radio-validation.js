/**
 * Radio Field Validation Module
 * Adds comprehensive error messaging for required radio fields
 * Integrates with existing webflow-forms system
 */

const RadioValidator = {
    // Configuration
    config: {
        errorClass: 'wf-radio-error',
        errorMessageClass: 'wf-radio-error-message',
        successClass: 'wf-radio-success',
        errorContainerClass: 'wf-error-container'
    },

    // State
    radioGroups: new Map(),
    
    // Initialize radio validation
    init: function(context = document) {
        this.discoverRadioGroups(context);
        this.setupEventListeners(context);
        this.addStyles();
        console.log(`🔘 Radio validation ready - ${this.radioGroups.size} groups`);
    },

    // Find all radio groups
    discoverRadioGroups: function(context) {
        const radios = context.querySelectorAll('input[type="radio"]');
        const groups = new Map();
        
        radios.forEach(radio => {
            const name = radio.name;
            if (!name) return;
            
            if (!groups.has(name)) {
                groups.set(name, {
                    name: name,
                    radios: [],
                    isRequired: false,
                    container: radio.closest('.form-group, .radio-group, fieldset') || radio.parentElement,
                    errorMessage: this.getErrorMessage(radio)
                });
            }
            
            const group = groups.get(name);
            group.radios.push(radio);
            
            if (radio.required) {
                group.isRequired = true;
            }
        });
        
        this.radioGroups = groups;
    },

    // Get custom error message
    getErrorMessage: function(radio) {
        const container = radio.closest('[data-validation-message]');
        return container?.dataset.validationMessage || 'Please select an option';
    },

    // Setup event listeners
    setupEventListeners: function(context) {
        context.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                this.validateGroup(e.target.name);
            }
        });

        context.addEventListener('submit', (e) => {
            if (!this.validateAll()) {
                e.preventDefault();
                this.focusFirstError();
            }
        });
    },

    // Validate all required radio groups
    validateAll: function() {
        let allValid = true;
        
        this.radioGroups.forEach(group => {
            if (group.isRequired) {
                const hasSelection = group.radios.some(r => r.checked);
                
                if (hasSelection) {
                    this.clearError(group);
                } else {
                    this.showError(group);
                    allValid = false;
                }
            }
        });
        
        return allValid;
    },

    // Validate specific group
    validateGroup: function(groupName) {
        const group = this.radioGroups.get(groupName);
        if (!group || !group.isRequired) return true;
        
        const hasSelection = group.radios.some(r => r.checked);
        
        if (hasSelection) {
            this.clearError(group);
            return true;
        } else {
            this.showError(group);
            return false;
        }
    },

    // Show error for group
    showError: function(group) {
        // Add error class to radios
        group.radios.forEach(radio => {
            radio.classList.add(this.config.errorClass);
            const wrapper = radio.closest('.radio-wrapper, .w-radio');
            if (wrapper) wrapper.classList.add(this.config.errorClass);
        });

        // Create/show error message
        this.createErrorMessage(group);
    },

    // Clear error for group
    clearError: function(group) {
        // Remove error classes
        group.radios.forEach(radio => {
            radio.classList.remove(this.config.errorClass);
            const wrapper = radio.closest('.radio-wrapper, .w-radio');
            if (wrapper) wrapper.classList.remove(this.config.errorClass);
        });

        // Remove error message
        this.removeErrorMessage(group);
    },

    // Create error message
    createErrorMessage: function(group) {
        this.removeErrorMessage(group); // Remove existing
        
        const errorEl = document.createElement('div');
        errorEl.className = this.config.errorMessageClass;
        errorEl.textContent = group.errorMessage;
        errorEl.role = 'alert';
        
        let container = group.container.querySelector(`.${this.config.errorContainerClass}`);
        if (!container) {
            container = document.createElement('div');
            container.className = this.config.errorContainerClass;
            group.container.appendChild(container);
        }
        
        container.appendChild(errorEl);
        group.errorElement = errorEl;
    },

    // Remove error message
    removeErrorMessage: function(group) {
        if (group.errorElement) {
            group.errorElement.remove();
            group.errorElement = null;
        }
    },

    // Focus first error
    focusFirstError: function() {
        const firstError = document.querySelector(`input[type="radio"].${this.config.errorClass}`);
        if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    // Add validation styles
    addStyles: function() {
        if (document.getElementById('radio-validation-styles')) return;
        
        const styles = `
            <style id="radio-validation-styles">
            .${this.config.errorClass} {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
            }
            
            .${this.config.errorClass} + label {
                color: #dc3545 !important;
            }
            
            .radio-wrapper.${this.config.errorClass},
            .w-radio.${this.config.errorClass} {
                border-color: #dc3545 !important;
                background-color: rgba(220, 53, 69, 0.05);
            }
            
            .${this.config.errorMessageClass} {
                color: #dc3545;
                font-size: 0.875rem;
                margin-top: 0.5rem;
                display: block;
                font-weight: 500;
            }
            
            .${this.config.errorMessageClass}::before {
                content: "⚠️ ";
                margin-right: 0.25rem;
            }
            
            .${this.config.errorContainerClass} {
                margin-top: 0.5rem;
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RadioValidator.init());
} else {
    RadioValidator.init();
}

// Export
window.RadioValidator = RadioValidator; 