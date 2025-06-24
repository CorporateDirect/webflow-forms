#!/usr/bin/env python3

def fix_radio_validation():
    # Read the file
    with open('src/webflow-forms.js', 'r') as f:
        content = f.read()
    
    # Fix 1: Update validateCurrentStepRadioGroups to always validate required radio groups during navigation
    old_radio_validation = '''        // Validate all radio groups in current step
        validateCurrentStepRadioGroups: function(currentStep) {
            if (!this.branchingState.radioGroups) return true;
            
            let allValid = true;
            const invalidGroups = [];
            
            this.branchingState.radioGroups.forEach((group, groupName) => {
                // Check if any radio from this group is in the current step
                const hasRadioInStep = group.radios.some(radio => 
                    currentStep.contains(radio)
                );
                
                // Only validate standard required radio groups that have been interacted with
                // This prevents showing errors for untouched radio groups
                if (hasRadioInStep && group.isStandardRequired && group.hasBeenInteracted) {
                    const isGroupValid = this.validateRadioGroup(group);
                    if (!isGroupValid) {
                        allValid = false;
                        invalidGroups.push(group);
                    }
                }
            });
            
            if (!allValid) {
                console.log(`❌ Radio group validation failed for ${invalidGroups.length} interacted standard required groups in current step`);
                
                // Focus on first invalid radio group
                if (invalidGroups.length > 0 && invalidGroups[0].radios.length > 0) {
                    setTimeout(() => {
                        invalidGroups[0].radios[0].focus();
                    }, 100);
                }
            }
            
            return allValid;
        },'''
    
    new_radio_validation = '''        // Validate all radio groups in current step
        validateCurrentStepRadioGroups: function(currentStep) {
            if (!this.branchingState.radioGroups) return true;
            
            let allValid = true;
            const invalidGroups = [];
            
            this.branchingState.radioGroups.forEach((group, groupName) => {
                // Check if any radio from this group is in the current step
                const hasRadioInStep = group.radios.some(radio => 
                    currentStep.contains(radio)
                );
                
                // Validate ALL standard required radio groups in current step
                // Remove interaction requirement for more reliable validation
                if (hasRadioInStep && group.isStandardRequired) {
                    const isGroupValid = this.validateRadioGroup(group);
                    if (!isGroupValid) {
                        allValid = false;
                        invalidGroups.push(group);
                        console.log(`❌ Required radio group "${groupName}" has no selection`);
                    }
                }
            });
            
            if (!allValid) {
                console.log(`❌ Radio group validation failed for ${invalidGroups.length} required radio groups in current step`);
                
                // Focus on first invalid radio group
                if (invalidGroups.length > 0 && invalidGroups[0].radios.length > 0) {
                    setTimeout(() => {
                        invalidGroups[0].radios[0].focus();
                    }, 100);
                }
            }
            
            return allValid;
        },'''
    
    # Apply the first fix
    if old_radio_validation in content:
        content = content.replace(old_radio_validation, new_radio_validation)
        print('✅ Updated validateCurrentStepRadioGroups to always validate required radio groups')
    else:
        print('❌ Could not find validateCurrentStepRadioGroups function to update')
        return False
    
    # Fix 2: Improve radio group setup to be more robust in finding error elements
    old_error_finding = '''        // Find error element for radio group
        findRadioGroupErrorElement: function(firstRadio) {
            // Look for error element in the radio group container
            const groupContainer = firstRadio.closest('.multi-form_field-wrapper') || 
                                 firstRadio.closest('.form_radio-2col') || 
                                 firstRadio.closest('.radio_component') || 
                                 firstRadio.parentElement;
            
            console.log(`🔍 Looking for error element for radio "${firstRadio.name}" in container:`, groupContainer?.className || 'no container');
            
            if (groupContainer) {
                // Look for error element within the container
                let errorElement = groupContainer.querySelector('.text-size-tiny.error-state');
                if (errorElement) {
                    console.log(`📍 Found .text-size-tiny.error-state within container for radio "${firstRadio.name}"`);
                    return errorElement;
                }
                
                errorElement = groupContainer.querySelector('.text-size-small.error-state');
                if (errorElement) {
                    console.log(`📍 Found .text-size-small.error-state within container for radio "${firstRadio.name}"`);
                    return errorElement;
                }
                
                // Look for error element immediately after the container (same level)
                let nextElement = groupContainer.nextElementSibling;
                while (nextElement && nextElement.nodeType === 1) { // Only check element nodes
                    if ((nextElement.classList.contains('text-size-tiny') || nextElement.classList.contains('text-size-small')) && 
                        nextElement.classList.contains('error-state')) {
                        console.log(`📍 Found error element after container for radio "${firstRadio.name}":`, nextElement.textContent.trim());
                        return nextElement;
                    }
                    nextElement = nextElement.nextElementSibling;
                }
            }
            
            console.log(`❌ No error element found for radio "${firstRadio.name}"`);
            return null;
        },'''
    
    new_error_finding = '''        // Find error element for radio group
        findRadioGroupErrorElement: function(firstRadio) {
            const radioName = firstRadio.name;
            console.log(`🔍 Looking for error element for radio group "${radioName}"`);
            
            // Strategy 1: Look in common radio group containers
            const containers = [
                firstRadio.closest('.multi-form_field-wrapper'),
                firstRadio.closest('.form_radio-2col'), 
                firstRadio.closest('.radio_component'),
                firstRadio.closest('.form_field'),
                firstRadio.closest('.field-wrapper'),
                firstRadio.closest('[class*="radio"]'),
                firstRadio.parentElement
            ].filter(Boolean);
            
            for (const container of containers) {
                console.log(`🔍 Searching in container: ${container.className || 'unnamed'}`);
                
                // Look for error elements within container
                const errorSelectors = [
                    '.text-size-tiny.error-state',
                    '.text-size-small.error-state',
                    '.error-state',
                    '[class*="error"]'
                ];
                
                for (const selector of errorSelectors) {
                    const errorElement = container.querySelector(selector);
                    if (errorElement && errorElement.textContent.trim()) {
                        console.log(`📍 Found error element "${selector}" for radio "${radioName}": "${errorElement.textContent.trim()}"`);
                        return errorElement;
                    }
                }
                
                // Look for error element immediately after the container
                let nextElement = container.nextElementSibling;
                while (nextElement && nextElement.nodeType === 1) {
                    if (nextElement.classList.contains('error-state') || 
                        nextElement.textContent.toLowerCase().includes('required') ||
                        nextElement.textContent.toLowerCase().includes('select')) {
                        console.log(`📍 Found adjacent error element for radio "${radioName}": "${nextElement.textContent.trim()}"`);
                        return nextElement;
                    }
                    nextElement = nextElement.nextElementSibling;
                }
            }
            
            // Strategy 2: Look for any error elements that might be associated with this radio group
            // Search in the broader form context
            const currentStep = firstRadio.closest('[data-form="step"]');
            if (currentStep) {
                const allErrorElements = currentStep.querySelectorAll('.error-state, [class*="error"]');
                for (const errorEl of allErrorElements) {
                    const errorText = errorEl.textContent.trim().toLowerCase();
                    if (errorText && (errorText.includes('required') || errorText.includes('select'))) {
                        // Check if this error element is near our radio group
                        const errorRect = errorEl.getBoundingClientRect();
                        const radioRect = firstRadio.getBoundingClientRect();
                        const distance = Math.abs(errorRect.top - radioRect.bottom);
                        
                        if (distance < 100) { // Within 100px vertically
                            console.log(`📍 Found nearby error element for radio "${radioName}": "${errorEl.textContent.trim()}"`);
                            return errorEl;
                        }
                    }
                }
            }
            
            console.log(`❌ No error element found for radio "${radioName}"`);
            return null;
        },'''
    
    # Apply the second fix
    if old_error_finding in content:
        content = content.replace(old_error_finding, new_error_finding)
        print('✅ Enhanced radio group error element detection')
    else:
        print('❌ Could not find findRadioGroupErrorElement function to update')
        return False
    
    # Fix 3: Also validate radio groups in validateEntireForm for form submission
    old_entire_form = '''            allRequiredFields.forEach(field => {
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
    
    new_entire_form = '''            allRequiredFields.forEach(field => {
                // Skip radio buttons - they are validated separately
                if (field.type === 'radio') {
                    return;
                }
                
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
            });
            
            // Validate radio groups across all visible steps
            if (this.branchingState.radioGroups) {
                this.branchingState.radioGroups.forEach((group, groupName) => {
                    // Check if radio group is in a visible step
                    const firstRadio = group.radios[0];
                    const radioStep = firstRadio.closest('[data-form="step"]');
                    
                    if (radioStep && radioStep.style.display !== 'none' && group.isStandardRequired) {
                        const isSelected = group.radios.some(radio => radio.checked);
                        if (!isSelected) {
                            allValid = false;
                            invalidFields.push({
                                field: firstRadio,
                                step: radioStep
                            });
                            console.log(`❌ Form validation failed for required radio group "${groupName}"`);
                        }
                    }
                });
            }'''
    
    # Apply the third fix
    if old_entire_form in content:
        content = content.replace(old_entire_form, new_entire_form)
        print('✅ Added radio group validation to validateEntireForm')
    else:
        print('❌ Could not find validateEntireForm field validation loop to update')
        return False
    
    # Write back to file
    with open('src/webflow-forms.js', 'w') as f:
        f.write(content)
    
    return True

if __name__ == '__main__':
    if fix_radio_validation():
        print('🎯 Radio validation fix applied successfully!')
        print('- Removed interaction requirement for standard required radio groups')
        print('- Enhanced error element detection with multiple strategies')
        print('- Added radio group validation to form submission')
        print('- Made validation more modular and reliable for future forms')
    else:
        print('❌ Radio validation fix failed to apply') 