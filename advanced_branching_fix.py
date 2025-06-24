#!/usr/bin/env python3

def apply_advanced_branching_fix():
    # Read the file
    with open('src/webflow-forms.js', 'r') as f:
        content = f.read()
    
    # First, add a helper function to determine the active step_item
    helper_function = '''
        // Helper function to determine which step_item is active based on selected radio button
        getActiveStepItem: function(currentStep) {
            if (!currentStep) return null;
            
            // Look for selected radio button with data-go-to attribute (branching logic)
            const selectedRadio = currentStep.querySelector('input[type="radio"]:checked[data-go-to]');
            if (selectedRadio) {
                const targetAnswer = selectedRadio.getAttribute('data-go-to');
                // Find the step_item with matching data-answer
                const activeStepItem = currentStep.querySelector(`[data-answer="${targetAnswer}"]`);
                if (activeStepItem) {
                    console.log(`🎯 Active step_item determined: ${targetAnswer}`);
                    return activeStepItem;
                }
            }
            
            // If no branching radio is selected, check for visible step_items
            const stepItems = currentStep.querySelectorAll('.step_item');
            if (stepItems.length === 0) {
                // No step_items in this step, return null (validate all fields)
                return null;
            }
            
            // If there are step_items but no selection, don't validate any (prevents premature validation)
            console.log('⚠️ Step has step_items but no active selection - skipping validation');
            return 'NO_SELECTION';
        },

'''
    
    # Insert the helper function before validateCurrentStep
    content = content.replace(
        '        // Validate current step',
        helper_function + '        // Validate current step'
    )
    
    # Update validateEntireForm to use the new branching logic
    old_validation = '''            allRequiredFields.forEach(field => {
                // Only validate visible fields in visible steps
                const fieldStep = field.closest('[data-form="step"]');
                if (fieldStep && fieldStep.style.display !== 'none') {
                    // Skip fields in hidden step_items (for branching forms)
                    const stepItem = field.closest('.step_item');
                    if (stepItem && stepItem.offsetParent === null) {
                        console.log(`🔍 Form validation skipping field ${field.id || field.name} - in hidden step_item`);
                        return;
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
    
    new_validation = '''            allRequiredFields.forEach(field => {
                // Only validate visible fields in visible steps
                const fieldStep = field.closest('[data-form="step"]');
                if (fieldStep && fieldStep.style.display !== 'none') {
                    // Handle branching logic for step_items
                    const fieldStepItem = field.closest('.step_item');
                    if (fieldStepItem) {
                        const activeStepItem = this.getActiveStepItem(fieldStep);
                        
                        // If no selection has been made, skip validation entirely
                        if (activeStepItem === 'NO_SELECTION') {
                            console.log(`🔍 Form validation skipping field ${field.id || field.name} - no step_item selected yet`);
                            return;
                        }
                        
                        // If field is not in the active step_item, skip it
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
    
    # Apply the replacement
    if old_validation in content:
        content = content.replace(old_validation, new_validation)
        print('✅ Updated validateEntireForm with advanced branching logic')
    else:
        print('❌ Could not find validateEntireForm validation loop to update')
        return False
    
    # Also update validateCurrentStep to use the same logic for consistency
    old_current_step = '''            // Validate conditional required fields (data-require-for-subtypes) - ONLY in visible step_items
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
    
    new_current_step = '''            // Validate conditional required fields (data-require-for-subtypes) - ONLY in active step_item
            const conditionalFields = this.branchingState.currentStep.querySelectorAll('[data-require-for-subtypes]:not([type="radio"])');
            conditionalFields.forEach(field => {
                // Handle branching logic for step_items
                const fieldStepItem = field.closest('.step_item');
                if (fieldStepItem) {
                    const activeStepItem = this.getActiveStepItem(this.branchingState.currentStep);
                    
                    // If no selection has been made, skip validation
                    if (activeStepItem === 'NO_SELECTION') {
                        console.log(`🔍 Step validation skipping field ${field.id || field.name} - no step_item selected yet`);
                        return;
                    }
                    
                    // If field is not in the active step_item, skip it
                    if (activeStepItem && fieldStepItem !== activeStepItem) {
                        console.log(`🔍 Step validation skipping field ${field.id || field.name} - not in active step_item`);
                        return;
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
    
    # Apply the current step validation update if it exists
    if old_current_step in content:
        content = content.replace(old_current_step, new_current_step)
        print('✅ Updated validateCurrentStep with advanced branching logic')
    else:
        print('⚠️ Could not find validateCurrentStep conditional validation - may not exist yet')
    
    # Write back to file
    with open('src/webflow-forms.js', 'w') as f:
        f.write(content)
    
    return True

if __name__ == '__main__':
    if apply_advanced_branching_fix():
        print('🎯 Advanced branching fix applied successfully!')
        print('- Added getActiveStepItem() helper function')
        print('- Updated validateEntireForm() to only validate active step_item fields')
        print('- Updated validateCurrentStep() to use same logic')
        print('- Handles radio button selection changes properly')
        print('- Prevents validation when no branch is selected')
    else:
        print('❌ Advanced fix failed to apply') 