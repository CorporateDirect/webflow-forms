#!/usr/bin/env python3

def add_conditional_visibility_simple():
    # Read the file
    with open('src/webflow-forms.js', 'r') as f:
        content = f.read()
    
    # Add conditional visibility check to validateField
    old_validate_field_start = '''        // Validate individual field
        validateField: function(field, showError = true) {
            const fieldId = field.id || field.name || 'unnamed';
            const validationData = this.branchingState.validationErrors.get(field);'''
    
    new_validate_field_start = '''        // Validate individual field
        validateField: function(field, showError = true) {
            // Skip validation for conditionally hidden fields
            if (field.hasAttribute('data-conditional-hidden')) {
                console.log(`⏭️ Skipping validation for conditionally hidden field: ${field.id || field.name}`);
                return true;
            }
            
            const fieldId = field.id || field.name || 'unnamed';
            const validationData = this.branchingState.validationErrors.get(field);'''
    
    if old_validate_field_start in content:
        content = content.replace(old_validate_field_start, new_validate_field_start)
        print('✅ Added conditional visibility check to validateField')
    else:
        print('❌ Could not find validateField to update')
        return False
    
    # Add conditional visibility setup to initialization
    old_init = '''            // Setup form validation
            this.setupFormValidation(form);
            this.setupRadioGroupValidation(form);
            this.setupFormSubmissionValidation(form);'''
    
    new_init = '''            // Setup form validation
            this.setupFormValidation(form);
            this.setupRadioGroupValidation(form);
            this.setupConditionalVisibility(form);
            this.setupFormSubmissionValidation(form);'''
    
    if old_init in content:
        content = content.replace(old_init, new_init)
        print('✅ Added conditional visibility to initialization')
    else:
        print('❌ Could not find initialization to update')
        return False
    
    # Write back to file
    with open('src/webflow-forms.js', 'w') as f:
        f.write(content)
    
    return True

if __name__ == '__main__':
    if add_conditional_visibility_simple():
        print('✅ Conditional visibility validation check added!')
        print('✅ The main conditional visibility system was already added in the previous step')
        print('')
        print('🎯 READY TO USE! For your California example:')
        print('')
        print('HTML:')
        print('  <select name="state" id="state">')
        print('    <option value="California">California</option>')
        print('    <option value="Nevada">Nevada</option>')
        print('  </select>')
        print('')
        print('  <input data-hide-if="state:equals:California" ')
        print('         name="someField" ')
        print('         required ')
        print('         placeholder="This field hides when CA is selected" />')
        print('')
        print('🔧 The system will:')
        print('  - Hide the field when California is selected')
        print('  - Remove the required attribute when hidden')
        print('  - Skip validation for hidden fields')
        print('  - Clear the field value when hidden')
        print('  - Restore everything when shown again')
    else:
        print('❌ Failed to add conditional visibility validation check') 