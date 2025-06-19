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
            console.log('🎯 Tryformly-compatible system initialized');
        }
        
        hideAllStepsImmediately() {
            console.log('🔍 CLASS HIDING: Starting hideAllStepsImmediately, DOM state:', document.readyState);
            
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
                console.log(`🔍 CLASS: Selector "${selector}" found ${steps.length} elements`);
                
                steps.forEach((step, index) => {
                    console.log(`🔍 CLASS: Processing step ${index + 1}:`, step);
                    console.log(`🔍 CLASS: Current computed styles:`, window.getComputedStyle(step).display);
                    
                    step.style.display = 'none';
                    step.style.visibility = 'hidden';
                    step.classList.add('step-hidden');
                    step.classList.add('class-hidden');
                    
                    console.log(`🔍 CLASS: After hiding - inline display:`, step.style.display);
                    console.log(`🔍 CLASS: After hiding - computed display:`, window.getComputedStyle(step).display);
                    
                    totalFound++;
                });
            });
            
            console.log(`🔒 CLASS HIDING: Pre-hidden ${totalFound} potential steps`);
            
            if (totalFound === 0) {
                console.warn('⚠️ CLASS HIDING: No steps found during class initialization!');
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
                    console.log(`📋 Found ${steps.length} steps using selector: ${selector}`);
                    break;
                }
            }
            
            if (steps.length === 0) {
                console.warn('❌ No steps found in form. Tried selectors:', selectors);
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
            console.log(`🔍 FORM INIT: Starting initializeFormState for ${formId}`);
            
            const formData = this.forms.get(formId);
            if (!formData) {
                console.warn(`⚠️ FORM INIT: No form data found for ${formId}`);
                return;
            }
            
            console.log(`🔍 FORM INIT: Form has ${formData.steps.length} steps`);
            
            // Hide all steps immediately, then show first
            formData.steps.forEach((step, index) => {
                console.log(`🔍 FORM INIT: Hiding step ${index + 1}:`, step);
                console.log(`🔍 FORM INIT: Step ${index + 1} classes before hide:`, step.className);
                console.log(`🔍 FORM INIT: Step ${index + 1} computed display before:`, window.getComputedStyle(step).display);
                
                this.hideStep(step);  // Hide all first
                
                console.log(`🔍 FORM INIT: Step ${index + 1} classes after hide:`, step.className);
                console.log(`🔍 FORM INIT: Step ${index + 1} computed display after:`, window.getComputedStyle(step).display);
            });
            
            // Show first step
            if (formData.steps.length > 0) {
                console.log(`🔍 FORM INIT: Showing first step:`, formData.steps[0]);
                this.showStep(formData.steps[0]);
                console.log(`🔍 FORM INIT: First step classes after show:`, formData.steps[0].className);
                console.log(`🔍 FORM INIT: First step computed display after show:`, window.getComputedStyle(formData.steps[0]).display);
            }
            
            this.updateProgress(formId);
            this.updateNavigation(formId);
            this.processConditionalLogic(formId);
            
            console.log(`✅ FORM INIT: Completed initialization for ${formId}`);
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
            
            console.log(`🔍 CLICK: Element clicked:`, target);
            console.log(`🔍 CLICK: Form ID: ${formId}`);
            console.log(`🔍 CLICK: Element attributes:`, {
                'data-go-to': target.getAttribute('data-go-to'),
                'data-answer': target.getAttribute('data-answer'),
                'data-next': target.getAttribute('data-next'),
                'data-form': target.getAttribute('data-form'),
                'class': target.className
            });
            
            if (!formId) {
                console.warn(`⚠️ CLICK: No form ID found for clicked element`);
                return;
            }
            
            // Prevent double-clicks with debounce
            const now = Date.now();
            const lastClick = target._lastClickTime || 0;
            if (now - lastClick < 500) {
                console.log(`🚫 CLICK: Debounced double-click`);
                e.preventDefault();
                return;
            }
            target._lastClickTime = now;
            
            // Navigation buttons (tryformly data attributes)
            if (this.isNextButton(target)) {
                console.log(`➡️ CLICK: Next button clicked`);
                e.preventDefault();
                e.stopPropagation();
                this.nextStep(formId);
            } else if (this.isPrevButton(target)) {
                console.log(`⬅️ CLICK: Prev button clicked`);
                e.preventDefault();
                e.stopPropagation();
                this.prevStep(formId);
            } else if (this.isSubmitButton(target)) {
                console.log(`📤 CLICK: Submit button clicked`);
                e.preventDefault();
                e.stopPropagation();
                this.submitForm(formId);
            }
            
            // Conditional navigation (data-go-to)
            else if (target.hasAttribute('data-go-to')) {
                console.log(`🎯 CLICK: Element with data-go-to clicked`);
                e.preventDefault();
                e.stopPropagation();
                this.handleGoTo(formId, target);
            }
            
            // Skip functionality (data-skip)
            else if (target.hasAttribute('data-skip')) {
                console.log(`⏭️ CLICK: Element with data-skip clicked`);
                e.preventDefault();
                e.stopPropagation();
                this.handleSkip(formId, target);
            }
            
            else {
                console.log(`🔍 CLICK: No special handling for this element`);
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
            console.log(`🔍 NEXT STEP: Starting nextStep for ${formId}`);
            
            const formData = this.forms.get(formId);
            if (!formData) {
                console.warn(`⚠️ NEXT STEP: No form data found for ${formId}`);
                return;
            }
            
            const currentStepIndex = this.currentSteps.get(formId);
            console.log(`🔍 NEXT STEP: Current step index: ${currentStepIndex} (display: ${currentStepIndex + 1})`);
            
            // Validate current step
            if (this.config.validateOnNext && !this.validateStep(formId, currentStepIndex)) {
                console.log('❌ NEXT STEP: Validation failed, staying on current step');
                return false;
            }
            
            // Save current step data
            this.saveStepData(formId, currentStepIndex);
            
            // Calculate next step (with skip logic)
            const nextStepIndex = this.getNextStepIndex(formId, currentStepIndex);
            console.log(`🔍 NEXT STEP: Next step index: ${nextStepIndex} (display: ${nextStepIndex + 1})`);
            
            if (nextStepIndex < formData.totalSteps) {
                console.log(`➡️ NEXT STEP: Going to step ${nextStepIndex + 1}`);
                this.goToStep(formId, nextStepIndex);
            } else {
                console.log(`🏁 NEXT STEP: Reached end, handling completion`);
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
            console.log(`🔍 GO TO STEP: Going from step ${this.currentSteps.get(formId) + 1} to step ${targetStepIndex + 1}`);
            
            const formData = this.forms.get(formId);
            if (!formData) {
                console.warn(`⚠️ GO TO STEP: No form data found for ${formId}`);
                return;
            }
            
            const currentStepIndex = this.currentSteps.get(formId);
            
            if (targetStepIndex === currentStepIndex) {
                console.log(`🔍 GO TO STEP: Already on target step ${targetStepIndex + 1}, skipping`);
                return;
            }
            
            if (targetStepIndex < 0 || targetStepIndex >= formData.totalSteps) {
                console.warn(`⚠️ GO TO STEP: Invalid step index ${targetStepIndex}, total steps: ${formData.totalSteps}`);
                return;
            }
            
            console.log(`🔍 GO TO STEP: Valid transition from ${currentStepIndex + 1} to ${targetStepIndex + 1}`);
            
            // Add to history for back navigation
            if (addToHistory && targetStepIndex > currentStepIndex) {
                this.stepHistory.get(formId).push(currentStepIndex);
                console.log(`📚 GO TO STEP: Added step ${currentStepIndex + 1} to history`);
            }
            
            // Hide current step
            console.log(`🔍 GO TO STEP: Hiding current step ${currentStepIndex + 1}`);
            this.hideStep(formData.steps[currentStepIndex]);
            
            // Show target step after transition
            setTimeout(() => {
                console.log(`🔍 GO TO STEP: Showing target step ${targetStepIndex + 1}`);
                this.showStep(formData.steps[targetStepIndex]);
                this.currentSteps.set(formId, targetStepIndex);
                this.updateProgress(formId);
                this.updateNavigation(formId);
                this.triggerStepChangeEvent(formId, targetStepIndex, currentStepIndex);
                console.log(`✅ GO TO STEP: Successfully moved to step ${targetStepIndex + 1}`);
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
            
            console.log(`🔍 HANDLE GO-TO: Processing data-go-to="${targetStep}" with data-answer="${requiredAnswer}"`);
            
            // Check if answer matches (if specified)
            if (requiredAnswer) {
                const elementValue = this.getElementValue(element);
                console.log(`🔍 HANDLE GO-TO: Element value: "${elementValue}", required: "${requiredAnswer}"`);
                if (elementValue !== requiredAnswer) {
                    console.log(`❌ HANDLE GO-TO: Answer doesn't match, not navigating`);
                    return; // Don't navigate if answer doesn't match
                }
            }
            
            // Store the go-to value for step-wrapper logic
            const formData = this.formData.get(formId);
            if (formData) {
                formData.set('_lastGoTo', targetStep);
                // Also store the target step value for step-wrapper matching
                formData.set('_currentNavigation', targetStep);
                console.log(`🔍 HANDLE GO-TO: Stored navigation data: _lastGoTo="${targetStep}", _currentNavigation="${targetStep}"`);
            }
            
            // Handle numeric step navigation (e.g., "2", "3")
            if (/^\d+$/.test(targetStep)) {
                const targetStepIndex = parseInt(targetStep) - 1; // Convert to 0-based
                console.log(`🔍 HANDLE GO-TO: Numeric step "${targetStep}" -> index ${targetStepIndex}`);
                if (targetStepIndex >= 0) {
                    this.goToStep(formId, targetStepIndex);
                }
            } 
            // Handle named step navigation (e.g., "step-2", "step-3")
            else if (targetStep.startsWith('step-')) {
                const stepNumber = targetStep.replace('step-', '');
                if (/^\d+$/.test(stepNumber)) {
                    const targetStepIndex = parseInt(stepNumber) - 1; // Convert to 0-based
                    console.log(`🔍 HANDLE GO-TO: Named step "${targetStep}" -> step ${stepNumber} -> index ${targetStepIndex}`);
                    if (targetStepIndex >= 0) {
                        this.goToStep(formId, targetStepIndex);
                    }
                } else {
                    console.warn(`⚠️ HANDLE GO-TO: Invalid step name format: ${targetStep}`);
                }
            } 
            else {
                // Handle branch navigation (for step-wrappers)
                console.log(`🌳 HANDLE GO-TO: Branch navigation to "${targetStep}"`);
                console.log(`🌳 HANDLE GO-TO: This should go to next step and show wrapper with matching data-answer`);
                
                // Store the branch target for wrapper matching
                if (formData) {
                    formData.set('_branchTarget', targetStep);
                    console.log(`🌳 HANDLE GO-TO: Stored branch target: "${targetStep}"`);
                }
                
                this.nextStep(formId);
            }
        }
        
        checkConditionalLogic(formId, field) {
            const goToStep = field.getAttribute('data-go-to');
            const answerValue = field.getAttribute('data-answer');
            
            console.log(`🌳 CONDITIONAL: Checking field with data-go-to="${goToStep}", data-answer="${answerValue}"`);
            
            if (goToStep && answerValue) {
                const fieldValue = this.getElementValue(field);
                console.log(`🌳 CONDITIONAL: Field value="${fieldValue}", required answer="${answerValue}"`);
                
                // For radio buttons, only proceed if this one is checked
                if (field.type === 'radio' && !field.checked) {
                    console.log(`🌳 CONDITIONAL: Radio button not checked, skipping`);
                    return;
                }
                
                // Check if value matches required answer
                if (fieldValue === answerValue) {
                    console.log(`🌳 CONDITIONAL: Values match! Triggering navigation to "${goToStep}"`);
                    // Small delay for visual feedback
                    setTimeout(() => {
                        this.handleGoTo(formId, field);
                    }, 100);
                } else {
                    console.log(`🌳 CONDITIONAL: Values don't match, no navigation`);
                }
            } else {
                console.log(`🌳 CONDITIONAL: No conditional logic on this field`);
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
            console.log(`🔍 SHOW STEP: Showing step:`, step);
            console.log(`🔍 SHOW STEP: Classes before show:`, step.className);
            console.log(`🔍 SHOW STEP: Computed display before:`, window.getComputedStyle(step).display);
            
            step.style.display = 'block';
            step.style.visibility = 'visible';
            step.style.opacity = '1';
            step.style.position = 'static';
            step.style.left = 'auto';
            
            // Remove ALL hiding classes
            step.classList.remove('step-hidden', 'immediately-hidden', 'class-hidden');
            step.classList.add('step-visible', 'step-enter');
            
            // Force remove any remaining hiding classes
            const hidingClasses = ['step-hidden', 'immediately-hidden', 'class-hidden'];
            hidingClasses.forEach(cls => {
                if (step.classList.contains(cls)) {
                    step.classList.remove(cls);
                    console.log(`🔧 SHOW STEP: Force removed class: ${cls}`);
                }
            });
            
            console.log(`🔍 SHOW STEP: Classes after show:`, step.className);
            console.log(`🔍 SHOW STEP: Inline styles after:`, {
                display: step.style.display,
                visibility: step.style.visibility,
                opacity: step.style.opacity
            });
            console.log(`🔍 SHOW STEP: Computed display after:`, window.getComputedStyle(step).display);
            
            // Debug parent elements that might be hiding the step
            let parent = step.parentElement;
            let level = 1;
            while (parent && level <= 3) {
                const parentStyles = window.getComputedStyle(parent);
                console.log(`🔍 SHOW STEP: Parent ${level} (${parent.tagName}.${parent.className}):`, {
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
            console.log(`🔍 SHOW STEP: Element position:`, {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                visible: rect.width > 0 && rect.height > 0
            });
            
            // Check for visibility blockers
            console.log(`🔍 SHOW STEP: Potential visibility blockers:`, {
                zIndex: computedStyles.zIndex,
                transform: computedStyles.transform,
                backgroundColor: computedStyles.backgroundColor,
                color: computedStyles.color,
                fontSize: computedStyles.fontSize,
                lineHeight: computedStyles.lineHeight,
                textIndent: computedStyles.textIndent,
                clipPath: computedStyles.clipPath,
                mask: computedStyles.mask
            });
            
            // Check what element is actually at the step's position
            const elementAtPosition = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
            console.log(`🔍 SHOW STEP: Element at step position:`, elementAtPosition);
            console.log(`🔍 SHOW STEP: Is step the top element?`, elementAtPosition === step || step.contains(elementAtPosition));
            
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
            console.log(`🔧 SHOW STEP: Added red border for visual debugging`);
            
            // Force visibility as a last resort
            if (rect.width === 0 || rect.height === 0) {
                console.log(`🔧 SHOW STEP: Step has no dimensions, forcing visibility`);
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
                console.log(`🔧 SHOW STEP: After force - dimensions:`, {
                    width: newRect.width,
                    height: newRect.height
                });
            }
            
            console.log(`✅ SHOW STEP: Step should now be visible`);
        }
        
        hideStep(step) {
            console.log(`🔍 HIDE STEP: Hiding step:`, step);
            console.log(`🔍 HIDE STEP: Classes before hide:`, step.className);
            console.log(`🔍 HIDE STEP: Computed display before:`, window.getComputedStyle(step).display);
            
            step.style.display = 'none';  // Hide immediately
            step.style.visibility = 'hidden';
            step.style.opacity = '0';
            step.style.position = 'absolute';
            step.style.left = '-9999px';
            
            step.classList.remove('step-visible', 'step-enter');
            step.classList.add('step-hidden');
            
            console.log(`🔍 HIDE STEP: Classes after hide:`, step.className);
            console.log(`🔍 HIDE STEP: Inline styles after:`, {
                display: step.style.display,
                visibility: step.style.visibility,
                opacity: step.style.opacity
            });
            console.log(`🔍 HIDE STEP: Computed display after:`, window.getComputedStyle(step).display);
            console.log(`✅ HIDE STEP: Step should now be hidden`);
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
                console.log('📋 STEP WRAPPER: No step-wrappers found in this step');
                return;
            }
            
            console.log(`📋 STEP WRAPPER: Found ${stepWrappers.length} step-wrappers`);
            
            // Hide all step-wrappers initially
            stepWrappers.forEach((wrapper, index) => {
                const answerValue = wrapper.getAttribute('data-answer');
                console.log(`📋 STEP WRAPPER: Wrapper ${index + 1} has data-answer="${answerValue}"`);
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
                console.log(`📋 STEP WRAPPER: Showing wrapper with data-answer="${activeWrapper.getAttribute('data-answer')}"`);
            } else {
                // Show first wrapper with empty data-answer (first step wrapper)
                const firstWrapper = step.querySelector('[data-answer=""]');
                if (firstWrapper) {
                    firstWrapper.style.display = 'block';
                    firstWrapper.classList.remove('wrapper-hidden');
                    firstWrapper.classList.add('wrapper-visible');
                    console.log('📋 STEP WRAPPER: Showing first step wrapper (data-answer="")');
                } else {
                    // If no empty data-answer wrapper, show the first wrapper
                    const fallbackWrapper = stepWrappers[0];
                    if (fallbackWrapper) {
                        fallbackWrapper.style.display = 'block';
                        fallbackWrapper.classList.remove('wrapper-hidden');
                        fallbackWrapper.classList.add('wrapper-visible');
                        console.log(`📋 STEP WRAPPER: No empty wrapper found, showing first wrapper with data-answer="${fallbackWrapper.getAttribute('data-answer')}"`);
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
            console.log(`🔍 WRAPPER MATCH: Checking if form data matches "${answerValue}"`);
            
            // Check if any form field has this value
            for (const [fieldName, fieldValue] of formData) {
                console.log(`🔍 WRAPPER MATCH: Field "${fieldName}" = "${fieldValue}"`);
                if (fieldValue === answerValue) {
                    console.log(`✅ WRAPPER MATCH: Found match in field "${fieldName}"`);
                    return true;
                }
            }
            
            // Check for direct step navigation values
            const lastGoTo = formData.get('_lastGoTo');
            const currentNav = formData.get('_currentNavigation');
            const branchTarget = formData.get('_branchTarget');
            
            console.log(`🔍 WRAPPER MATCH: Navigation data - _lastGoTo="${lastGoTo}", _currentNavigation="${currentNav}", _branchTarget="${branchTarget}"`);
            
            if (lastGoTo === answerValue || currentNav === answerValue || branchTarget === answerValue) {
                console.log(`✅ WRAPPER MATCH: Found match in navigation data`);
                return true;
            }
            
            console.log(`❌ WRAPPER MATCH: No match found for "${answerValue}"`);
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
            console.log('🎨 CSS: Injected tryformly-compatible styles');
            
            // Verify CSS is working by checking a test element
            setTimeout(() => {
                const testSteps = document.querySelectorAll('[data-form="step"]');
                if (testSteps.length > 0) {
                    const testStep = testSteps[0];
                    const computedStyle = window.getComputedStyle(testStep);
                    console.log('🎨 CSS: Test step computed display:', computedStyle.display);
                    console.log('🎨 CSS: Test step classes:', testStep.className);
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
        console.log('🔍 IMMEDIATE HIDING: Script executing, DOM state:', document.readyState);
        
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
            console.log(`🔍 IMMEDIATE: Selector "${selector}" found ${steps.length} elements`);
            
            steps.forEach((step, index) => {
                console.log(`🔍 IMMEDIATE: Hiding step ${index + 1} with selector "${selector}":`, step);
                console.log(`🔍 IMMEDIATE: Step classes before:`, step.className);
                console.log(`🔍 IMMEDIATE: Step styles before:`, {
                    display: step.style.display,
                    visibility: step.style.visibility,
                    opacity: step.style.opacity
                });
                
                step.style.display = 'none';
                step.style.visibility = 'hidden';
                step.style.opacity = '0';
                step.style.position = 'absolute';
                step.style.left = '-9999px';
                step.classList.add('immediately-hidden');
                
                console.log(`🔍 IMMEDIATE: Step styles after:`, {
                    display: step.style.display,
                    visibility: step.style.visibility,
                    opacity: step.style.opacity
                });
                
                totalStepsFound++;
            });
        });
        
        console.log(`⚡ IMMEDIATE HIDING: Processed ${totalStepsFound} total steps`);
        
        if (totalStepsFound === 0) {
            console.warn('⚠️ IMMEDIATE HIDING: No steps found! DOM might not be ready or selectors might be wrong');
            console.log('🔍 IMMEDIATE: Available elements in DOM:', document.querySelectorAll('*').length);
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
        
        console.log('🎯 Tryformly-compatible system ready');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})(window, document); 