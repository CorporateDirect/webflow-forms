#!/usr/bin/env python3
import re

def fix_validation():
    # Read the file
    with open('src/webflow-forms.js', 'r') as f:
        content = f.read()
    
    # 1. Add helper function to get active step_item based on branching logic
    helper_function = '''
        // Helper function to determine the active step_item based on branching logic
        getActiveStepItem: function(currentStep) {
            if (!currentStep) return null;
            
            // Look for selected radio buttons with data-go-to that indicate the current branch
            const selectedRadio = currentStep.querySelector('input[type="radio"]:checked[data-go-to]');
            if (selectedRadio) {
                const targetAnswer = selectedRadio.getAttribute('data-go-to');
                console.log(`🔍 Found selected radio with target: ${targetAnswer}`);
                
                // Find the step_item that matches this target
                const targetStepItem = currentStep.querySelector(`[data-answer="${targetAnswer}"]`);
                if (targetStepItem && targetStepItem.classList.contains('step_item')) {
                    console.log(`🔍 Found active step_item: ${targetAnswer}`);
                    return targetStepItem;
                }
            }
            
            // Fallback: look for visible step_items
            const visibleStepItems = currentStep.querySelectorAll('.step_item');
            for (const stepItem of visibleStepItems) {
                const computedStyle = window.getComputedStyle(stepItem);
                const isVisible = stepItem.offsetParent !== null && 
                                 computedStyle.display !== 'none' &&
                                 computedStyle.visibility !== 'hidden' &&
                                 !stepItem.hidden;
                
                if (isVisible) {
                    const answer = stepItem.getAttribute('data-answer');
                    console.log(`🔍 Found visible step_item: ${answer || 'no-answer'}`);
                    return stepItem;
                }
            }
            
            console.log('🔍 No active step_item found');
            return null;
        },

        // Helper function to check if a field should be validated based on active step_item
        shouldValidateField: function(field, currentStep) {
            // Check if field is in a step_item
            const fieldStepItem = field.closest('.step_item');
            if (!fieldStepItem) {
                // Field is not in a step_item, so validate it normally
                return true;
            }
            
            // Get the active step_item for this step
            const activeStepItem = this.getActiveStepItem(currentStep);
            if (!activeStepItem) {
                // No active step_item found, validate all fields
                return true;
            }
            
            // Only validate fields that are in the active step_item
            const isInActiveStepItem = fieldStepItem === activeStepItem;
            
            if (!isInActiveStepItem) {
                console.log(`🔍 Skipping field ${field.id || field.name} - not in active step_item`);
            }
            
            return isInActiveStepItem;
        },

'''
    
    # Insert the helper functions before the existing helper function
    content = content.replace(
        '        // Helper function to check if a field is required for current subtype',
        helper_function + '        // Helper function to check if a field is required for current subtype'
    )
    
    # 2. Fix validateCurrentStep to use the new logic
    old_conditional_validation = '''            // Validate conditional required fields (data-require-for-subtypes) - ONLY in visible step_items
            const conditionalFields = this.branchingState.currentStep.querySelectorAll('[data-require-for-subtypes]:not([type="radio"])');
            conditionalFields.forEach(field => {
                // Check if the field is within a visible step_item
                const stepItem = field.closest('.step_item');
                if (stepItem) {
                    const computedStyle = window.getComputedStyle(stepItem);
                    const isStepItemVisible = stepItem.offsetParent !== null && 
                                             computedStyle.display !== 'none' &&
                                             computedStyle.visibility !== 'hidden' &&
                                             !stepItem.hidden;
                    
                    if (!isStepItemVisible) {
                        console.log(`🔍 Skipping field ${field.id || field.name} - in hidden step_item`);
                        return; // Skip validation for fields in hidden step_items
                    }
                }
                
                const requiredForSubtypes = field.getAttribute('data-require-for-subtypes');
                if (requiredForSubtypes && this.isFieldRequiredForCurrentSubtype(field, requiredForSubtypes)) {
                    const isFieldValid = this.validateField(field, showErrors);
                    if (!isFieldValid) {
                        allValid = false;
                        invalidFields.push(field);
                    }
                }
            });'''
    
    new_conditional_validation = '''            // Validate conditional required fields (data-require-for-subtypes) - ONLY in active step_items
            const conditionalFields = this.branchingState.currentStep.querySelectorAll('[data-require-for-subtypes]:not([type="radio"])');
            conditionalFields.forEach(field => {
                // Check if field should be validated based on active step_item
                if (!this.shouldValidateField(field, this.branchingState.currentStep)) {
                    return; // Skip validation for fields not in active step_item
                }
                
                const requiredForSubtypes = field.getAttribute('data-require-for-subtypes');
                if (requiredForSubtypes && this.isFieldRequiredForCurrentSubtype(field, requiredForSubtypes)) {
                    const isFieldValid = this.validateField(field, showErrors);
                    if (!isFieldValid) {
                        allValid = false;
                        invalidFields.push(field);
                    }
                }
            });'''
    
    content = content.replace(old_conditional_validation, new_conditional_validation)
    
    # 3. Fix validateEntireForm to use the new logic
    old_form_validation = '''            allRequiredFields.forEach(field => {
                // Only validate visible fields
                const fieldStep = field.closest('[data-form="step"]');
                if (fieldStep && fieldStep.style.display !== 'none') {
                    const isFieldValid = this.validateField(field, showErrors);
                    if (!isFieldValid) {
                        allValid = false;
                        invalidFields.push({
                            field: field,
                            step: fieldStep
                        });
                    }
                }
            });'''
    
    new_form_validation = '''            allRequiredFields.forEach(field => {
                // Only validate visible fields in visible steps and active step_items
                const fieldStep = field.closest('[data-form="step"]');
                if (fieldStep && fieldStep.style.display !== 'none') {
                    // Check if field should be validated based on active step_item
                    if (!this.shouldValidateField(field, fieldStep)) {
                        return; // Skip validation for fields not in active step_item
                    }
                    
                    const isFieldValid = this.validateField(field, showErrors);
                    if (!isFieldValid) {
                        allValid = false;
                        invalidFields.push({
                            field: field,
                            step: fieldStep
                        });
                    }
                }
            });'''
    
    content = content.replace(old_form_validation, new_form_validation)
    
    # Write back to file
    with open('src/webflow-forms.js', 'w') as f:
        f.write(content)
    
    print('✅ Validation fix applied successfully!')
    print('- Added getActiveStepItem() to determine active branch based on data-answer/data-go-to')
    print('- Added shouldValidateField() to check if field is in active step_item')
    print('- Updated validateCurrentStep() to use new logic')
    print('- Updated validateEntireForm() to use new logic')

if __name__ == '__main__':
    fix_validation() 