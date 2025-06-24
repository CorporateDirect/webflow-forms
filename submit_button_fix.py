#!/usr/bin/env python3

def fix_submit_button_selector():
    # Read the file
    with open('src/webflow-forms.js', 'r') as f:
        content = f.read()
    
    # Update the submit button selector to include data-form="submit"
    old_selector = "const submitButtons = form.querySelectorAll('[type=\"submit\"], [data-form=\"submit-btn\"]');"
    new_selector = "const submitButtons = form.querySelectorAll('[type=\"submit\"], [data-form=\"submit-btn\"], [data-form=\"submit\"]');"
    
    if old_selector in content:
        content = content.replace(old_selector, new_selector)
        print('✅ Updated submit button selector to include [data-form="submit"]')
    else:
        print('❌ Could not find the submit button selector to update')
        return False
    
    # Write back to file
    with open('src/webflow-forms.js', 'w') as f:
        f.write(content)
    
    return True

if __name__ == '__main__':
    if fix_submit_button_selector():
        print('🎯 Submit button fix applied successfully!')
        print('- Now supports [data-form="submit"] attribute')
        print('- Also supports [data-form="submit-btn"] and [type="submit"]')
        print('- Form validation will trigger on all submit button types')
    else:
        print('❌ Submit button fix failed to apply') 