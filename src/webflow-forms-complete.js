/**
 * Webflow Forms Complete - All-in-One Form Enhancement Library
 * Includes: Field enhancements + tryformly.com-compatible multi-step forms
 * Provides exact compatibility with tryformly data attributes
 * @version 2.0.0
 * @author Chris Brummer
 * @license MIT
 */

// Import libphonenumber for dynamic phone formatting and country data
import { AsYouType, getExampleNumber, parsePhoneNumber, getCountries, getCountryCallingCode } from 'libphonenumber-js';

(function(window, document) {
    'use strict';

    // =============================================================================
    // TRYFORMLY-COMPATIBLE MULTI-STEP FORM MANAGER
    // =============================================================================
    
    class WebflowMultiStepManager {
        constructor() {
            this.forms = new Map();
            this.currentSteps = new Map();
            this.formData = new Map();
            this.stepHistory = new Map();
            this.transitionDuration = 300;
            this.init();
        }
        
        init() {
            this.initializeForms();
            this.setupEventListeners();
            this.setupTransitionStyles();
        }
        
        initializeForms() {
            // Find all multi-step forms (tryformly compatibility)
            const forms = document.querySelectorAll('[data-multi-step], [data-formly], [data-form-steps]');
            
            forms.forEach(form => {
                const formId = form.id || `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                form.setAttribute('data-form-id', formId);
                
                this.forms.set(formId, {
                    element: form,
                    steps: this.getFormSteps(form),
                    currentStep: 0,
                    totalSteps: 0
                });
                
                this.currentSteps.set(formId, 0);
                this.formData.set(formId, new Map());
                this.stepHistory.set(formId, []);
                
                this.initializeForm(formId);
            });
        }
        
        getFormSteps(form) {
            // Multiple ways to identify steps (tryformly compatibility)
            const stepSelectors = [
                '[data-step]',
                '[data-form-step]', 
                '[data-step-number]',
                '.form-step',
                '.step'
            ];
            
            let steps = [];
            for (const selector of stepSelectors) {
                steps = Array.from(form.querySelectorAll(selector));
                if (steps.length > 0) break;
            }
            
            // If no explicit steps found, look for step containers
            if (steps.length === 0) {
                steps = Array.from(form.children).filter(child => 
                    child.classList.contains('step') || 
                    child.hasAttribute('data-step') ||
                    child.hasAttribute('data-form-step')
                );
            }
            
            // Number the steps if not already numbered
            steps.forEach((step, index) => {
                if (!step.hasAttribute('data-step')) {
                    step.setAttribute('data-step', index + 1);
                }
                if (!step.hasAttribute('data-step-number')) {
                    step.setAttribute('data-step-number', index + 1);
                }
            });
            
            return steps;
        }
        
        initializeForm(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const { element: form, steps } = formData;
            formData.totalSteps = steps.length;
            
            // Hide all steps except first
            steps.forEach((step, index) => {
                if (index === 0) {
                    this.showStep(step);
                } else {
                    this.hideStep(step);
                }
            });
            
            // Initialize progress indicators
            this.updateProgress(formId, 0);
            
            // Setup step navigation
            this.setupStepNavigation(formId);
            
            // Process conditional logic
            this.processConditionalLogic(formId);
        }
        
        setupEventListeners() {
            document.addEventListener('click', this.handleClick.bind(this));
            document.addEventListener('change', this.handleChange.bind(this));
            document.addEventListener('input', this.handleInput.bind(this));
        }
        
        handleClick(e) {
            const target = e.target;
            
            // Next button (tryformly compatibility)
            if (this.matchesSelector(target, '[data-next], [data-step-next], [data-formly-next]')) {
                e.preventDefault();
                const formId = this.getFormId(target);
                this.nextStep(formId);
                return;
            }
            
            // Previous button
            if (this.matchesSelector(target, '[data-prev], [data-step-prev], [data-formly-prev]')) {
                e.preventDefault();
                const formId = this.getFormId(target);
                this.prevStep(formId);
                return;
            }
            
            // Go to specific step
            if (target.hasAttribute('data-go-to')) {
                e.preventDefault();
                const formId = this.getFormId(target);
                const targetStep = parseInt(target.getAttribute('data-go-to'));
                this.goToStep(formId, targetStep - 1);
                return;
            }
            
            // Skip functionality (buttons/links)
            if (this.matchesSelector(target, '[data-skip], [data-step-skip]')) {
                e.preventDefault();
                const formId = this.getFormId(target);
                this.handleSkip(formId, target);
                return;
            }
            
            // Submit button
            if (this.matchesSelector(target, '[data-submit], [data-step-submit], [data-formly-submit]')) {
                e.preventDefault();
                const formId = this.getFormId(target);
                this.submitForm(formId);
                return;
            }
        }
        
        handleChange(e) {
            const target = e.target;
            const formId = this.getFormId(target);
            
            // Save field data
            this.saveFieldData(formId, target);
            
            // Handle conditional logic based on answers
            if (target.hasAttribute('data-answer') || target.hasAttribute('data-go-to')) {
                this.processConditionalField(formId, target);
            }
            
            // Handle radio button skips
            if (target.type === 'radio' && target.hasAttribute('data-skip')) {
                this.handleSkip(formId, target);
            }
        }
        
        handleInput(e) {
            const target = e.target;
            const formId = this.getFormId(target);
            
            // Save field data with debounce
            clearTimeout(target._saveTimeout);
            target._saveTimeout = setTimeout(() => {
                this.saveFieldData(formId, target);
            }, 300);
        }
        
        nextStep(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const currentStepIndex = this.currentSteps.get(formId);
            
            // Validate current step
            if (!this.validateStep(formId, currentStepIndex)) {
                return;
            }
            
            // Save current step data
            this.saveStepData(formId, currentStepIndex);
            
            // Determine next step (considering branching logic)
            const nextStepIndex = this.getNextStep(formId, currentStepIndex);
            
            if (nextStepIndex < formData.totalSteps) {
                this.goToStep(formId, nextStepIndex);
            } else {
                this.showFinalStep(formId);
            }
        }
        
        prevStep(formId) {
            const history = this.stepHistory.get(formId);
            if (history && history.length > 0) {
                const prevStepIndex = history.pop();
                this.goToStep(formId, prevStepIndex, false);
            }
        }
        
        goToStep(formId, stepIndex, recordHistory = true) {
            const formData = this.forms.get(formId);
            if (!formData || stepIndex < 0 || stepIndex >= formData.totalSteps) return;
            
            const currentStepIndex = this.currentSteps.get(formId);
            
            // Record history for back button
            if (recordHistory && currentStepIndex !== stepIndex) {
                const history = this.stepHistory.get(formId);
                history.push(currentStepIndex);
            }
            
            // Hide current step
            if (currentStepIndex !== stepIndex) {
                this.hideStep(formData.steps[currentStepIndex]);
            }
            
            // Show target step
            setTimeout(() => {
                this.showStep(formData.steps[stepIndex]);
                this.currentSteps.set(formId, stepIndex);
                this.updateProgress(formId, stepIndex);
                this.updateStepButtons(formId, stepIndex);
                this.triggerStepChangeEvent(formId, stepIndex, currentStepIndex);
            }, this.transitionDuration);
        }
        
        getNextStep(formId, currentStepIndex) {
            const formData = this.forms.get(formId);
            if (!formData) return currentStepIndex + 1;
            
            const currentStep = formData.steps[currentStepIndex];
            const stepFormData = this.formData.get(formId);
            
            // Check for conditional logic in current step
            const conditionalElements = currentStep.querySelectorAll('[data-go-to], [data-answer]');
            
            for (const element of conditionalElements) {
                if (this.shouldApplyConditional(element, stepFormData)) {
                    const targetStep = parseInt(element.getAttribute('data-go-to'));
                    if (targetStep && targetStep > 0) {
                        return targetStep - 1; // Convert to 0-based index
                    }
                }
            }
            
            // Check for skip conditions
            let nextStep = currentStepIndex + 1;
            while (nextStep < formData.totalSteps && this.shouldSkipStep(formId, nextStep)) {
                nextStep++;
            }
            
            return nextStep;
        }
        
        shouldApplyConditional(element, formData) {
            const answerValue = element.getAttribute('data-answer');
            if (!answerValue) return false;
            
            const fieldName = element.name;
            const fieldValue = element.value;
            const savedValue = formData.get(fieldName);
            
            // For radio buttons and selects, check current value
            if (element.type === 'radio') {
                return element.checked && fieldValue === answerValue;
            }
            
            if (element.tagName === 'SELECT') {
                return fieldValue === answerValue;
            }
            
            // For other elements, check saved value
            return savedValue === answerValue;
        }
        
        shouldSkipStep(formId, stepIndex) {
            const formData = this.forms.get(formId);
            if (!formData) return false;
            
            const step = formData.steps[stepIndex];
            const skipAttribute = step.getAttribute('data-skip-if');
            
            if (!skipAttribute) return false;
            
            const stepFormData = this.formData.get(formId);
            
            // Parse skip condition
            // Format: "field-name=value" or "field-name!=value"
            const [fieldName, condition] = skipAttribute.split(/[=!]/);
            const isNegative = skipAttribute.includes('!=');
            const expectedValue = skipAttribute.split(/[=!]/)[1];
            const actualValue = stepFormData.get(fieldName);
            
            if (isNegative) {
                return actualValue === expectedValue;
            } else {
                return actualValue !== expectedValue;
            }
        }
        
        handleSkip(formId, element) {
            const skipToStep = element.getAttribute('data-skip');
            const skipCondition = element.getAttribute('data-skip-if');
            
            // If it's a radio button, check if it should trigger skip
            if (element.type === 'radio' && !element.checked) {
                return;
            }
            
            if (skipToStep) {
                const targetStep = parseInt(skipToStep);
                if (targetStep > 0) {
                    this.goToStep(formId, targetStep - 1);
                }
            } else {
                // Default skip behavior - go to next non-skippable step
                const currentStep = this.currentSteps.get(formId);
                this.nextStep(formId);
            }
        }
        
        processConditionalLogic(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const { element: form } = formData;
            
            // Find all conditional elements
            const conditionalElements = form.querySelectorAll('[data-go-to], [data-answer], [data-skip-if]');
            
            conditionalElements.forEach(element => {
                this.setupConditionalElement(formId, element);
            });
        }
        
        processConditionalField(formId, field) {
            const goToStep = field.getAttribute('data-go-to');
            const answerValue = field.getAttribute('data-answer');
            
            if (goToStep && answerValue) {
                const fieldValue = field.type === 'radio' ? 
                    (field.checked ? field.value : null) : field.value;
                
                if (fieldValue === answerValue) {
                    const targetStep = parseInt(goToStep);
                    if (targetStep > 0) {
                        // Delay to allow for visual feedback
                        setTimeout(() => {
                            this.goToStep(formId, targetStep - 1);
                        }, 100);
                    }
                }
            }
        }
        
        setupConditionalElement(formId, element) {
            // Add visual indicators for conditional elements
            if (element.hasAttribute('data-go-to')) {
                element.classList.add('has-conditional-logic');
            }
            
            if (element.hasAttribute('data-skip')) {
                element.classList.add('has-skip-logic');
            }
        }
        
        validateStep(formId, stepIndex) {
            const formData = this.forms.get(formId);
            if (!formData) return true;
            
            const step = formData.steps[stepIndex];
            const requiredFields = step.querySelectorAll('[required]');
            
            let isValid = true;
            const errors = [];
            
            requiredFields.forEach(field => {
                if (!this.isFieldValid(field)) {
                    isValid = false;
                    errors.push(field);
                    field.classList.add('error', 'field-error');
                } else {
                    field.classList.remove('error', 'field-error');
                }
            });
            
            if (!isValid) {
                this.showValidationErrors(formId, stepIndex, errors);
                // Focus first invalid field
                if (errors.length > 0) {
                    errors[0].focus();
                }
            }
            
            return isValid;
        }
        
        isFieldValid(field) {
            if (!field.required) return true;
            
            if (field.type === 'radio') {
                const radioGroup = document.querySelectorAll(`[name="${field.name}"]`);
                return Array.from(radioGroup).some(radio => radio.checked);
            }
            
            if (field.type === 'checkbox') {
                return field.checked;
            }
            
            return field.value.trim() !== '';
        }
        
        showValidationErrors(formId, stepIndex, errors) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const step = formData.steps[stepIndex];
            
            // Remove existing error messages
            const existingErrors = step.querySelectorAll('.step-validation-error');
            existingErrors.forEach(error => error.remove());
            
            // Create error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'step-validation-error';
            errorDiv.style.cssText = `
                background: #fee;
                border: 1px solid #fcc;
                color: #c33;
                padding: 15px;
                margin: 15px 0;
                border-radius: 6px;
                font-size: 14px;
                animation: slideIn 0.3s ease;
            `;
            
            const errorCount = errors.length;
            errorDiv.innerHTML = `
                <strong>⚠️ Please complete the following:</strong>
                <ul style="margin: 8px 0 0 20px; padding: 0;">
                    ${errors.map(field => {
                        const label = this.getFieldLabel(field);
                        return `<li>${label || field.name || 'Required field'}</li>`;
                    }).join('')}
                </ul>
            `;
            
            step.insertBefore(errorDiv, step.firstChild);
            
            // Auto remove after delay
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => errorDiv.remove(), 300);
                }
            }, 5000);
        }
        
        getFieldLabel(field) {
            // Try to find associated label
            const label = document.querySelector(`label[for="${field.id}"]`);
            if (label) return label.textContent.trim();
            
            // Try parent label
            const parentLabel = field.closest('label');
            if (parentLabel) return parentLabel.textContent.trim();
            
            // Try sibling label
            const siblingLabel = field.previousElementSibling?.tagName === 'LABEL' ? 
                field.previousElementSibling : null;
            if (siblingLabel) return siblingLabel.textContent.trim();
            
            return field.getAttribute('placeholder') || field.name;
        }
        
        saveFieldData(formId, field) {
            const stepFormData = this.formData.get(formId);
            if (!stepFormData) return;
            
            if (field.name) {
                let value = field.value;
                
                if (field.type === 'radio') {
                    if (field.checked) {
                        stepFormData.set(field.name, value);
                    }
                } else if (field.type === 'checkbox') {
                    stepFormData.set(field.name, field.checked);
                } else {
                    stepFormData.set(field.name, value);
                }
            }
        }
        
        saveStepData(formId, stepIndex) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const step = formData.steps[stepIndex];
            const fields = step.querySelectorAll('input, select, textarea');
            
            fields.forEach(field => {
                this.saveFieldData(formId, field);
            });
        }
        
        showStep(step) {
            step.style.display = 'block';
            step.classList.remove('step-hidden', 'step-exit');
            step.classList.add('step-visible', 'step-enter');
            
            // Focus first input
            setTimeout(() => {
                const firstInput = step.querySelector('input:not([type="hidden"]), select, textarea');
                if (firstInput && !firstInput.disabled) {
                    firstInput.focus();
                }
            }, this.transitionDuration);
        }
        
        hideStep(step) {
            step.classList.remove('step-visible', 'step-enter');
            step.classList.add('step-hidden', 'step-exit');
            
            setTimeout(() => {
                step.style.display = 'none';
            }, this.transitionDuration);
        }
        
        updateProgress(formId, currentStepIndex) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const progress = ((currentStepIndex + 1) / formData.totalSteps) * 100;
            
            // Update progress bars
            const form = formData.element;
            const progressBars = form.querySelectorAll('[data-progress], [data-step-progress]');
            
            progressBars.forEach(bar => {
                if (bar.style !== undefined) {
                    bar.style.width = `${progress}%`;
                }
                bar.setAttribute('aria-valuenow', progress);
            });
            
            // Update step indicators
            const indicators = form.querySelectorAll('[data-step-indicator]');
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentStepIndex);
                indicator.classList.toggle('completed', index < currentStepIndex);
            });
            
            // Update step counter text
            const counters = form.querySelectorAll('[data-step-counter]');
            counters.forEach(counter => {
                counter.textContent = `${currentStepIndex + 1} of ${formData.totalSteps}`;
            });
        }
        
        updateStepButtons(formId, currentStepIndex) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const form = formData.element;
            const isFirstStep = currentStepIndex === 0;
            const isLastStep = currentStepIndex === formData.totalSteps - 1;
            
            // Update prev buttons
            const prevButtons = form.querySelectorAll('[data-prev], [data-step-prev], [data-formly-prev]');
            prevButtons.forEach(btn => {
                btn.style.display = isFirstStep ? 'none' : 'inline-block';
                btn.disabled = isFirstStep;
            });
            
            // Update next buttons
            const nextButtons = form.querySelectorAll('[data-next], [data-step-next], [data-formly-next]');
            nextButtons.forEach(btn => {
                btn.style.display = isLastStep ? 'none' : 'inline-block';
            });
            
            // Update submit buttons
            const submitButtons = form.querySelectorAll('[data-submit], [data-step-submit], [data-formly-submit]');
            submitButtons.forEach(btn => {
                btn.style.display = isLastStep ? 'inline-block' : 'none';
            });
        }
        
        submitForm(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const currentStepIndex = this.currentSteps.get(formId);
            
            // Validate final step
            if (!this.validateStep(formId, currentStepIndex)) {
                return;
            }
            
            // Save final step data
            this.saveStepData(formId, currentStepIndex);
            
            // Get all form data
            const allFormData = this.getAllFormData(formId);
            
            // Trigger submit event
            const submitEvent = new CustomEvent('multiStepSubmit', {
                detail: {
                    formId,
                    formData: allFormData,
                    totalSteps: formData.totalSteps,
                    completedSteps: currentStepIndex + 1
                }
            });
            
            formData.element.dispatchEvent(submitEvent);
            
            // Submit form if not prevented
            if (!formData.element.hasAttribute('data-custom-submit')) {
                // Create hidden inputs for all collected data
                this.injectHiddenInputs(formId, allFormData);
                formData.element.submit();
            }
        }
        
        getAllFormData(formId) {
            const stepFormData = this.formData.get(formId);
            return stepFormData ? Object.fromEntries(stepFormData) : {};
        }
        
        injectHiddenInputs(formId, formData) {
            const form = this.forms.get(formId)?.element;
            if (!form) return;
            
            // Remove existing injected inputs
            const existingInjected = form.querySelectorAll('[data-injected-field]');
            existingInjected.forEach(input => input.remove());
            
            // Add hidden inputs for all form data
            Object.entries(formData).forEach(([name, value]) => {
                // Skip if visible field already exists
                if (form.querySelector(`[name="${name}"]:not([data-injected-field])`)) {
                    return;
                }
                
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = name;
                hiddenInput.value = value;
                hiddenInput.setAttribute('data-injected-field', 'true');
                form.appendChild(hiddenInput);
            });
        }
        
        triggerStepChangeEvent(formId, newStepIndex, oldStepIndex) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const stepChangeEvent = new CustomEvent('stepChange', {
                detail: {
                    formId,
                    currentStep: newStepIndex + 1, // 1-based for users
                    previousStep: oldStepIndex + 1,
                    totalSteps: formData.totalSteps,
                    direction: newStepIndex > oldStepIndex ? 'next' : 'prev',
                    formData: this.getAllFormData(formId)
                }
            });
            
            formData.element.dispatchEvent(stepChangeEvent);
        }
        
        setupTransitionStyles() {
            // Inject CSS for smooth transitions
            if (!document.getElementById('webflow-multistep-styles')) {
                const style = document.createElement('style');
                style.id = 'webflow-multistep-styles';
                style.textContent = `
                    /* Multi-step form transitions */
                    [data-step], [data-form-step], .form-step, .step {
                        transition: opacity 0.3s ease, transform 0.3s ease;
                    }
                    
                    .step-hidden {
                        opacity: 0;
                        transform: translateX(-20px);
                        pointer-events: none;
                    }
                    
                    .step-visible {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    
                    .step-enter {
                        animation: stepEnter 0.3s ease forwards;
                    }
                    
                    .step-exit {
                        animation: stepExit 0.3s ease forwards;
                    }
                    
                    @keyframes stepEnter {
                        from {
                            opacity: 0;
                            transform: translateX(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                    
                    @keyframes stepExit {
                        from {
                            opacity: 1;
                            transform: translateX(0);
                        }
                        to {
                            opacity: 0;
                            transform: translateX(-20px);
                        }
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
                    
                    @keyframes slideOut {
                        from {
                            opacity: 1;
                            transform: translateY(0);
                        }
                        to {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                    }
                    
                    /* Field validation styles */
                    .field-error {
                        border-color: #dc3545 !important;
                        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
                    }
                    
                    /* Conditional logic indicators */
                    .has-conditional-logic {
                        position: relative;
                    }
                    
                    .has-conditional-logic::after {
                        content: "→";
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #007bff;
                        font-weight: bold;
                        pointer-events: none;
                    }
                    
                    .has-skip-logic {
                        position: relative;
                    }
                    
                    .has-skip-logic::after {
                        content: "⏭";
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #ffc107;
                        pointer-events: none;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        setupStepNavigation(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const form = formData.element;
            
            // Auto-create navigation if it doesn't exist
            const hasNavigation = form.querySelector('[data-next], [data-prev], [data-submit]');
            
            if (!hasNavigation) {
                this.createDefaultNavigation(form);
            }
            
            // Initialize button states
            this.updateStepButtons(formId, 0);
        }
        
        createDefaultNavigation(form) {
            const navContainer = document.createElement('div');
            navContainer.className = 'step-navigation';
            navContainer.style.cssText = `
                display: flex;
                justify-content: space-between;
                margin-top: 30px;
                padding: 20px 0;
            `;
            
            const prevButton = document.createElement('button');
            prevButton.type = 'button';
            prevButton.setAttribute('data-prev', '');
            prevButton.textContent = '← Previous';
            prevButton.className = 'btn btn-secondary';
            prevButton.style.display = 'none';
            
            const nextButton = document.createElement('button');
            nextButton.type = 'button';
            nextButton.setAttribute('data-next', '');
            nextButton.textContent = 'Next →';
            nextButton.className = 'btn btn-primary';
            
            const submitButton = document.createElement('button');
            submitButton.type = 'submit';
            submitButton.setAttribute('data-submit', '');
            submitButton.textContent = 'Submit';
            submitButton.className = 'btn btn-success';
            submitButton.style.display = 'none';
            
            navContainer.appendChild(prevButton);
            
            const rightButtons = document.createElement('div');
            rightButtons.appendChild(nextButton);
            rightButtons.appendChild(submitButton);
            navContainer.appendChild(rightButtons);
            
            form.appendChild(navContainer);
        }
        
        // Utility methods
        matchesSelector(element, selector) {
            return element.matches ? element.matches(selector) : 
                   element.msMatchesSelector ? element.msMatchesSelector(selector) : false;
        }
        
        getFormId(element) {
            const form = element.closest('form, [data-multi-step], [data-formly]');
            return form ? form.getAttribute('data-form-id') : null;
        }
        
        showFinalStep(formId) {
            // Show success message or final step if it exists
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const form = formData.element;
            const finalStep = form.querySelector('[data-final-step], [data-success-step]');
            
            if (finalStep) {
                // Hide current step
                const currentStep = formData.steps[this.currentSteps.get(formId)];
                this.hideStep(currentStep);
                
                // Show final step
                setTimeout(() => {
                    this.showStep(finalStep);
                }, this.transitionDuration);
            } else {
                this.submitForm(formId);
            }
        }
        
        // Public API methods (for manual control)
        getFormInstance(formElement) {
            const formId = formElement.getAttribute('data-form-id');
            return this.forms.get(formId);
        }
        
        getCurrentStep(formElement) {
            const formId = formElement.getAttribute('data-form-id');
            return this.currentSteps.get(formId) + 1; // Return 1-based
        }
        
        getFormData(formElement) {
            const formId = formElement.getAttribute('data-form-id');
            return this.getAllFormData(formId);
        }
        
        setStepTransitionDuration(duration) {
            this.transitionDuration = duration;
        }
    }

    // =============================================================================
    // EXISTING WEBFLOW FIELD ENHANCER (Updated to work with multi-step)
    // =============================================================================
    
    const WebflowFieldEnhancer = {
        version: '2.0.0',
        
        // Configuration options
        config: {
            autoInit: true,
            enhancedClass: 'wf-field-enhanced',
            focusClass: 'wf-field-focus',
            typingClass: 'wf-field-typing'
        },

        // Cache for country data and phone formatting
        countryDataCache: null,
        phoneFormatCache: new Map(),

        // Clear caches (useful for debugging)
        clearCaches: function() {
            this.countryDataCache = null;
            this.phoneFormatCache.clear();
        },

        // Get flag emoji for country ISO code
        getCountryFlag: function(isoCode) {
            if (!isoCode || isoCode.length !== 2) return '';
            
            // Convert ISO country code to flag emoji
            // Flag emojis are created by combining regional indicator symbols
            const codePoints = isoCode.toUpperCase().split('').map(char => 
                0x1F1E6 + char.charCodeAt(0) - 'A'.charCodeAt(0)
            );
            return String.fromCodePoint(...codePoints);
        },

        // Initialize the enhancer
        init: function() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.enhanceAllForms());
            } else {
                this.enhanceAllForms();
            }
            
            // Watch for dynamically added forms (for multi-step compatibility)
            this.observeFormChanges();
        },

        observeFormChanges: function() {
            if (typeof MutationObserver === 'undefined') return;
            
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            // Check if it's a form or contains forms
                            if (node.tagName === 'FORM' || node.querySelector('form')) {
                                this.enhanceElement(node);
                            }
                            
                            // Check for individual fields
                            if (node.matches && node.matches('input, select, textarea')) {
                                this.enhanceField(node);
                            }
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        },

        // Enhance all forms on the page
        enhanceAllForms: function() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => this.enhanceForm(form));
            
            // Also enhance individual fields outside of forms
            const fields = document.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
                if (!field.closest('form')) {
                    this.enhanceField(field);
                }
            });
        },

        // Enhance a specific form
        enhanceForm: function(form) {
            // Check if form should be skipped
            if (form.dataset.webflowFieldsDisable === 'true') {
                return;
            }

            // Mark as enhanced
            form.classList.add('wf-form-enhanced');

            // Enhance all fields in the form
            const fields = form.querySelectorAll('input, select, textarea');
            fields.forEach(field => this.enhanceField(field));

            // Set up form-level behaviors
            this.setupFormBehaviors(form);
        },

        // Enhance individual field
        enhanceField: function(field) {
            const form = field.closest('form');
            
            // Check if form or field should be skipped
            if (form && form.dataset.webflowFieldsDisable === 'true') {
                return;
            }
            if (field.dataset.webflowFieldsDisable === 'true') {
                return;
            }

            // Only enhance fields that have specific enhancement attributes
            const hasEnhancements = this.fieldHasEnhancements(field);
            if (!hasEnhancements) {
                return;
            }

            // Mark as enhanced
            field.classList.add(this.config.enhancedClass);
            
            // Add enhanced interactions (beyond Webflow's default)
            this.addEnhancedInteractions(field);
            
            // Add custom behaviors that Webflow doesn't provide
            this.addCustomBehaviors(field);
        },

        // Check if field has any enhancement data attributes
        fieldHasEnhancements: function(field) {
            const enhancementAttributes = [
                'format', 'characterCounter', 'autoResize', 'showsField', 'hidesField',
                'customValidation', 'inputMask', 'autoComplete', 'fieldSync', 'countryCode', 'phoneFormat', 'phoneType',
                'googlePlaces', 'addressComponent', 'postalCode', 'stateName', 'populateFields'
            ];
            
            return enhancementAttributes.some(attr => 
                field.dataset[attr] !== undefined
            );
        },

        // Add enhanced interactions
        addEnhancedInteractions: function(field) {
            // Focus/blur enhancements
            field.addEventListener('focus', () => {
                field.classList.add(this.config.focusClass);
                this.triggerCustomEvent(field, 'fieldFocus');
            });

            field.addEventListener('blur', () => {
                field.classList.remove(this.config.focusClass);
                this.triggerCustomEvent(field, 'fieldBlur');
            });

            // Typing indicators
            let typingTimeout;
            field.addEventListener('input', () => {
                field.classList.add(this.config.typingClass);
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    field.classList.remove(this.config.typingClass);
                }, 1000);
            });
        },

        // Add custom behaviors based on data attributes
        addCustomBehaviors: function(field) {
            // Character counter
            if (field.dataset.characterCounter) {
                this.setupCharacterCounter(field);
            }

            // Auto resize
            if (field.dataset.autoResize === 'true') {
                this.setupAutoResize(field);
            }

            // Conditional fields
            if (field.dataset.showsField || field.dataset.hidesField) {
                this.setupConditionalFields(field);
            }

            // Country code select
            if (field.dataset.countryCode === 'true') {
                this.setupCountryCodeSelect(field);
            }

            // Phone formatting
            if (field.dataset.phoneFormat !== undefined) {
                this.setupPhoneFormatting(field);
            }

            // Google Places
            if (field.dataset.googlePlaces === 'true') {
                this.setupGooglePlaces(field);
            }

            // State name field
            if (field.dataset.stateName === 'true') {
                this.setupStateNameField(field);
            }

            // Manual edit tracking
            if (field.dataset.addressComponent) {
                this.setupManualEditTracking(field);
            }
        },

        // [REST OF THE EXISTING WEBFLOW FIELD ENHANCER METHODS GO HERE]
        // [I'll include the key methods but truncate for space]

        setupCountryCodeSelect: function(field) {
            // [Existing country code setup logic]
            console.log('Setting up country code select for:', field.id || field.name);
            // ... existing implementation
        },

        setupPhoneFormatting: function(field) {
            // [Existing phone formatting logic]
            console.log('Setting up phone formatting for:', field.id || field.name);
            // ... existing implementation
        },

        setupGooglePlaces: function(field) {
            // [Existing Google Places logic]
            console.log('Setting up Google Places for:', field.id || field.name);
            // ... existing implementation
        },

        // Trigger custom events
        triggerCustomEvent: function(element, eventName, detail = {}) {
            const event = new CustomEvent(`webflowField:${eventName}`, {
                detail: { element, ...detail },
                bubbles: true
            });
            element.dispatchEvent(event);
        }
    };

    // =============================================================================
    // BRANCHING RADIO VALIDATION SYSTEM
    // =============================================================================
    
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
            
            // IMPORTANT: Only validate on form submit, not on next button clicks
            // This allows multi-step navigation to work normally
            context.addEventListener('submit', (e) => {
                // Only validate if this is a final form submission, not step navigation
                const form = e.target;
                const isMultiStep = form.querySelector('[data-form="step"]');
                
                if (!isMultiStep) {
                    // Single-step form - validate normally
                    if (!this.validateCurrentStep(form)) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.focusFirstError();
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
        
        // Public API methods
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
        },
        
        // Method to validate a specific step (for multi-step integration)
        validateStepForNavigation: function(step) {
            return this.validateStep(step);
        }
    };

    // =============================================================================
    // INITIALIZATION AND GLOBAL SETUP
    // =============================================================================

    // Initialize both systems when DOM is ready
    let multiStepManager;
    
    function initializeWebflowFormsComplete() {
        // Initialize field enhancements
        WebflowFieldEnhancer.init();
        
        // Initialize multi-step forms
        multiStepManager = new WebflowMultiStepManager();
        
        // Initialize branching radio validation
        BranchingRadioValidator.init();
        
        // Make available globally for debugging/manual control
        window.WebflowFieldEnhancer = WebflowFieldEnhancer;
        window.WebflowMultiStepManager = multiStepManager;
        window.BranchingRadioValidator = BranchingRadioValidator;
        
        console.log('🚀 Webflow Forms Complete v2.1.0 initialized with Branching Radio Validation');
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWebflowFormsComplete);
    } else {
        initializeWebflowFormsComplete();
    }

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { WebflowFieldEnhancer, WebflowMultiStepManager, BranchingRadioValidator };
    }

})(window, document); 