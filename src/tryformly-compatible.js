/**
 * Tryformly-Compatible Multi-Step Form System
 * Drop-in replacement for tryformly.com with exact data attribute compatibility
 * Integrates with existing webflow-forms field enhancements
 * @version 1.0.0
 */

(function(window, document) {
    'use strict';

    class TryformlyCompatible {
        constructor() {
            this.forms = new Map();
            this.currentSteps = new Map();
            this.formData = new Map();
            this.stepHistory = new Map();
            this.config = {
                transitionDuration: 300,
                autoInit: true,
                validateOnNext: true,
                saveProgress: true
            };
            
            if (this.config.autoInit) {
                this.init();
            }
        }
        
        init() {
            this.injectStyles();
            this.initializeForms();
            this.setupEventListeners();
            console.log('🎯 Tryformly-compatible system initialized');
        }
        
        initializeForms() {
            // Find all multi-step forms using tryformly data attributes
            const formSelectors = [
                '[data-multi-step]',
                '[data-formly]',
                '[data-step-form]',
                '.multi-step-form'
            ];
            
            const forms = document.querySelectorAll(formSelectors.join(', '));
            
            forms.forEach(form => {
                this.setupForm(form);
            });
        }
        
        setupForm(form) {
            const formId = form.id || `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            form.setAttribute('data-form-id', formId);
            
            // Find steps
            const steps = this.findSteps(form);
            
            if (steps.length === 0) {
                console.warn('No steps found in form:', form);
                return;
            }
            
            // Store form data
            this.forms.set(formId, {
                element: form,
                steps: steps,
                totalSteps: steps.length
            });
            
            this.currentSteps.set(formId, 0);
            this.formData.set(formId, new Map());
            this.stepHistory.set(formId, []);
            
            // Initialize form state
            this.initializeFormState(formId);
            
            console.log(`✅ Form ${formId} initialized with ${steps.length} steps`);
        }
        
        findSteps(form) {
            // Multiple selectors for step detection (tryformly compatibility)
            let steps = [];
            
            // Try different selectors in order of preference
            const selectors = [
                '[data-step]',
                '[data-step-number]',
                '[data-form-step]',
                '.form-step',
                '.step'
            ];
            
            for (const selector of selectors) {
                steps = Array.from(form.querySelectorAll(selector));
                if (steps.length > 0) break;
            }
            
            // Sort by step number if available
            steps.sort((a, b) => {
                const aNum = this.getStepNumber(a);
                const bNum = this.getStepNumber(b);
                return aNum - bNum;
            });
            
            // Ensure all steps have proper data attributes
            steps.forEach((step, index) => {
                const stepNumber = index + 1;
                if (!step.hasAttribute('data-step')) {
                    step.setAttribute('data-step', stepNumber);
                }
                step.classList.add('form-step');
            });
            
            return steps;
        }
        
        getStepNumber(stepElement) {
            return parseInt(
                stepElement.getAttribute('data-step') ||
                stepElement.getAttribute('data-step-number') ||
                stepElement.getAttribute('data-form-step') ||
                '1'
            );
        }
        
        initializeFormState(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            // Hide all steps except first
            formData.steps.forEach((step, index) => {
                if (index === 0) {
                    this.showStep(step);
                } else {
                    this.hideStep(step);
                }
            });
            
            this.updateProgress(formId);
            this.updateNavigation(formId);
            this.processConditionalLogic(formId);
        }
        
        setupEventListeners() {
            // Use event delegation for better performance
            document.addEventListener('click', this.handleClick.bind(this));
            document.addEventListener('change', this.handleChange.bind(this));
            document.addEventListener('input', this.handleInput.bind(this));
        }
        
        handleClick(e) {
            const target = e.target;
            const formId = this.getFormId(target);
            
            if (!formId) return;
            
            // Navigation buttons (tryformly data attributes)
            if (this.isNextButton(target)) {
                e.preventDefault();
                this.nextStep(formId);
            } else if (this.isPrevButton(target)) {
                e.preventDefault();
                this.prevStep(formId);
            } else if (this.isSubmitButton(target)) {
                e.preventDefault();
                this.submitForm(formId);
            }
            
            // Conditional navigation (data-go-to)
            else if (target.hasAttribute('data-go-to')) {
                e.preventDefault();
                this.handleGoTo(formId, target);
            }
            
            // Skip functionality (data-skip)
            else if (target.hasAttribute('data-skip')) {
                e.preventDefault();
                this.handleSkip(formId, target);
            }
        }
        
        handleChange(e) {
            const target = e.target;
            const formId = this.getFormId(target);
            
            if (!formId) return;
            
            // Save field data
            this.saveFieldData(formId, target);
            
            // Handle conditional logic based on data-answer
            if (target.hasAttribute('data-answer')) {
                this.checkConditionalLogic(formId, target);
            }
            
            // Handle radio button skip logic
            if (target.type === 'radio' && target.hasAttribute('data-skip')) {
                this.handleSkip(formId, target);
            }
        }
        
        handleInput(e) {
            const target = e.target;
            const formId = this.getFormId(target);
            
            if (!formId) return;
            
            // Debounced save for text inputs
            clearTimeout(target._inputTimeout);
            target._inputTimeout = setTimeout(() => {
                this.saveFieldData(formId, target);
            }, 300);
        }
        
        // Button detection methods
        isNextButton(element) {
            return element.matches([
                '[data-next]',
                '[data-step-next]', 
                '[data-formly-next]',
                '.next-btn',
                '.step-next'
            ].join(', '));
        }
        
        isPrevButton(element) {
            return element.matches([
                '[data-prev]',
                '[data-step-prev]',
                '[data-formly-prev]', 
                '.prev-btn',
                '.step-prev'
            ].join(', '));
        }
        
        isSubmitButton(element) {
            return element.matches([
                '[data-submit]',
                '[data-step-submit]',
                '[data-formly-submit]',
                '.submit-btn',
                '.step-submit'
            ].join(', '));
        }
        
        // Core navigation methods
        nextStep(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const currentStepIndex = this.currentSteps.get(formId);
            
            // Validate current step
            if (this.config.validateOnNext && !this.validateStep(formId, currentStepIndex)) {
                return false;
            }
            
            // Save current step data
            this.saveStepData(formId, currentStepIndex);
            
            // Calculate next step (with skip logic)
            const nextStepIndex = this.getNextStepIndex(formId, currentStepIndex);
            
            if (nextStepIndex < formData.totalSteps) {
                this.goToStep(formId, nextStepIndex);
            } else {
                this.handleComplete(formId);
            }
            
            return true;
        }
        
        prevStep(formId) {
            const history = this.stepHistory.get(formId);
            if (history && history.length > 0) {
                const prevStepIndex = history.pop();
                this.goToStep(formId, prevStepIndex, false);
            }
        }
        
        goToStep(formId, targetStepIndex, addToHistory = true) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const currentStepIndex = this.currentSteps.get(formId);
            
            if (targetStepIndex === currentStepIndex) return;
            if (targetStepIndex < 0 || targetStepIndex >= formData.totalSteps) return;
            
            // Add to history for back navigation
            if (addToHistory && targetStepIndex > currentStepIndex) {
                this.stepHistory.get(formId).push(currentStepIndex);
            }
            
            // Hide current step
            this.hideStep(formData.steps[currentStepIndex]);
            
            // Show target step after transition
            setTimeout(() => {
                this.showStep(formData.steps[targetStepIndex]);
                this.currentSteps.set(formId, targetStepIndex);
                this.updateProgress(formId);
                this.updateNavigation(formId);
                this.triggerStepChangeEvent(formId, targetStepIndex, currentStepIndex);
            }, this.config.transitionDuration);
        }
        
        getNextStepIndex(formId, currentStepIndex) {
            const formData = this.forms.get(formId);
            let nextStepIndex = currentStepIndex + 1;
            
            // Apply skip logic
            while (nextStepIndex < formData.totalSteps) {
                if (this.shouldSkipStep(formId, nextStepIndex)) {
                    console.log(`⏭️ Skipping step ${nextStepIndex + 1}`);
                    nextStepIndex++;
                } else {
                    break;
                }
            }
            
            return nextStepIndex;
        }
        
        shouldSkipStep(formId, stepIndex) {
            const formData = this.forms.get(formId);
            const step = formData.steps[stepIndex];
            const currentFormData = this.formData.get(formId);
            
            // Check data-skip-if attribute (tryformly compatibility)
            const skipCondition = step.getAttribute('data-skip-if');
            if (skipCondition) {
                return this.evaluateSkipCondition(skipCondition, currentFormData);
            }
            
            return false;
        }
        
        evaluateSkipCondition(condition, formData) {
            // Parse skip conditions like:
            // "field-name=value"
            // "field-name!=value"
            // "field-name=value1,value2" (multiple values)
            
            const match = condition.match(/^(.+?)(=|!=)(.+)$/);
            if (!match) return false;
            
            const [, fieldName, operator, values] = match;
            const expectedValues = values.split(',').map(v => v.trim());
            const actualValue = formData.get(fieldName.trim());
            
            if (operator === '!=') {
                return expectedValues.includes(actualValue);
            } else {
                return !expectedValues.includes(actualValue);
            }
        }
        
        // Conditional logic handling (data-go-to + data-answer)
        handleGoTo(formId, element) {
            const targetStep = element.getAttribute('data-go-to');
            const requiredAnswer = element.getAttribute('data-answer');
            
            // Check if answer matches (if specified)
            if (requiredAnswer) {
                const elementValue = this.getElementValue(element);
                if (elementValue !== requiredAnswer) {
                    return; // Don't navigate if answer doesn't match
                }
            }
            
            const targetStepIndex = parseInt(targetStep) - 1; // Convert to 0-based
            if (targetStepIndex >= 0) {
                this.goToStep(formId, targetStepIndex);
            }
        }
        
        checkConditionalLogic(formId, field) {
            const goToStep = field.getAttribute('data-go-to');
            const answerValue = field.getAttribute('data-answer');
            
            if (goToStep && answerValue) {
                const fieldValue = this.getElementValue(field);
                
                // For radio buttons, only proceed if this one is checked
                if (field.type === 'radio' && !field.checked) {
                    return;
                }
                
                // Check if value matches required answer
                if (fieldValue === answerValue) {
                    // Small delay for visual feedback
                    setTimeout(() => {
                        this.handleGoTo(formId, field);
                    }, 100);
                }
            }
        }
        
        // Skip functionality (data-skip)
        handleSkip(formId, element) {
            const skipToStep = element.getAttribute('data-skip');
            
            if (skipToStep) {
                const targetStepIndex = parseInt(skipToStep) - 1;
                this.goToStep(formId, targetStepIndex);
            } else {
                // Default skip behavior
                this.nextStep(formId);
            }
        }
        
        // Form validation
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
                    this.markFieldError(field);
                } else {
                    this.clearFieldError(field);
                }
            });
            
            if (!isValid) {
                this.showValidationErrors(formId, stepIndex, errors);
                // Focus first error
                if (errors.length > 0) {
                    errors[0].focus();
                }
            }
            
            return isValid;
        }
        
        isFieldValid(field) {
            if (!field.required) return true;
            
            switch (field.type) {
                case 'radio':
                    const radioGroup = document.querySelectorAll(`[name="${field.name}"]`);
                    return Array.from(radioGroup).some(radio => radio.checked);
                
                case 'checkbox':
                    return field.checked;
                
                case 'email':
                    return field.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
                
                default:
                    return field.value.trim() !== '';
            }
        }
        
        markFieldError(field) {
            field.classList.add('field-error', 'error');
            field.setAttribute('aria-invalid', 'true');
        }
        
        clearFieldError(field) {
            field.classList.remove('field-error', 'error');
            field.removeAttribute('aria-invalid');
        }
        
        showValidationErrors(formId, stepIndex, errors) {
            const formData = this.forms.get(formId);
            const step = formData.steps[stepIndex];
            
            // Remove existing errors
            const existing = step.querySelectorAll('.validation-error-message');
            existing.forEach(el => el.remove());
            
            // Create error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'validation-error-message';
            errorDiv.innerHTML = `
                <div class="error-content">
                    <strong>⚠️ Please complete these fields:</strong>
                    <ul>
                        ${errors.map(field => `<li>${this.getFieldLabel(field)}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            step.insertBefore(errorDiv, step.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.classList.add('fade-out');
                    setTimeout(() => errorDiv.remove(), 300);
                }
            }, 5000);
        }
        
        getFieldLabel(field) {
            // Try multiple ways to find field label
            const label = document.querySelector(`label[for="${field.id}"]`) ||
                         field.closest('label') ||
                         field.previousElementSibling?.tagName === 'LABEL' ? field.previousElementSibling : null;
            
            if (label) {
                return label.textContent.trim().replace(/\*\s*$/, '');
            }
            
            return field.getAttribute('placeholder') || field.name || 'Required field';
        }
        
        // Data management
        saveFieldData(formId, field) {
            const formDataMap = this.formData.get(formId);
            if (!formDataMap || !field.name) return;
            
            const value = this.getElementValue(field);
            formDataMap.set(field.name, value);
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
        
        getElementValue(element) {
            switch (element.type) {
                case 'radio':
                    return element.checked ? element.value : null;
                case 'checkbox':
                    return element.checked;
                default:
                    return element.value;
            }
        }
        
        // Step visibility
        showStep(step) {
            step.style.display = 'block';
            step.classList.remove('step-hidden');
            step.classList.add('step-visible', 'step-enter');
            
            // Focus first input
            setTimeout(() => {
                const firstInput = step.querySelector('input:not([type="hidden"]), select, textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }, this.config.transitionDuration);
        }
        
        hideStep(step) {
            step.classList.remove('step-visible', 'step-enter');
            step.classList.add('step-hidden', 'step-exit');
            
            setTimeout(() => {
                step.style.display = 'none';
                step.classList.remove('step-exit');
            }, this.config.transitionDuration);
        }
        
        // UI updates
        updateProgress(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const currentStep = this.currentSteps.get(formId);
            const progress = ((currentStep + 1) / formData.totalSteps) * 100;
            
            // Update progress bars
            const progressBars = formData.element.querySelectorAll(
                '[data-progress], [data-step-progress], .progress-bar'
            );
            progressBars.forEach(bar => {
                bar.style.width = `${progress}%`;
                bar.setAttribute('aria-valuenow', progress);
            });
            
            // Update step indicators
            const indicators = formData.element.querySelectorAll(
                '[data-step-indicator], .step-indicator'
            );
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentStep);
                indicator.classList.toggle('completed', index < currentStep);
            });
            
            // Update step counters
            const counters = formData.element.querySelectorAll(
                '[data-step-counter], .step-counter'
            );
            counters.forEach(counter => {
                counter.textContent = `${currentStep + 1} of ${formData.totalSteps}`;
            });
        }
        
        updateNavigation(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const currentStep = this.currentSteps.get(formId);
            const isFirst = currentStep === 0;
            const isLast = currentStep === formData.totalSteps - 1;
            
            // Update prev buttons
            const prevBtns = formData.element.querySelectorAll(
                '[data-prev], [data-step-prev], [data-formly-prev], .prev-btn'
            );
            prevBtns.forEach(btn => {
                btn.style.display = isFirst ? 'none' : '';
                btn.disabled = isFirst;
            });
            
            // Update next buttons
            const nextBtns = formData.element.querySelectorAll(
                '[data-next], [data-step-next], [data-formly-next], .next-btn'
            );
            nextBtns.forEach(btn => {
                btn.style.display = isLast ? 'none' : '';
            });
            
            // Update submit buttons
            const submitBtns = formData.element.querySelectorAll(
                '[data-submit], [data-step-submit], [data-formly-submit], .submit-btn'
            );
            submitBtns.forEach(btn => {
                btn.style.display = isLast ? '' : 'none';
            });
        }
        
        // Form completion
        handleComplete(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            // Check for final step
            const finalStep = formData.element.querySelector(
                '[data-final-step], [data-success-step], .final-step'
            );
            
            if (finalStep) {
                this.showFinalStep(formId, finalStep);
            } else {
                this.submitForm(formId);
            }
        }
        
        showFinalStep(formId, finalStep) {
            const formData = this.forms.get(formId);
            const currentStep = formData.steps[this.currentSteps.get(formId)];
            
            this.hideStep(currentStep);
            setTimeout(() => {
                this.showStep(finalStep);
            }, this.config.transitionDuration);
        }
        
        submitForm(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            // Final validation
            const currentStep = this.currentSteps.get(formId);
            if (!this.validateStep(formId, currentStep)) {
                return;
            }
            
            // Save final data
            this.saveStepData(formId, currentStep);
            
            // Get all form data
            const allData = Object.fromEntries(this.formData.get(formId));
            
            // Trigger event
            const event = new CustomEvent('multiStepSubmit', {
                detail: {
                    formId,
                    formData: allData,
                    totalSteps: formData.totalSteps
                }
            });
            formData.element.dispatchEvent(event);
            
            // Inject hidden inputs and submit
            this.injectHiddenInputs(formId, allData);
            
            if (!formData.element.hasAttribute('data-custom-submit')) {
                formData.element.submit();
            }
        }
        
        injectHiddenInputs(formId, data) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const form = formData.element;
            
            // Remove existing injected inputs
            const existing = form.querySelectorAll('[data-injected-input]');
            existing.forEach(input => input.remove());
            
            // Add hidden inputs for all data
            Object.entries(data).forEach(([name, value]) => {
                // Skip if visible input exists
                if (form.querySelector(`[name="${name}"]:not([data-injected-input])`)) {
                    return;
                }
                
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value || '';
                input.setAttribute('data-injected-input', 'true');
                form.appendChild(input);
            });
        }
        
        // Event handling
        triggerStepChangeEvent(formId, newStep, oldStep) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const event = new CustomEvent('stepChange', {
                detail: {
                    formId,
                    currentStep: newStep + 1,
                    previousStep: oldStep + 1,
                    totalSteps: formData.totalSteps,
                    direction: newStep > oldStep ? 'forward' : 'backward',
                    formData: Object.fromEntries(this.formData.get(formId))
                }
            });
            
            formData.element.dispatchEvent(event);
        }
        
        processConditionalLogic(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            // Add visual indicators for conditional elements
            const conditionalElements = formData.element.querySelectorAll(
                '[data-go-to], [data-answer], [data-skip]'
            );
            
            conditionalElements.forEach(element => {
                if (element.hasAttribute('data-go-to')) {
                    element.classList.add('has-goto-logic');
                }
                if (element.hasAttribute('data-skip')) {
                    element.classList.add('has-skip-logic');
                }
            });
        }
        
        // Utility methods
        getFormId(element) {
            const form = element.closest('[data-form-id]');
            return form ? form.getAttribute('data-form-id') : null;
        }
        
        // Inject required CSS
        injectStyles() {
            if (document.getElementById('tryformly-compatible-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'tryformly-compatible-styles';
            style.textContent = `
                /* Step transitions */
                .form-step, .step {
                    transition: opacity 300ms ease, transform 300ms ease;
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
                    animation: stepEnter 300ms ease;
                }
                
                .step-exit {
                    animation: stepExit 300ms ease;
                }
                
                @keyframes stepEnter {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
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
                        transform: translateX(-30px);
                    }
                }
                
                /* Validation styles */
                .field-error {
                    border-color: #dc3545 !important;
                    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
                }
                
                .validation-error-message {
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                    padding: 15px;
                    margin: 15px 0;
                    border-radius: 6px;
                    animation: errorSlideIn 300ms ease;
                }
                
                .validation-error-message.fade-out {
                    animation: errorSlideOut 300ms ease;
                }
                
                @keyframes errorSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes errorSlideOut {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                }
                
                /* Conditional logic indicators */
                .has-goto-logic {
                    position: relative;
                }
                
                .has-goto-logic::after {
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
                
                /* Progress indicators */
                .step-indicator {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: #e9ecef;
                    color: #6c757d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    transition: all 300ms ease;
                }
                
                .step-indicator.active {
                    background: #007bff;
                    color: white;
                }
                
                .step-indicator.completed {
                    background: #28a745;
                    color: white;
                }
            `;
            
            document.head.appendChild(style);
        }
        
        // Public API (tryformly compatibility)
        getCurrentStep(formElement) {
            const formId = formElement.getAttribute('data-form-id');
            return (this.currentSteps.get(formId) || 0) + 1;
        }
        
        getFormData(formElement) {
            const formId = formElement.getAttribute('data-form-id');
            const data = this.formData.get(formId);
            return data ? Object.fromEntries(data) : {};
        }
        
        goToStepManual(formElement, stepNumber) {
            const formId = formElement.getAttribute('data-form-id');
            this.goToStep(formId, stepNumber - 1);
        }
        
        getTotalSteps(formElement) {
            const formId = formElement.getAttribute('data-form-id');
            const formData = this.forms.get(formId);
            return formData ? formData.totalSteps : 0;
        }
    }

    // Initialize when DOM is ready
    let tryformlyInstance;
    
    function initialize() {
        tryformlyInstance = new TryformlyCompatible();
        
        // Make available globally (tryformly compatibility)
        window.Formly = tryformlyInstance;
        window.TryformlyCompatible = tryformlyInstance;
        
        console.log('🎯 Tryformly-compatible system ready');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})(window, document); 