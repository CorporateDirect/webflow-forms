#!/usr/bin/env python3

def add_conditional_init():
    # Read the file
    with open('src/webflow-forms.js', 'r') as f:
        content = f.read()
    
    # Add conditional visibility to the initialization sequence
    old_init = '''            // Setup radio button group validation separately
            this.setupRadioGroupValidation(form);
            
            // Setup form submission validation
            this.setupFormSubmissionValidation(form);'''
    
    new_init = '''            // Setup radio button group validation separately
            this.setupRadioGroupValidation(form);
            
            // Setup conditional visibility system
            this.setupConditionalVisibility(form);
            
            // Setup form submission validation
            this.setupFormSubmissionValidation(form);'''
    
    if old_init in content:
        content = content.replace(old_init, new_init)
        print('✅ Added conditional visibility to initialization sequence')
    else:
        print('❌ Could not find initialization sequence to update')
        return False
    
    # Write back to file
    with open('src/webflow-forms.js', 'w') as f:
        f.write(content)
    
    return True

if __name__ == '__main__':
    if add_conditional_init():
        print('🎯 Conditional visibility system is now fully integrated!')
        print('')
        print('📋 SYSTEM STATUS:')
        print('✅ Conditional visibility functions added')
        print('✅ Validation system updated to skip hidden fields')
        print('✅ Initialization sequence updated')
        print('')
        print('🚀 READY TO USE! Example for your California case:')
        print('')
        print('HTML in Webflow:')
        print('  <select name="state" id="state">')
        print('    <option value="">Select State...</option>')
        print('    <option value="California">California</option>')
        print('    <option value="Nevada">Nevada</option>')
        print('  </select>')
        print('')
        print('  <input data-hide-if="state:equals:California" ')
        print('         name="franchiseTaxField" ')
        print('         required ')
        print('         placeholder="Hidden when California selected" />')
        print('')
        print('🎛️ AVAILABLE OPERATORS:')
        print('  equals, notequals, contains, notcontains')
        print('  startswith, endswith, isempty, isnotempty')
        print('  greaterthan, lessthan, greaterequal, lessequal')
        print('  in, notin')
    else:
        print('❌ Failed to complete conditional visibility integration') 