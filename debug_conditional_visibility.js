// ENHANCED DEBUG SCRIPT FOR CONDITIONAL VISIBILITY
// Paste this into your browser console to debug the California franchise tax field issue

console.log('🔍 DEBUGGING CONDITIONAL VISIBILITY - CALIFORNIA FRANCHISE TAX');
console.log('==============================================================');

// Find the form
const form = document.querySelector('[data-form="multistep"]');
if (!form) {
    console.error('❌ No multistep form found!');
} else {
    console.log('✅ Form found');
}

// Check all possible script instances
console.log('\n🔧 CHECKING SCRIPT INSTANCES:');
console.log('window.WebflowForms:', typeof window.WebflowForms, window.WebflowForms);
console.log('window.WebflowFieldEnhancer:', typeof window.WebflowFieldEnhancer, window.WebflowFieldEnhancer);

// Check if our script loaded
const webflowInstance = window.WebflowForms || window.WebflowFieldEnhancer;
if (webflowInstance) {
    console.log('✅ WebflowForms script loaded');
    console.log('Available methods:', Object.keys(webflowInstance));
    console.log('setupConditionalVisibility exists:', typeof webflowInstance.setupConditionalVisibility);
} else {
    console.error('❌ WebflowForms script not loaded!');
}

// Find the California franchise wrapper specifically
console.log('\n🎯 LOOKING FOR CALIFORNIA FRANCHISE WRAPPER:');
const californiaWrapper = form.querySelector('#california-franchise-wrapper');
const californiaWrapperAlt = form.querySelector('.ca-conditional-visibility');
const californiaWrapperAlt2 = form.querySelector('[data-visibility="california"]');

console.log('By ID:', californiaWrapper ? '✅ Found' : '❌ Not found');
console.log('By class:', californiaWrapperAlt ? '✅ Found' : '❌ Not found');
console.log('By data-visibility:', californiaWrapperAlt2 ? '✅ Found' : '❌ Not found');

const targetWrapper = californiaWrapper || californiaWrapperAlt || californiaWrapperAlt2;
if (targetWrapper) {
    console.log(`✅ Target wrapper found: ${targetWrapper.id || targetWrapper.className}`);
    console.log(`   - data-hide-if: "${targetWrapper.getAttribute('data-hide-if')}"`);
    console.log(`   - data-show-if: "${targetWrapper.getAttribute('data-show-if')}"`);
    console.log(`   - Current visibility: ${targetWrapper.style.display !== 'none' ? 'VISIBLE' : 'HIDDEN'}`);
} else {
    console.error('❌ Target wrapper not found!');
}

// Find Child Entity field
console.log('\n🎯 LOOKING FOR CHILD ENTITY FIELD:');
const childEntityField = form.querySelector('[name="Child-Entity-1"]') || form.querySelector('#Child-Entity-1');
if (childEntityField) {
    console.log(`✅ Child Entity field found: ${childEntityField.name || childEntityField.id}`);
    console.log(`   - Current value: "${childEntityField.value}"`);
    console.log(`   - Type: ${childEntityField.type}`);
} else {
    console.error('❌ Child Entity field not found!');
}

// Find all fields with conditional attributes
console.log('\n📋 ALL FIELDS WITH CONDITIONAL ATTRIBUTES:');
const conditionalFields = form.querySelectorAll('[data-show-if], [data-hide-if]');
console.log(`Found ${conditionalFields.length} fields with conditional attributes:`);

conditionalFields.forEach((field, index) => {
    console.log(`${index + 1}. Element: ${field.tagName} ${field.id ? '#' + field.id : ''}`);
    console.log(`   - data-hide-if: "${field.getAttribute('data-hide-if') || 'none'}"`);
    console.log(`   - Current visibility: ${field.style.display !== 'none' ? 'VISIBLE' : 'HIDDEN'}`);
});

// MANUAL IMPLEMENTATION OF CONDITIONAL VISIBILITY
console.log('\n🛠️ IMPLEMENTING CONDITIONAL VISIBILITY MANUALLY:');

window.manualConditionalVisibility = function() {
    console.log('🚀 Starting manual conditional visibility setup...');
    
    if (!targetWrapper || !childEntityField) {
        console.error('❌ Missing required elements for manual setup');
        return false;
    }
    
    // Parse the condition
    const condition = targetWrapper.getAttribute('data-hide-if');
    console.log(`📋 Condition: "${condition}"`);
    
    // Function to evaluate condition
    const evaluateCondition = (fieldValue, operator, targetValue) => {
        const normalizedFieldValue = String(fieldValue).trim().toLowerCase();
        const normalizedTargetValue = String(targetValue).trim().toLowerCase();
        
        switch (operator.toLowerCase()) {
            case 'equals':
                return normalizedFieldValue === normalizedTargetValue;
            case 'notequals':
                return normalizedFieldValue !== normalizedTargetValue;
            default:
                console.warn(`Unknown operator: ${operator}`);
                return false;
        }
    };
    
    // Function to check visibility
    const checkVisibility = () => {
        const fieldValue = childEntityField.value;
        console.log(`🔍 Checking visibility - Field value: "${fieldValue}"`);
        
        // Parse all conditions (semicolon separated)
        const conditions = condition.split(';').map(c => c.trim());
        let shouldHide = false;
        
        conditions.forEach(cond => {
            const parts = cond.split(':');
            if (parts.length >= 3) {
                const fieldName = parts[0];
                const operator = parts[1];
                const targetValue = parts[2];
                
                console.log(`🔍 Testing: ${fieldName} ${operator} ${targetValue}`);
                
                // For this specific case, we know it's Child-Entity-1
                if (fieldName === 'Child-Entity-1') {
                    const result = evaluateCondition(fieldValue, operator, targetValue);
                    console.log(`   Result: ${result}`);
                    if (result) {
                        shouldHide = true;
                    }
                }
            }
        });
        
        // Apply visibility
        if (shouldHide) {
            targetWrapper.style.display = 'none';
            console.log('🙈 HIDING wrapper');
        } else {
            targetWrapper.style.display = '';
            console.log('👀 SHOWING wrapper');
        }
        
        console.log(`✅ Visibility check complete - Wrapper is ${shouldHide ? 'HIDDEN' : 'VISIBLE'}`);
    };
    
    // Add event listener
    childEntityField.addEventListener('change', function() {
        console.log(`🔄 Field changed to: "${this.value}"`);
        setTimeout(checkVisibility, 50);
    });
    
    // Initial check
    checkVisibility();
    
    console.log('✅ Manual conditional visibility setup complete!');
    return true;
};

// Auto-run manual setup
console.log('\n🚀 AUTO-RUNNING MANUAL SETUP:');
const setupResult = window.manualConditionalVisibility();

if (setupResult) {
    console.log('\n✅ MANUAL SETUP SUCCESSFUL!');
    console.log('🧪 TEST INSTRUCTIONS:');
    console.log('1. Change Child-Entity-1 to "California" - wrapper should HIDE');
    console.log('2. Change Child-Entity-1 to "Arkansas" - wrapper should SHOW');
    console.log('3. Watch the console for real-time feedback');
    
    // Test current state
    if (childEntityField && targetWrapper) {
        console.log(`\n📊 CURRENT STATE:`);
        console.log(`Field value: "${childEntityField.value}"`);
        console.log(`Wrapper visibility: ${targetWrapper.style.display !== 'none' ? 'VISIBLE' : 'HIDDEN'}`);
        
        // Test the logic
        const shouldHide = childEntityField.value.toLowerCase() === 'california';
        console.log(`Should hide: ${shouldHide} (${shouldHide ? 'YES' : 'NO'})`);
    }
} else {
    console.error('❌ Manual setup failed');
} 