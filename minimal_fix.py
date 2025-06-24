#!/usr/bin/env python3

def apply_minimal_fix():
    # Read the file
    with open('src/webflow-forms.js', 'r') as f:
        content = f.read()
    
    # Find the validateEntireForm function and update just the field validation loop
    old_validation_loop = '''            allRequiredFields.forEach(field => {
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
    
    new_validation_loop = '''            allRequiredFields.forEach(field => {
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
    
    # Apply the replacement
    if old_validation_loop in content:
        content = content.replace(old_validation_loop, new_validation_loop)
        print('✅ Applied minimal branching fix to validateEntireForm')
    else:
        print('❌ Could not find the target validation loop to replace')
        return False
    
    # Write back to file
    with open('src/webflow-forms.js', 'w') as f:
        f.write(content)
    
    return True

if __name__ == '__main__':
    if apply_minimal_fix():
        print('✅ Minimal fix applied successfully!')
        print('- Only hidden step_items are now skipped during form validation')
        print('- This should fix the "Add Member" button being disabled incorrectly')
    else:
        print('❌ Fix failed to apply') 