/**
 * Webflow Multi-Step Form Manager
 * Integrates with webflow-forms field enhancements
 * Provides advanced step navigation including conditional skips
 */

class WebflowMultiStepForm {
    constructor(formElement, options = {}) {
        this.form = formElement;
        this.options = {
            stepClass: 'form-step',
            activeClass: 'step-active',
            completedClass: 'step-completed',
            hiddenClass: 'step-hidden',
            nextButton: '[data-step-next]',
            prevButton: '[data-step-prev]',
            submitButton: '[data-step-submit]',
            progressBar: '[data-step-progress]',
            stepIndicator: '[data-step-indicator]',
            allowSkip: true,
            validateOnNext: true,
            saveProgress: true,
            ...options
        };
        
        this.currentStep = 0;
        this.steps = [];
        this.skipConditions = new Map();
        this.stepHistory = [];
        this.formData = new Map();
        
        this.init();
    }
    
    init() {
        this.steps = Array.from(this.form.querySelectorAll(`.${this.options.stepClass}`));
        this.setupEventListeners();
        this.showStep(0);
        this.updateProgress();
        
        // Integrate with WebflowFieldEnhancer if available
        if (window.WebflowFieldEnhancer) {
            this.form.addEventListener('webflowField:enhanced', () => {
                console.log('Field enhancements applied to multi-step form');
            });
        }
    }
    
    setupEventListeners() {
        // Next button
        this.form.addEventListener('click', (e) => {
            if (e.target.matches(this.options.nextButton)) {
                e.preventDefault();
                this.nextStep();
            }
        });
        
        // Previous button
        this.form.addEventListener('click', (e) => {
            if (e.target.matches(this.options.prevButton)) {
                e.preventDefault();
                this.prevStep();
            }
        });
        
        // Submit button
        this.form.addEventListener('click', (e) => {
            if (e.target.matches(this.options.submitButton)) {
                e.preventDefault();
                this.submitForm();
            }
        });
        
        // Save form data on input
        if (this.options.saveProgress) {
            this.form.addEventListener('input', (e) => {
                this.saveFieldData(e.target);
            });
        }
    }
    
    // Add skip condition for a specific step
    addSkipCondition(stepIndex, condition) {
        this.skipConditions.set(stepIndex, condition);
    }
    
    // Check if step should be skipped
    shouldSkipStep(stepIndex) {
        const condition = this.skipConditions.get(stepIndex);
        if (typeof condition === 'function') {
            return condition(this.getFormData(), stepIndex);
        }
        return false;
    }
    
    // Navigate to next step (with skip logic)
    nextStep() {
        if (this.options.validateOnNext && !this.validateCurrentStep()) {
            return false;
        }
        
        this.saveCurrentStepData();
        
        let nextStepIndex = this.currentStep + 1;
        
        // Apply skip logic
        while (nextStepIndex < this.steps.length && this.shouldSkipStep(nextStepIndex)) {
            console.log(`Skipping step ${nextStepIndex + 1}`);
            nextStepIndex++;
        }
        
        if (nextStepIndex < this.steps.length) {
            this.stepHistory.push(this.currentStep);
            this.showStep(nextStepIndex);
            this.updateProgress();
            this.triggerStepChange('next', nextStepIndex);
        } else {
            // Reached end, show submit
            this.showSubmitStep();
        }
        
        return true;
    }
    
    // Navigate to previous step
    prevStep() {
        if (this.stepHistory.length > 0) {
            const prevStepIndex = this.stepHistory.pop();
            this.showStep(prevStepIndex);
            this.updateProgress();
            this.triggerStepChange('prev', prevStepIndex);
        }
    }
    
    // Jump to specific step (useful for skip logic)
    jumpToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < this.steps.length) {
            this.stepHistory.push(this.currentStep);
            this.showStep(stepIndex);
            this.updateProgress();
            this.triggerStepChange('jump', stepIndex);
        }
    }
    
    // Show specific step
    showStep(stepIndex) {
        // Hide all steps
        this.steps.forEach((step, index) => {
            step.classList.remove(this.options.activeClass);
            step.classList.add(this.options.hiddenClass);
            
            // Mark completed steps
            if (index < stepIndex) {
                step.classList.add(this.options.completedClass);
            } else {
                step.classList.remove(this.options.completedClass);
            }
        });
        
        // Show current step
        if (this.steps[stepIndex]) {
            this.steps[stepIndex].classList.add(this.options.activeClass);
            this.steps[stepIndex].classList.remove(this.options.hiddenClass);
            this.currentStep = stepIndex;
            
            // Focus first input in step
            const firstInput = this.steps[stepIndex].querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
        
        this.updateStepButtons();
    }
    
    // Update progress bar and indicators
    updateProgress() {
        const progress = ((this.currentStep + 1) / this.steps.length) * 100;
        
        // Update progress bar
        const progressBar = this.form.querySelector(this.options.progressBar);
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', progress);
        }
        
        // Update step indicators
        const indicators = this.form.querySelectorAll(this.options.stepIndicator);
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentStep);
            indicator.classList.toggle('completed', index < this.currentStep);
        });
    }
    
    // Update step navigation buttons
    updateStepButtons() {
        const nextBtn = this.form.querySelector(this.options.nextButton);
        const prevBtn = this.form.querySelector(this.options.prevButton);
        const submitBtn = this.form.querySelector(this.options.submitButton);
        
        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 0 ? 'block' : 'none';
        }
        
        if (nextBtn && submitBtn) {
            const isLastStep = this.currentStep === this.steps.length - 1;
            nextBtn.style.display = isLastStep ? 'none' : 'block';
            submitBtn.style.display = isLastStep ? 'block' : 'none';
        }
    }
    
    // Validate current step
    validateCurrentStep() {
        const currentStepElement = this.steps[this.currentStep];
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        
        let isValid = true;
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        if (!isValid) {
            this.showValidationError('Please fill in all required fields');
        }
        
        return isValid;
    }
    
    // Save data from current step
    saveCurrentStepData() {
        const currentStepElement = this.steps[this.currentStep];
        const fields = currentStepElement.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            this.saveFieldData(field);
        });
    }
    
    // Save individual field data
    saveFieldData(field) {
        if (field.name) {
            this.formData.set(field.name, field.value);
        }
    }
    
    // Get all form data
    getFormData() {
        return Object.fromEntries(this.formData);
    }
    
    // Show validation error
    showValidationError(message) {
        const currentStepElement = this.steps[this.currentStep];
        let errorDiv = currentStepElement.querySelector('.step-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'step-error';
            errorDiv.style.cssText = `
                background: #fee;
                border: 1px solid #fcc;
                color: #c33;
                padding: 10px;
                margin: 10px 0;
                border-radius: 4px;
            `;
            currentStepElement.insertBefore(errorDiv, currentStepElement.firstChild);
        }
        
        errorDiv.textContent = message;
        setTimeout(() => errorDiv.remove(), 5000);
    }
    
    // Submit form
    submitForm() {
        if (!this.validateCurrentStep()) {
            return false;
        }
        
        this.saveCurrentStepData();
        
        // Trigger submit event with all form data
        const submitEvent = new CustomEvent('multiStepSubmit', {
            detail: {
                formData: this.getFormData(),
                steps: this.steps.length,
                completedSteps: this.currentStep + 1
            }
        });
        
        this.form.dispatchEvent(submitEvent);
        
        // If no custom handler, submit normally
        if (!this.form.hasAttribute('data-custom-submit')) {
            this.form.submit();
        }
    }
    
    // Trigger step change event
    triggerStepChange(direction, stepIndex) {
        const stepChangeEvent = new CustomEvent('stepChange', {
            detail: {
                direction,
                currentStep: stepIndex,
                totalSteps: this.steps.length,
                formData: this.getFormData()
            }
        });
        
        this.form.dispatchEvent(stepChangeEvent);
    }
    
    // Show submit step (if exists)
    showSubmitStep() {
        const submitStep = this.form.querySelector('.submit-step');
        if (submitStep) {
            this.steps.forEach(step => {
                step.classList.remove(this.options.activeClass);
                step.classList.add(this.options.hiddenClass);
            });
            
            submitStep.classList.add(this.options.activeClass);
            submitStep.classList.remove(this.options.hiddenClass);
        }
    }
}

// Auto-initialize multi-step forms
document.addEventListener('DOMContentLoaded', () => {
    const multiStepForms = document.querySelectorAll('[data-multi-step]');
    
    multiStepForms.forEach(form => {
        const multiStep = new WebflowMultiStepForm(form);
        
        // Example skip conditions - customize as needed
        
        // Skip step 2 if user selects "Individual" instead of "Business"
        multiStep.addSkipCondition(1, (formData) => {
            return formData['user-type'] === 'individual';
        });
        
        // Skip step 3 if user doesn't have employees
        multiStep.addSkipCondition(2, (formData) => {
            return formData['has-employees'] === 'no';
        });
        
        // Skip step 4 if user selects basic plan
        multiStep.addSkipCondition(3, (formData) => {
            return formData['plan-type'] === 'basic';
        });
        
        // Store instance for global access
        form._multiStepInstance = multiStep;
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebflowMultiStepForm;
} else if (typeof window !== 'undefined') {
    window.WebflowMultiStepForm = WebflowMultiStepForm;
} 