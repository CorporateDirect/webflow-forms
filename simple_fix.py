#!/usr/bin/env python3

def apply_simple_fix():
    # Read the file
    with open('src/webflow-forms.js', 'r') as f:
        content = f.read()
    
    # Add a simple helper function to get active step_item
    helper_function = '''
        // Helper function to get active step_item based on selected radio button
        getActiveStepItemForValidation: function(currentStep) {
            if (!currentStep) return null;
            
            // Look for selected radio button with data-go-to
            const selectedRadio = currentStep.querySelector('input[type="radio"]:checked[data-go-to]');
            if (selectedRadio) {
                const targetAnswer = selectedRadio.getAttribute('data-go-to');
                const targetStepItem = currentStep.querySelector(`[data-answer="${targetAnswer}"]`);
                if (targetStepItem) {
                    console.log(`🔍 Active step_item determined by radio selection: ${targetAnswer}`);
                    return targetStepItem;
                }
            }
            
            // Fallback: find visible step_item
            const stepItems = currentStep.querySelectorAll('.step_item');
            for (const stepItem of stepItems) {
                if (stepItem.offsetParent !== null) {
                    const answer = stepItem.getAttribute('data-answer');
                    console.log(`🔍 Active step_item found by visibility: ${answer || 'unknown'}`);
                    return stepItem;
                }
            }
            
            return null;
        },

'''
    
    # Insert before the existing helper function
    content = content.replace(
        '        // Helper function to check if a field is required for current subtype',
        helper_function + '        // Helper function to check if a field is required for current subtype'
    )
    
    # Update the conditional validation in validateCurrentStep
    old_validation = '''            // Validate conditional required fields (data-require-for-subtypes) - ONLY in visible step_items
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
    
    new_validation = '''            // Validate conditional required fields (data-require-for-subtypes) - ONLY in active step_item
            const conditionalFields = this.branchingState.currentStep.querySelectorAll('[data-require-for-subtypes]:not([type="radio"])');
            const activeStepItem = this.getActiveStepItemForValidation(this.branchingState.currentStep);
            
            conditionalFields.forEach(field => {
                // Only validate fields in the active step_item
                const fieldStepItem = field.closest('.step_item');
                if (fieldStepItem && activeStepItem && fieldStepItem !== activeStepItem) {
                    console.log(`🔍 Skipping field ${field.id || field.name} - not in active step_item`);
                    return;
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
    
    content = content.replace(old_validation, new_validation)
    
    # Update validateEntireForm to also use the active step_item logic
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
                // Only validate visible fields in visible steps
                const fieldStep = field.closest('[data-form="step"]');
                if (fieldStep && fieldStep.style.display !== 'none') {
                    // For fields in step_items, only validate if in active step_item
                    const fieldStepItem = field.closest('.step_item');
                    if (fieldStepItem) {
                        const activeStepItem = this.getActiveStepItemForValidation(fieldStep);
                        if (activeStepItem && fieldStepItem !== activeStepItem) {
                            console.log(`🔍 Form validation skipping field ${field.id || field.name} - not in active step_item`);
                            return;
                        }
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
    
    print('✅ Simple branching validation fix applied!')
    print('- Added getActiveStepItemForValidation() function')
    print('- Updated validateCurrentStep() to only validate active step_item fields')
    print('- Updated validateEntireForm() to only validate active step_item fields')

if __name__ == '__main__':
    apply_simple_fix() 