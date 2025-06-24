#!/usr/bin/env python3

def fix_form_submission_issues():
    # Read the file
    with open('src/webflow-forms.js', 'r') as f:
        content = f.read()
    
    # Fix 1: Update submit button selector to handle final submit button without data-form attribute
    old_submit_selector = "const submitButtons = form.querySelectorAll('[type=\"submit\"], [data-form=\"submit-btn\"], [data-form=\"submit\"]');"
    new_submit_selector = """const submitButtons = form.querySelectorAll('[type="submit"], [data-form="submit-btn"], [data-form="submit"]');
            
            // Filter out submit buttons that are actually navigation buttons (have data-form="next-btn")
            const actualSubmitButtons = Array.from(submitButtons).filter(button => {
                // Exclude buttons that have data-form="next-btn" as they are navigation, not submission
                return !button.hasAttribute('data-form') || 
                       (button.getAttribute('data-form') !== 'next-btn');
            });
            
            console.log(`🔍 Found ${submitButtons.length} total submit buttons, ${actualSubmitButtons.length} actual submit buttons`);"""
    
    if old_submit_selector in content:
        content = content.replace(old_submit_selector, new_submit_selector)
        print('✅ Updated submit button detection to filter out navigation buttons')
    else:
        print('❌ Could not find submit button selector to update')
        return False
    
    # Fix 2: Update the forEach loop to use actualSubmitButtons instead of submitButtons
    old_foreach = "submitButtons.forEach(button => {"
    new_foreach = "actualSubmitButtons.forEach(button => {"
    
    if old_foreach in content:
        content = content.replace(old_foreach, new_foreach)
        print('✅ Updated submit button event binding to use filtered buttons')
    else:
        print('❌ Could not find submit button forEach to update')
        return False
    
    # Fix 3: Add better handling for Webflow form submission
    old_submission_handling = '''                    console.log('✅ Form validation passed - allowing submission');
                });
            });'''
    
    new_submission_handling = '''                    console.log('✅ Form validation passed - allowing submission');
                    
                    // For Webflow forms, trigger the native form submission
                    if (form.hasAttribute('data-form') && form.getAttribute('data-form') === 'multistep') {
                        console.log('🌐 Triggering Webflow form submission...');
                        // Let Webflow handle the submission
                        return true;
                    }
                });
            });'''
    
    if old_submission_handling in content:
        content = content.replace(old_submission_handling, new_submission_handling)
        print('✅ Enhanced Webflow form submission handling')
    else:
        print('❌ Could not find submission handling to update')
        return False
    
    # Fix 4: Add navigation button handling to prevent conflicts
    navigation_button_fix = '''
        // Setup navigation button handling (separate from submit buttons)
        setupNavigationButtonHandling: function(form) {
            console.log('🧭 Setting up navigation button handling...');
            
            // Find navigation buttons that are actually submit type but used for navigation
            const navigationSubmitButtons = form.querySelectorAll('input[type="submit"][data-form="next-btn"]');
            
            navigationSubmitButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    console.log('🚀 Navigation submit button clicked - preventing form submission');
                    
                    // Prevent actual form submission for navigation buttons
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Trigger navigation validation instead
                    const currentStep = button.closest('[data-form="step"]');
                    if (currentStep) {
                        // Validate current step
                        const isCurrentStepValid = this.validateCurrentStep(true);
                        const areBranchingRadiosValid = this.validateBranchingRadioGroups(currentStep);
                        
                        if (isCurrentStepValid && areBranchingRadiosValid) {
                            console.log('✅ Navigation validation passed');
                            // Find the step wrapper and trigger navigation
                            const stepWrapper = button.closest('.step_wrapper');
                            if (stepWrapper && stepWrapper.hasAttribute('data-go-to')) {
                                const targetStep = stepWrapper.getAttribute('data-go-to');
                                console.log(`🧭 Navigating to: ${targetStep}`);
                                // Let the existing navigation system handle this
                            }
                        } else {
                            console.log('❌ Navigation validation failed');
                        }
                    }
                    
                    return false;
                });
            });
            
            console.log(`✅ Navigation button handling setup complete for ${navigationSubmitButtons.length} buttons`);
        },

'''
    
    # Insert the new function before setupFormSubmissionValidation
    setup_form_submission_pos = content.find('        // Setup form submission validation')
    if setup_form_submission_pos != -1:
        content = content[:setup_form_submission_pos] + navigation_button_fix + content[setup_form_submission_pos:]
        print('✅ Added navigation button handling function')
    else:
        print('❌ Could not find position to insert navigation button handling')
        return False
    
    # Fix 5: Add call to setup navigation button handling in the main init
    old_init_call = "this.setupFormSubmissionValidation(form);"
    new_init_call = """this.setupFormSubmissionValidation(form);
            this.setupNavigationButtonHandling(form);"""
    
    if old_init_call in content:
        content = content.replace(old_init_call, new_init_call)
        print('✅ Added navigation button handling to initialization')
    else:
        print('❌ Could not find initialization to update')
        return False
    
    # Write back to file
    with open('src/webflow-forms.js', 'w') as f:
        f.write(content)
    
    return True

if __name__ == '__main__':
    if fix_form_submission_issues():
        print('🎯 Form submission fix applied successfully!')
        print('- Fixed submit button detection to exclude navigation buttons')
        print('- Added proper handling for Webflow form submission')
        print('- Separated navigation button logic from submit button logic')
        print('- Enhanced form submission flow for better Webflow compatibility')
    else:
        print('❌ Form submission fix failed to apply') 