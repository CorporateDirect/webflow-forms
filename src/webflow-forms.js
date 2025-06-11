/**
 * Webflow Forms - Enhanced form functionality for Webflow sites
 * @version 1.0.0
 * @author Your Name
 * @license MIT
 */

(function(window, document) {
    'use strict';

    // Main WebflowForms object
    const WebflowForms = {
        version: '1.0.0',
        
        // Configuration options
        config: {
            autoInit: true,
            validationClass: 'wf-form-validation',
            errorClass: 'wf-form-error',
            successClass: 'wf-form-success',
            loadingClass: 'wf-form-loading'
        },

        // Initialize the library
        init: function(options = {}) {
            this.config = { ...this.config, ...options };
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupForms());
            } else {
                this.setupForms();
            }
        },

        // Setup all forms on the page
        setupForms: function() {
            const forms = document.querySelectorAll('form[data-name]');
            forms.forEach(form => this.enhanceForm(form));
        },

        // Enhance individual form
        enhanceForm: function(form) {
            // Add form validation
            this.addValidation(form);
            
            // Add custom submit handler
            this.addSubmitHandler(form);
            
            // Add loading states
            this.addLoadingStates(form);
        },

        // Add form validation
        addValidation: function(form) {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        },

        // Validate individual field
        validateField: function(input) {
            const value = input.value.trim();
            const type = input.type;
            const required = input.hasAttribute('required');
            
            // Clear previous errors
            this.clearFieldError(input);
            
            // Required field validation
            if (required && !value) {
                this.showFieldError(input, 'This field is required');
                return false;
            }
            
            // Email validation
            if (type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.showFieldError(input, 'Please enter a valid email address');
                    return false;
                }
            }
            
            // Phone validation
            if (type === 'tel' && value) {
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                    this.showFieldError(input, 'Please enter a valid phone number');
                    return false;
                }
            }
            
            return true;
        },

        // Show field error
        showFieldError: function(input, message) {
            input.classList.add(this.config.errorClass);
            
            // Create or update error message
            let errorElement = input.parentNode.querySelector('.wf-form-error-message');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'wf-form-error-message';
                input.parentNode.appendChild(errorElement);
            }
            errorElement.textContent = message;
        },

        // Clear field error
        clearFieldError: function(input) {
            input.classList.remove(this.config.errorClass);
            const errorElement = input.parentNode.querySelector('.wf-form-error-message');
            if (errorElement) {
                errorElement.remove();
            }
        },

        // Add submit handler
        addSubmitHandler: function(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit(form);
            });
        },

        // Handle form submission
        handleSubmit: function(form) {
            // Validate all fields
            const inputs = form.querySelectorAll('input, textarea, select');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                return;
            }
            
            // Show loading state
            this.showLoading(form);
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Submit to Webflow
            this.submitToWebflow(form, data);
        },

        // Submit to Webflow
        submitToWebflow: function(form, data) {
            const action = form.getAttribute('action');
            
            fetch(action, {
                method: 'POST',
                body: new URLSearchParams(data),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            })
            .then(response => {
                if (response.ok) {
                    this.showSuccess(form);
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                this.showError(form, 'There was an error submitting the form. Please try again.');
            })
            .finally(() => {
                this.hideLoading(form);
            });
        },

        // Add loading states
        addLoadingStates: function(form) {
            const submitButton = form.querySelector('input[type="submit"], button[type="submit"]');
            if (submitButton) {
                submitButton.dataset.originalText = submitButton.value || submitButton.textContent;
            }
        },

        // Show loading state
        showLoading: function(form) {
            form.classList.add(this.config.loadingClass);
            const submitButton = form.querySelector('input[type="submit"], button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                if (submitButton.tagName === 'INPUT') {
                    submitButton.value = 'Submitting...';
                } else {
                    submitButton.textContent = 'Submitting...';
                }
            }
        },

        // Hide loading state
        hideLoading: function(form) {
            form.classList.remove(this.config.loadingClass);
            const submitButton = form.querySelector('input[type="submit"], button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                const originalText = submitButton.dataset.originalText;
                if (submitButton.tagName === 'INPUT') {
                    submitButton.value = originalText;
                } else {
                    submitButton.textContent = originalText;
                }
            }
        },

        // Show success message
        showSuccess: function(form) {
            form.classList.add(this.config.successClass);
            
            // Hide form and show success message
            const successDiv = form.parentNode.querySelector('.w-form-done');
            if (successDiv) {
                successDiv.style.display = 'block';
            }
            form.style.display = 'none';
        },

        // Show error message
        showError: function(form, message) {
            const errorDiv = form.parentNode.querySelector('.w-form-fail');
            if (errorDiv) {
                errorDiv.style.display = 'block';
                const errorText = errorDiv.querySelector('.w-form-fail-text');
                if (errorText) {
                    errorText.textContent = message;
                }
            }
        }
    };

    // Auto-initialize if config allows
    if (WebflowForms.config.autoInit) {
        WebflowForms.init();
    }

    // Export to global scope
    window.WebflowForms = WebflowForms;

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = WebflowForms;
    }

})(window, document); 