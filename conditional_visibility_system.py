#!/usr/bin/env python3

def add_conditional_visibility_system():
    # Read the file
    with open('src/webflow-forms.js', 'r') as f:
        content = f.read()
    
    # Add the conditional visibility system
    conditional_visibility_system = '''
        // ===== CONDITIONAL VISIBILITY SYSTEM =====
        
        // Setup conditional visibility for all fields with data attributes
        setupConditionalVisibility: function(form) {
            console.log('👁️ Setting up conditional visibility system...');
            
            // Find all fields with conditional visibility attributes
            const conditionalFields = form.querySelectorAll('[data-show-if], [data-hide-if]');
            
            conditionalFields.forEach(field => {
                this.setupFieldConditionalVisibility(field, form);
            });
            
            console.log(`✅ Conditional visibility setup complete for ${conditionalFields.length} fields`);
        },
        
        // Setup conditional visibility for a single field
        setupFieldConditionalVisibility: function(targetField, form) {
            const fieldId = targetField.id || targetField.name || 'unnamed';
            console.log(`👁️ Setting up conditional visibility for field: ${fieldId}`);
            
            // Get the field wrapper (for hiding the entire field container)
            const fieldWrapper = targetField.closest('.multi-form_field-wrapper') || 
                                targetField.closest('.form_field-wrapper') ||
                                targetField.closest('.field-wrapper') ||
                                targetField.parentElement;
            
            if (!fieldWrapper) {
                console.warn(`No field wrapper found for conditional field: ${fieldId}`);
                return;
            }
            
            // Parse show conditions
            const showConditions = this.parseConditionalAttributes(targetField, 'data-show-if');
            const hideConditions = this.parseConditionalAttributes(targetField, 'data-hide-if');
            
            if (showConditions.length === 0 && hideConditions.length === 0) {
                console.warn(`No valid conditional attributes found for field: ${fieldId}`);
                return;
            }
            
            // Store the original required state
            const originalRequired = targetField.hasAttribute('required');
            
            // Function to evaluate and apply visibility
            const evaluateVisibility = () => {
                let shouldShow = true;
                
                // Evaluate show conditions (ALL must be true to show)
                if (showConditions.length > 0) {
                    shouldShow = showConditions.every(condition => 
                        this.evaluateCondition(condition, form)
                    );
                }
                
                // Evaluate hide conditions (ANY true will hide)
                if (hideConditions.length > 0) {
                    const shouldHide = hideConditions.some(condition => 
                        this.evaluateCondition(condition, form)
                    );
                    shouldShow = shouldShow && !shouldHide;
                }
                
                this.applyFieldVisibility(targetField, fieldWrapper, shouldShow, originalRequired);
                
                console.log(`👁️ Field "${fieldId}" visibility: ${shouldShow ? 'VISIBLE' : 'HIDDEN'}`);
            };
            
            // Set up listeners for all trigger fields
            const allConditions = [...showConditions, ...hideConditions];
            const triggerFields = new Set();
            
            allConditions.forEach(condition => {
                const triggerField = form.querySelector(`[name="${condition.fieldName}"], #${condition.fieldName}`);
                if (triggerField) {
                    triggerFields.add(triggerField);
                }
            });
            
            // Add event listeners to trigger fields
            triggerFields.forEach(triggerField => {
                const events = ['change', 'input', 'keyup'];
                events.forEach(eventType => {
                    triggerField.addEventListener(eventType, evaluateVisibility);
                });
                
                console.log(`👁️ Added listeners to trigger field: ${triggerField.name || triggerField.id}`);
            });
            
            // Initial evaluation
            evaluateVisibility();
        },
        
        // Parse conditional attributes into structured conditions
        parseConditionalAttributes: function(field, attributeName) {
            const attributeValue = field.getAttribute(attributeName);
            if (!attributeValue) return [];
            
            const conditions = [];
            
            // Split multiple conditions by semicolon
            const conditionStrings = attributeValue.split(';').map(s => s.trim()).filter(s => s);
            
            conditionStrings.forEach(conditionString => {
                // Parse condition format: "fieldName:operator:value"
                // Examples: "state:equals:California", "age:greaterThan:18", "email:contains:@gmail"
                const parts = conditionString.split(':').map(s => s.trim());
                
                if (parts.length >= 3) {
                    conditions.push({
                        fieldName: parts[0],
                        operator: parts[1],
                        value: parts.slice(2).join(':'), // Rejoin in case value contains colons
                        raw: conditionString
                    });
                } else {
                    console.warn(`Invalid condition format: "${conditionString}". Expected format: "fieldName:operator:value"`);
                }
            });
            
            return conditions;
        },
        
        // Evaluate a single condition
        evaluateCondition: function(condition, form) {
            const triggerField = form.querySelector(`[name="${condition.fieldName}"], #${condition.fieldName}`);
            
            if (!triggerField) {
                console.warn(`Trigger field not found: ${condition.fieldName}`);
                return false;
            }
            
            let fieldValue = '';
            
            // Get field value based on field type
            if (triggerField.type === 'radio') {
                const checkedRadio = form.querySelector(`input[name="${condition.fieldName}"]:checked`);
                fieldValue = checkedRadio ? checkedRadio.value : '';
            } else if (triggerField.type === 'checkbox') {
                fieldValue = triggerField.checked ? triggerField.value : '';
            } else {
                fieldValue = triggerField.value || '';
            }
            
            // Evaluate based on operator
            const result = this.evaluateOperator(fieldValue, condition.operator, condition.value);
            
            console.log(`🔍 Condition "${condition.raw}": "${fieldValue}" ${condition.operator} "${condition.value}" = ${result}`);
            
            return result;
        },
        
        // Evaluate different operators
        evaluateOperator: function(fieldValue, operator, targetValue) {
            // Normalize values for comparison
            const normalizedFieldValue = String(fieldValue).trim().toLowerCase();
            const normalizedTargetValue = String(targetValue).trim().toLowerCase();
            
            switch (operator.toLowerCase()) {
                case 'equals':
                case 'eq':
                case '==':
                    return normalizedFieldValue === normalizedTargetValue;
                    
                case 'notequals':
                case 'neq':
                case '!=':
                    return normalizedFieldValue !== normalizedTargetValue;
                    
                case 'contains':
                    return normalizedFieldValue.includes(normalizedTargetValue);
                    
                case 'notcontains':
                    return !normalizedFieldValue.includes(normalizedTargetValue);
                    
                case 'startswith':
                    return normalizedFieldValue.startsWith(normalizedTargetValue);
                    
                case 'endswith':
                    return normalizedFieldValue.endsWith(normalizedTargetValue);
                    
                case 'isempty':
                case 'empty':
                    return normalizedFieldValue === '';
                    
                case 'isnotempty':
                case 'notempty':
                    return normalizedFieldValue !== '';
                    
                case 'greaterthan':
                case 'gt':
                    return parseFloat(fieldValue) > parseFloat(targetValue);
                    
                case 'lessthan':
                case 'lt':
                    return parseFloat(fieldValue) < parseFloat(targetValue);
                    
                case 'greaterequal':
                case 'gte':
                    return parseFloat(fieldValue) >= parseFloat(targetValue);
                    
                case 'lessequal':
                case 'lte':
                    return parseFloat(fieldValue) <= parseFloat(targetValue);
                    
                case 'in':
                    // Check if field value is in a comma-separated list
                    const valueList = targetValue.split(',').map(v => v.trim().toLowerCase());
                    return valueList.includes(normalizedFieldValue);
                    
                case 'notin':
                    // Check if field value is NOT in a comma-separated list
                    const notInList = targetValue.split(',').map(v => v.trim().toLowerCase());
                    return !notInList.includes(normalizedFieldValue);
                    
                default:
                    console.warn(`Unknown operator: ${operator}`);
                    return false;
            }
        },
        
        // Apply visibility to field and manage required state
        applyFieldVisibility: function(field, fieldWrapper, shouldShow, originalRequired) {
            if (shouldShow) {
                // Show field
                fieldWrapper.style.display = '';
                fieldWrapper.style.visibility = '';
                fieldWrapper.style.opacity = '';
                fieldWrapper.style.height = '';
                
                // Restore required state if originally required
                if (originalRequired) {
                    field.setAttribute('required', '');
                }
                
                // Remove from validation skip list
                field.removeAttribute('data-conditional-hidden');
                
            } else {
                // Hide field
                fieldWrapper.style.display = 'none';
                
                // Remove required state when hidden
                field.removeAttribute('required');
                
                // Clear field value when hidden (optional - can be configured)
                if (field.getAttribute('data-clear-when-hidden') !== 'false') {
                    if (field.type === 'radio' || field.type === 'checkbox') {
                        field.checked = false;
                    } else {
                        field.value = '';
                    }
                }
                
                // Mark as conditionally hidden for validation system
                field.setAttribute('data-conditional-hidden', 'true');
                
                // Hide any validation errors for hidden fields
                const validationData = this.branchingState?.validationErrors?.get(field);
                if (validationData && validationData.errorElement) {
                    validationData.errorElement.style.display = 'none';
                }
            }
        },
        
        // Update validation system to skip conditionally hidden fields
        isFieldConditionallyHidden: function(field) {
            return field.hasAttribute('data-conditional-hidden');
        },

'''
    
    # Insert the conditional visibility system before the existing helper functions
    helper_function_pos = content.find('        // Helper function to determine which step_item is active')
    if helper_function_pos != -1:
        content = content[:helper_function_pos] + conditional_visibility_system + content[helper_function_pos:]
        print('✅ Added conditional visibility system')
    else:
        print('❌ Could not find position to insert conditional visibility system')
        return False
    
    # Update validateField to skip conditionally hidden fields
    old_validate_field = '''        // Validate individual field
        validateField: function(field, showErrors = true) {
            const fieldId = field.id || field.name || 'unnamed';
            const fieldValue = field.value?.trim() || '';'''
    
    new_validate_field = '''        // Validate individual field
        validateField: function(field, showErrors = true) {
            // Skip validation for conditionally hidden fields
            if (this.isFieldConditionallyHidden && this.isFieldConditionallyHidden(field)) {
                console.log(`⏭️ Skipping validation for conditionally hidden field: ${field.id || field.name}`);
                return true;
            }
            
            const fieldId = field.id || field.name || 'unnamed';
            const fieldValue = field.value?.trim() || '';'''
    
    if old_validate_field in content:
        content = content.replace(old_validate_field, new_validate_field)
        print('✅ Updated validateField to skip conditionally hidden fields')
    else:
        print('❌ Could not find validateField to update')
        return False
    
    # Add conditional visibility setup to the main initialization
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
    if add_conditional_visibility_system():
        print('🎯 Conditional visibility system added successfully!')
        print('')
        print('📖 USAGE EXAMPLES:')
        print('')
        print('1. Hide field when state is California:')
        print('   <input data-hide-if="state:equals:California" ... />')
        print('')
        print('2. Show field only when age is over 18:')
        print('   <input data-show-if="age:greaterThan:18" ... />')
        print('')
        print('3. Multiple conditions (ALL must be true):')
        print('   <input data-show-if="country:equals:USA;state:notequals:California" ... />')
        print('')
        print('4. Hide when value is in a list:')
        print('   <input data-hide-if="state:in:California,New York,Texas" ... />')
        print('')
        print('🔧 SUPPORTED OPERATORS:')
        print('   equals, notequals, contains, notcontains, startswith, endswith')
        print('   isempty, isnotempty, greaterthan, lessthan, greaterequal, lessequal')
        print('   in, notin')
        print('')
        print('✨ FEATURES:')
        print('   - Automatically manages required state')
        print('   - Clears values when hidden (configurable)')
        print('   - Integrates with validation system')
        print('   - Works with all field types (text, select, radio, checkbox)')
        print('   - Modular and reusable across forms')
    else:
        print('❌ Conditional visibility system failed to apply') 