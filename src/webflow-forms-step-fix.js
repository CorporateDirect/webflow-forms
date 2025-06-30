/**
 * Webflow Forms - Step Visibility & Summary Integration Fix
 * Fixes: All steps visible + Summary cards can't find comprehensive fix
 * @version 3.1.0-step-fix
 * @author Chris Brummer
 */

(function(window, document) {
    'use strict';

    console.log('🚀 Loading Step Visibility & Summary Integration Fix v3.1.0');

    const WebflowStepFix = {
        version: '3.1.0-step-fix',
        initialized: false,
        currentStep: 0,
        totalSteps: 0,
        
        log: {
            info: (msg) => console.log(`👣 STEP FIX: ${msg}`),
            success: (msg) => console.log(`✅ STEP FIX: ${msg}`),
            warning: (msg) => console.warn(`⚠️ STEP FIX: ${msg}`),
            error: (msg) => console.error(`❌ STEP FIX: ${msg}`)
        },

        init: function() {
            this.log.info('Initializing step visibility and summary integration fix...');
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => this.setup(), 300);
                });
            } else {
                setTimeout(() => this.setup(), 300);
            }
        },

        setup: function() {
            try {
                this.initializeStepVisibility();
                this.setupStepNavigation();
                this.ensureComprehensiveFixIntegration();
                
                this.initialized = true;
                this.log.success('Step fix ready!');
                
            } catch (error) {
                this.log.error('Setup failed: ' + error.message);
            }
        },

        // Fix Issue: All steps are visible
        initializeStepVisibility: function() {
            this.log.info('Fixing step visibility...');
            
            const steps = document.querySelectorAll('[data-form="step"]');
            this.totalSteps = steps.length;
            
            if (this.totalSteps === 0) {
                this.log.warning('No steps found with [data-form="step"]');
                return;
            }
            
            // Hide all steps except the first one
            steps.forEach((step, index) => {
                if (index === 0) {
                    step.style.display = 'block';
                    this.currentStep = 0;
                    this.log.info(`Showing step ${index + 1}`);
                } else {
                    step.style.display = 'none';
                }
            });
            
            this.log.success(`Fixed step visibility - ${this.totalSteps} steps found, showing only step 1`);
        },

        // Show specific step
        showStep: function(stepIndex) {
            const steps = document.querySelectorAll('[data-form="step"]');
            
            if (stepIndex < 0 || stepIndex >= steps.length) {
                this.log.error(`Invalid step index: ${stepIndex}`);
                return false;
            }
            
            // Hide all steps
            steps.forEach((step, index) => {
                step.style.display = index === stepIndex ? 'block' : 'none';
            });
            
            this.currentStep = stepIndex;
            this.log.info(`Switched to step ${stepIndex + 1}`);
            return true;
        },

        // Navigate to next step
        nextStep: function() {
            if (this.currentStep < this.totalSteps - 1) {
                return this.showStep(this.currentStep + 1);
            }
            return false;
        },

        // Navigate to previous step
        previousStep: function() {
            if (this.currentStep > 0) {
                return this.showStep(this.currentStep - 1);
            }
            return false;
        },

        // Setup step navigation
        setupStepNavigation: function() {
            this.log.info('Setting up step navigation...');
            
            // Listen for next button clicks
            document.addEventListener('click', (event) => {
                if (event.target.matches('[data-form="next-btn"]') || 
                    event.target.closest('[data-form="next-btn"]')) {
                    this.handleNextButton(event);
                }
            });

            // Listen for previous button clicks
            document.addEventListener('click', (event) => {
                if (event.target.matches('[data-form="prev-btn"]') || 
                    event.target.closest('[data-form="prev-btn"]')) {
                    this.handlePreviousButton(event);
                }
            });
            
            this.log.success('Step navigation ready');
        },

        handleNextButton: function(event) {
            this.log.info('Next button clicked');
            
            // Check if comprehensive fix exists and validate
            if (window.WebflowFormsComprehensive && window.WebflowFormsComprehensive.validateCurrentStep) {
                if (!window.WebflowFormsComprehensive.validateCurrentStep()) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.log.warning('Navigation blocked due to validation errors');
                    return false;
                }
            }
            
            // Navigate to next step
            if (this.nextStep()) {
                event.preventDefault();
                event.stopPropagation();
                this.log.info(`Advanced to step ${this.currentStep + 1}`);
            }
            
            return true;
        },

        handlePreviousButton: function(event) {
            this.log.info('Previous button clicked');
            
            // Navigate to previous step
            if (this.previousStep()) {
                event.preventDefault();
                event.stopPropagation();
                this.log.info(`Went back to step ${this.currentStep + 1}`);
            }
            
            return true;
        },

        // Fix Issue: Summary cards can't find comprehensive fix
        ensureComprehensiveFixIntegration: function() {
            this.log.info('Ensuring comprehensive fix integration...');
            
            // Wait for comprehensive fix to load
            const waitForComprehensiveFix = () => {
                if (window.WebflowFormsComprehensive) {
                    // Enhance the comprehensive fix with step navigation
                    if (!window.WebflowFormsComprehensive.showStep) {
                        window.WebflowFormsComprehensive.showStep = (index) => this.showStep(index);
                        window.WebflowFormsComprehensive.nextStep = () => this.nextStep();
                        window.WebflowFormsComprehensive.previousStep = () => this.previousStep();
                        window.WebflowFormsComprehensive.getCurrentStep = () => this.currentStep;
                        window.WebflowFormsComprehensive.getTotalSteps = () => this.totalSteps;
                        
                        this.log.success('Enhanced comprehensive fix with step navigation');
                    }
                    
                    // Make sure it's marked as initialized
                    window.WebflowFormsComprehensive.initialized = true;
                    this.log.success('Comprehensive fix integration confirmed');
                    
                } else {
                    this.log.info('Waiting for comprehensive fix to load...');
                    setTimeout(waitForComprehensiveFix, 200);
                }
            };
            
            setTimeout(waitForComprehensiveFix, 100);
        }
    };

    // Initialize the step fix
    WebflowStepFix.init();
    
    // Export to global scope
    window.WebflowStepFix = WebflowStepFix;

})(window, document);
