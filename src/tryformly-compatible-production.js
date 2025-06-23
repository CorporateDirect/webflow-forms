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
            // Inject styles first and hide steps immediately
            this.injectStyles();
            this.hideAllStepsImmediately();
            this.initializeForms();
            this.setupEventListeners();
            }
        
        hideAllStepsImmediately() {
            // Find and hide all potential steps immediately, before form initialization
            const stepSelectors = [
                '[data-form="step"]',
                '[data-step]',
                '[data-step-number]',
                '[data-form-step]',
                '.form-step',
                '.step'
            ];
            
            let totalFound = 0;
            
            stepSelectors.forEach(selector => {
                const steps = document.querySelectorAll(selector);
                steps.forEach((step, index) => {
                    .display);
                    
                    step.style.display = 'none';
                    step.style.visibility = 'hidden';
                    step.classList.add('step-hidden');
                    step.classList.add('class-hidden');
                    
                    .display);
                    
                    totalFound++;
                });
            });
            
            if (totalFound === 0) {
                }
        }
        
        initializeForms() {
            // Find all multi-step forms using tryformly data attributes
            const formSelectors = [
                '[data-form="multistep"]',  // tryformly.com standard
                '[data-multi-step]',        // our alternative
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
            
            }
        
        findSteps(form) {
            // Multiple selectors for step detection (tryformly compatibility)
            let steps = [];
            
            // Try different selectors in order of preference
            const selectors = [
                '[data-form="step"]',       // tryformly.com standard
                '[data-step]',              // our alternative
                '[data-step-number]',
                '[data-form-step]',
                '.form-step',
                '.step'
            ];
            
            for (const selector of selectors) {
                steps = Array.from(form.querySelectorAll(selector));
                if (steps.length > 0) {
                    break;
                }
            }
            
            if (steps.length === 0) {
                return [];
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
                if (!step.hasAttribute('data-step') && !step.hasAttribute('data-form')) {
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
            if (!formData) {
                return;
            }
            
            // Hide all steps immediately, then show first
            formData.steps.forEach((step, index) => {
                .display);
                
                this.hideStep(step);  // Hide all first
                
                .display);
            });
            
            // Show first step
            if (formData.steps.length > 0) {
                this.showStep(formData.steps[0]);
                .display);
            }
            
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
            
            ,
                'data-answer': target.getAttribute('data-answer'),
                'data-next': target.getAttribute('data-next'),
                'data-form': target.getAttribute('data-form'),
                'class': target.className
            });
            
            if (!formId) {
                return;
            }
            
            // Prevent double-clicks with debounce
            const now = Date.now();
            const lastClick = target._lastClickTime || 0;
            if (now - lastClick < 500) {
                e.preventDefault();
                return;
            }
            target._lastClickTime = now;
            
            // Check if this is a radio button or radio label click
            let radioInput = null;
            let parentWithAttributes = null;
            
            if (target.type === 'radio') {
                radioInput = target;
                } else if (target.tagName === 'LABEL') {
                // Find associated radio button
                const forAttr = target.getAttribute('for');
                if (forAttr) {
                    radioInput = document.getElementById(forAttr);
                    } else {
                    // Look for radio inside label
                    radioInput = target.querySelector('input[type="radio"]');
                    }
            } else {
                // Check if clicked element is inside a radio container
                const radioContainer = target.closest('.radio_field, .w-radio, [data-go-to]');
                if (radioContainer) {
                    radioInput = radioContainer.querySelector('input[type="radio"]');
                    }
            }
            
            // If we found a radio input, handle it specially
            if (radioInput) {
                // Ensure the radio gets selected
                if (!radioInput.checked) {
                    radioInput.checked = true;
                    // Trigger change event to save data
                    radioInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
                
                // Look for data attributes on the radio input, its label, or parent containers
                parentWithAttributes = this.findElementWithGoToAttributes(radioInput);
                
                if (parentWithAttributes) {
                    const goTo = parentWithAttributes.getAttribute('data-go-to');
                    const answer = parentWithAttributes.getAttribute('data-answer');
                    
                    if (goTo) {
                        // Create a temporary element with the attributes for handleGoTo
                        const tempElement = {
                            getAttribute: (attr) => parentWithAttributes.getAttribute(attr),
                            name: radioInput.name,
                            value: radioInput.value,
                            type: 'radio',
                            checked: true
                        };
                        
                        // Small delay to allow for visual feedback
                        setTimeout(() => {
                            this.handleGoTo(formId, tempElement);
                        }, 200);
                        
                        e.preventDefault();
                        return;
                    }
                }
            }
            
            // Navigation buttons (tryformly data attributes)
            if (this.isNextButton(target)) {
                e.preventDefault();
                e.stopPropagation();
                this.nextStep(formId);
            } else if (this.isPrevButton(target)) {
                e.preventDefault();
                e.stopPropagation();
                this.prevStep(formId);
            } else if (this.isSubmitButton(target)) {
                e.preventDefault();
                e.stopPropagation();
                this.submitForm(formId);
            }
            
            // Conditional navigation (data-go-to)
            else if (target.hasAttribute('data-go-to')) {
                e.preventDefault();
                e.stopPropagation();
                this.handleGoTo(formId, target);
            }
            
            // Skip functionality (data-skip)
            else if (target.hasAttribute('data-skip')) {
                e.preventDefault();
                e.stopPropagation();
                this.handleSkip(formId, target);
            }
            
            else {
                }
        }
        
        // Helper method to find element with data-go-to attributes
        findElementWithGoToAttributes(radioInput) {
            // Check the radio input itself
            if (radioInput.hasAttribute('data-go-to')) {
                return radioInput;
            }
            
            // Check associated label
            if (radioInput.id) {
                const label = document.querySelector(`label[for="${radioInput.id}"]`);
                if (label && label.hasAttribute('data-go-to')) {
                    return label;
                }
            }
            
            // Check parent label
            const parentLabel = radioInput.closest('label');
            if (parentLabel && parentLabel.hasAttribute('data-go-to')) {
                return parentLabel;
            }
            
            // Check radio container classes
            const radioContainer = radioInput.closest('.radio_field, .w-radio, [data-go-to]');
            if (radioContainer && radioContainer.hasAttribute('data-go-to')) {
                return radioContainer;
            }
            
            return null;
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
            
            // For radio buttons, also check parent elements for data attributes
            if (target.type === 'radio') {
                const elementWithAttributes = this.findElementWithGoToAttributes(target);
                if (elementWithAttributes && elementWithAttributes.hasAttribute('data-go-to')) {
                    // Create a temporary element with the attributes for conditional logic
                    const tempElement = {
                        getAttribute: (attr) => elementWithAttributes.getAttribute(attr),
                        name: target.name,
                        value: target.value,
                        type: 'radio',
                        checked: target.checked
                    };
                    
                    this.checkConditionalLogic(formId, tempElement);
                }
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
                '[data-form="next-btn"]',   // tryformly.com standard
                '[data-next]',              // our alternative
                '[data-step-next]', 
                '[data-formly-next]',
                '.next-btn',
                '.step-next'
            ].join(', '));
        }

        isPrevButton(element) {
            return element.matches([
                '[data-form="back-btn"]',   // tryformly.com standard  
                '[data-prev]',              // our alternative
                '[data-step-prev]',
                '[data-formly-prev]', 
                '.prev-btn',
                '.step-prev'
            ].join(', '));
        }
        
        isSubmitButton(element) {
            return element.matches([
                '[data-form="submit-btn"]', // tryformly.com standard
                '[data-submit]',            // our alternative
                '[data-step-submit]',
                '[data-formly-submit]',
                '.submit-btn',
                '.step-submit'
            ].join(', '));
        }
        
        // Core navigation methods
        nextStep(formId) {
            const formData = this.forms.get(formId);
            if (!formData) {
                return;
            }
            
            const currentStepIndex = this.currentSteps.get(formId);
            `);
            
            // Validate current step
            if (this.config.validateOnNext && !this.validateStep(formId, currentStepIndex)) {
                return false;
            }
            
            // Save current step data
            this.saveStepData(formId, currentStepIndex);
            
            // Calculate next step (with skip logic)
            const nextStepIndex = this.getNextStepIndex(formId, currentStepIndex);
            `);
            
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
            + 1} to step ${targetStepIndex + 1}`);
            
            const formData = this.forms.get(formId);
            if (!formData) {
                return;
            }
            
            const currentStepIndex = this.currentSteps.get(formId);
            
            if (targetStepIndex === currentStepIndex) {
                return;
            }
            
            if (targetStepIndex < 0 || targetStepIndex >= formData.totalSteps) {
                return;
            }
            
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
            
            // Store the go-to value for step-wrapper logic
            const formData = this.formData.get(formId);
            if (formData) {
                formData.set('_lastGoTo', targetStep);
                // Also store the target step value for step-wrapper matching
                formData.set('_currentNavigation', targetStep);
                }
            
            // Handle numeric step navigation (e.g., "2", "3")
            if (/^\d+$/.test(targetStep)) {
                const targetStepIndex = parseInt(targetStep) - 1; // Convert to 0-based
                if (targetStepIndex >= 0) {
                    this.goToStep(formId, targetStepIndex);
                }
            } 
            // Handle named step navigation (e.g., "step-2", "step-3")
            else if (targetStep.startsWith('step-')) {
                const stepNumber = targetStep.replace('step-', '');
                if (/^\d+$/.test(stepNumber)) {
                    const targetStepIndex = parseInt(stepNumber) - 1; // Convert to 0-based
                    if (targetStepIndex >= 0) {
                        this.goToStep(formId, targetStepIndex);
                    }
                } else {
                    }
            } 
            else {
                // Handle branch navigation (for step-wrappers)
                // Store the branch target for wrapper matching
                if (formData) {
                    formData.set('_branchTarget', targetStep);
                    }
                
                this.nextStep(formId);
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
                } else {
                    }
            } else {
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
            .display);
            
            // Use setProperty with important to override aggressive hiding CSS
            step.style.setProperty('display', 'block', 'important');
            step.style.setProperty('visibility', 'visible', 'important');
            step.style.setProperty('opacity', '1', 'important');
            step.style.setProperty('position', 'relative', 'important');
            step.style.setProperty('left', 'auto', 'important');
            step.style.setProperty('top', 'auto', 'important');
            step.style.setProperty('width', 'auto', 'important');
            step.style.setProperty('height', 'auto', 'important');
            step.style.setProperty('overflow', 'visible', 'important');
            step.style.setProperty('pointer-events', 'auto', 'important');
            step.style.setProperty('z-index', 'auto', 'important');
            
            // Remove ALL hiding classes and add visible class
            step.classList.remove('step-hidden', 'immediately-hidden', 'class-hidden');
            step.classList.add('step-visible', 'step-enter');
            
            // Force remove any remaining hiding classes
            const hidingClasses = ['step-hidden', 'immediately-hidden', 'class-hidden'];
            hidingClasses.forEach(cls => {
                if (step.classList.contains(cls)) {
                    step.classList.remove(cls);
                    }
            });
            
            .display);
            
            // Debug parent elements that might be hiding the step
            let parent = step.parentElement;
            let level = 1;
            while (parent && level <= 3) {
                const parentStyles = window.getComputedStyle(parent);
                :`, {
                    display: parentStyles.display,
                    visibility: parentStyles.visibility,
                    opacity: parentStyles.opacity,
                    overflow: parentStyles.overflow,
                    height: parentStyles.height,
                    maxHeight: parentStyles.maxHeight
                });
                parent = parent.parentElement;
                level++;
            }
            
            // Check if step is actually in viewport
            const rect = step.getBoundingClientRect();
            const computedStyles = window.getComputedStyle(step);
            // Check for visibility blockers
            // Check what element is actually at the step's position
            const elementAtPosition = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
            );
            
            // Handle step-wrappers with data-answer attributes (tryformly branching logic)
            this.showStepWrappers(step);
            
            // Focus first input
            setTimeout(() => {
                const firstInput = step.querySelector('input:not([type="hidden"]), select, textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }, this.config.transitionDuration);
            
            // Add visual debugging aid
            step.style.border = '5px solid red';
            step.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
            step.style.zIndex = '9999';
            // Force visibility as a last resort
            if (rect.width === 0 || rect.height === 0) {
                step.style.display = 'block';
                step.style.visibility = 'visible';
                step.style.opacity = '1';
                step.style.position = 'static';
                step.style.width = 'auto';
                step.style.height = 'auto';
                step.style.overflow = 'visible';
                
                // Force reflow
                step.offsetHeight;
                
                const newRect = step.getBoundingClientRect();
                }
            
            }
        
        hideStep(step) {
            .display);
            
            // Use setProperty with important to ensure hiding overrides any other CSS
            step.style.setProperty('display', 'none', 'important');
            step.style.setProperty('visibility', 'hidden', 'important');
            step.style.setProperty('opacity', '0', 'important');
            step.style.setProperty('position', 'absolute', 'important');
            step.style.setProperty('left', '-9999px', 'important');
            step.style.setProperty('top', '-9999px', 'important');
            step.style.setProperty('pointer-events', 'none', 'important');
            
            step.classList.remove('step-visible', 'step-enter');
            step.classList.add('step-hidden');
            
            .display);
            }
        
        // Step-wrapper branching logic (tryformly compatibility)
        showStepWrappers(step) {
            const formId = this.getFormId(step);
            if (!formId) return;
            
            const formData = this.formData.get(formId);
            if (!formData) return;
            
            // Find all step-wrappers in this step
            const stepWrappers = step.querySelectorAll('[data-answer]');
            
            if (stepWrappers.length === 0) {
                return;
            }
            
            // Hide all step-wrappers initially
            stepWrappers.forEach((wrapper, index) => {
                const answerValue = wrapper.getAttribute('data-answer');
                wrapper.style.display = 'none';
                wrapper.classList.remove('wrapper-visible');
                wrapper.classList.add('wrapper-hidden');
            });
            
            // Determine which wrapper(s) to show based on previous selections
            const activeWrapper = this.getActiveStepWrapper(step, formData);
            
            if (activeWrapper) {
                activeWrapper.style.display = 'block';
                activeWrapper.classList.remove('wrapper-hidden');
                activeWrapper.classList.add('wrapper-visible');
                }"`);
            } else {
                // Show first wrapper with empty data-answer (first step wrapper)
                const firstWrapper = step.querySelector('[data-answer=""]');
                if (firstWrapper) {
                    firstWrapper.style.display = 'block';
                    firstWrapper.classList.remove('wrapper-hidden');
                    firstWrapper.classList.add('wrapper-visible');
                    ');
                } else {
                    // If no empty data-answer wrapper, show the first wrapper
                    const fallbackWrapper = stepWrappers[0];
                    if (fallbackWrapper) {
                        fallbackWrapper.style.display = 'block';
                        fallbackWrapper.classList.remove('wrapper-hidden');
                        fallbackWrapper.classList.add('wrapper-visible');
                        }"`);
                    }
                }
            }
        }
        
        getActiveStepWrapper(step, formData) {
            const stepWrappers = step.querySelectorAll('[data-answer]');
            
            // Check each wrapper's data-answer against form data
            for (const wrapper of stepWrappers) {
                const answerValue = wrapper.getAttribute('data-answer');
                
                // Skip empty answers (first step wrappers)
                if (answerValue === '') continue;
                
                // Check if this answer matches any form field value
                if (this.hasMatchingFormValue(formData, answerValue)) {
                    return wrapper;
                }
            }
            
            return null;
        }
        
        hasMatchingFormValue(formData, answerValue) {
            // Check if any form field has this value
            for (const [fieldName, fieldValue] of formData) {
                if (fieldValue === answerValue) {
                    return true;
                }
            }
            
            // Check for direct step navigation values
            const lastGoTo = formData.get('_lastGoTo');
            const currentNav = formData.get('_currentNavigation');
            const branchTarget = formData.get('_branchTarget');
            
            if (lastGoTo === answerValue || currentNav === answerValue || branchTarget === answerValue) {
                return true;
            }
            
            return false;
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
                
                /* Hide steps by default - AGGRESSIVE */
                [data-form="step"]:not(.step-visible), 
                [data-step]:not(.step-visible), 
                [data-step-number]:not(.step-visible), 
                [data-form-step]:not(.step-visible), 
                .form-step:not(.step-visible), 
                .step:not(.step-visible) {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    position: absolute !important;
                    left: -9999px !important;
                }
                
                .step-hidden {
                    display: none !important;
                    opacity: 0;
                    transform: translateX(-20px);
                    pointer-events: none;
                }
                
                .step-visible {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    position: static !important;
                    left: auto !important;
                    transform: translateX(0) !important;
                }
                
                /* Ensure visible steps override all hiding classes */
                [data-form="step"].step-visible,
                [data-step].step-visible,
                [data-step-number].step-visible,
                [data-form-step].step-visible,
                .form-step.step-visible,
                .step.step-visible,
                .multi-form_step.step-visible {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    position: static !important;
                    left: auto !important;
                    transform: none !important;
                    width: auto !important;
                    height: auto !important;
                    overflow: visible !important;
                    z-index: auto !important;
                    top: auto !important;
                    right: auto !important;
                    bottom: auto !important;
                }
                
                /* Override any Webflow multi-form hiding */
                .multi-form_step:not(.step-visible) {
                    display: none !important;
                }
                
                /* Force visible with maximum specificity */
                div[data-form="step"].multi-form_step.step-visible {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
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
                
                /* Step-wrapper branching logic */
                [data-answer] {
                    transition: all 300ms ease;
                }
                
                [data-answer].wrapper-hidden {
                    opacity: 0;
                    transform: translateX(-20px);
                    pointer-events: none;
                }
                
                [data-answer].wrapper-visible {
                    opacity: 1;
                    transform: translateX(0);
                    pointer-events: auto;
                }
            `;
            
            document.head.appendChild(style);
            // Verify CSS is working by checking a test element
            setTimeout(() => {
                const testSteps = document.querySelectorAll('[data-form="step"]');
                if (testSteps.length > 0) {
                    const testStep = testSteps[0];
                    const computedStyle = window.getComputedStyle(testStep);
                    }
            }, 100);
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

    // IMMEDIATE step hiding - runs as soon as script loads
    (function hideStepsImmediately() {
        // Inject aggressive CSS immediately to hide steps
        const immediateStyle = document.createElement('style');
        immediateStyle.id = 'immediate-step-hiding';
        immediateStyle.innerHTML = `
            /* IMMEDIATE HIDING - Maximum specificity to override Webflow */
            [data-form="step"]:not(.step-visible),
            [data-step]:not(.step-visible),
            [data-step-number]:not(.step-visible),
            [data-form-step]:not(.step-visible),
            .form-step:not(.step-visible),
            .step:not(.step-visible) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                width: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                pointer-events: none !important;
                z-index: -1 !important;
            }
            
            /* Ensure step-visible class shows steps */
            [data-form="step"].step-visible,
            [data-step].step-visible,
            [data-step-number].step-visible,
            [data-form-step].step-visible,
            .form-step.step-visible,
            .step.step-visible {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: relative !important;
                left: auto !important;
                top: auto !important;
                width: auto !important;
                height: auto !important;
                overflow: visible !important;
                pointer-events: auto !important;
                z-index: auto !important;
            }
        `;
        
        // Insert at the very beginning of head to ensure it loads first
        if (document.head) {
            document.head.insertBefore(immediateStyle, document.head.firstChild);
        } else {
            // If head doesn't exist yet, wait for it
            const headObserver = new MutationObserver((mutations, observer) => {
                if (document.head) {
                    document.head.insertBefore(immediateStyle, document.head.firstChild);
                    observer.disconnect();
                }
            });
            headObserver.observe(document.documentElement, { childList: true });
        }
        
        const stepSelectors = [
            '[data-form="step"]',
            '[data-step]',
            '[data-step-number]',
            '[data-form-step]',
            '.form-step',
            '.step'
        ];
        
        let totalStepsFound = 0;
        
        stepSelectors.forEach(selector => {
            const steps = document.querySelectorAll(selector);
            steps.forEach((step, index) => {
                // Remove any step-visible class that might exist
                step.classList.remove('step-visible');
                
                // Add aggressive inline styles as backup
                step.style.setProperty('display', 'none', 'important');
                step.style.setProperty('visibility', 'hidden', 'important');
                step.style.setProperty('opacity', '0', 'important');
                step.style.setProperty('position', 'absolute', 'important');
                step.style.setProperty('left', '-9999px', 'important');
                step.style.setProperty('top', '-9999px', 'important');
                step.style.setProperty('pointer-events', 'none', 'important');
                step.classList.add('immediately-hidden');
                
                totalStepsFound++;
            });
        });
        
        if (totalStepsFound === 0) {
            .length);
            
            // Set up a MutationObserver to catch steps that might be added later
            const observer = new MutationObserver((mutations) => {
                let newStepsFound = 0;
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            stepSelectors.forEach(selector => {
                                if (node.matches && node.matches(selector)) {
                                    node.classList.remove('step-visible');
                                    node.style.setProperty('display', 'none', 'important');
                                    node.style.setProperty('visibility', 'hidden', 'important');
                                    node.classList.add('immediately-hidden');
                                    newStepsFound++;
                                }
                                // Also check children
                                const childSteps = node.querySelectorAll && node.querySelectorAll(selector);
                                if (childSteps) {
                                    childSteps.forEach(childStep => {
                                        childStep.classList.remove('step-visible');
                                        childStep.style.setProperty('display', 'none', 'important');
                                        childStep.style.setProperty('visibility', 'hidden', 'important');
                                        childStep.classList.add('immediately-hidden');
                                        newStepsFound++;
                                    });
                                }
                            });
                        }
                    });
                });
                
                if (newStepsFound > 0) {
                    }
            });
            
            observer.observe(document.body || document.documentElement, {
                childList: true,
                subtree: true
            });
            
            // Stop observing after 5 seconds
            setTimeout(() => observer.disconnect(), 5000);
        }
    })();

    // Initialize when DOM is ready
    let tryformlyInstance;
    
    function initialize() {
        tryformlyInstance = new TryformlyCompatible();
        tryformlyInstance.init();
        
        // Make available globally (tryformly compatibility)
        window.Formly = tryformlyInstance;
        window.TryformlyCompatible = tryformlyInstance;
        
        }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})(window, document); 