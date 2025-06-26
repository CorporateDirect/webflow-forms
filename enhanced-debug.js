// Enhanced Debug Script - Shows detailed field information
(function() {
    console.log('🔍 ENHANCED DEBUG - Detailed Field Analysis');
    
    function getFieldValue(field) {
        if (field.type === 'radio') {
            const checkedRadio = document.querySelector(`input[name="${field.name}"]:checked`);
            return checkedRadio ? checkedRadio.value : '';
        } else if (field.type === 'checkbox') {
            return field.checked ? (field.value || 'Yes') : '';
        } else if (field.tagName.toLowerCase() === 'select') {
            const selectedOption = field.options[field.selectedIndex];
            return selectedOption ? selectedOption.text : '';
        } else {
            return field.value || '';
        }
    }

    function analyzeEntityFields() {
        console.log('�� ENTITY SELECTIONS:');
        const entityFields = document.querySelectorAll(`
            [data-step-field-name*="Type"], [data-step-field-name*="type"],
            input[name*="member"], input[name*="entity"], input[name*="management"],
            input[value="Individual"], input[value="Entity"]
        `);
        
        console.log(`Found ${entityFields.length} entity fields:`);
        Array.from(entityFields).forEach((field, index) => {
            const fieldName = field.dataset.stepFieldName || field.dataset.stepField;
            const stepContainer = field.closest('[data-step-type]');
            const currentValue = getFieldValue(field);
            
            console.log(`Field ${index + 1}: ${fieldName} = "${currentValue}" (checked: ${field.checked}, value: "${field.value}")`);
            console.log(`  Context: ${stepContainer?.dataset.stepType}-${stepContainer?.dataset.stepNumber}-${stepContainer?.dataset.stepSubtype}`);
        });
    }

    function analyzeChildEntities() {
        console.log('🔍 CHILD ENTITIES:');
        const childContainers = document.querySelectorAll('[data-step-type="child-entity"]');
        console.log(`Found ${childContainers.length} child entity containers:`);
        
        Array.from(childContainers).forEach((container, index) => {
            console.log(`Child ${index + 1}: ${container.dataset.stepType}-${container.dataset.stepNumber}-${container.dataset.stepSubtype}`);
            const fields = container.querySelectorAll('[data-step-field-name], [data-step-field]');
            Array.from(fields).forEach((field, fieldIndex) => {
                const fieldName = field.dataset.stepFieldName || field.dataset.stepField;
                console.log(`  Field ${fieldIndex + 1}: ${fieldName} = "${getFieldValue(field)}"`);
            });
        });
    }

    function runAnalysis() {
        const form = document.querySelector('[data-form="multistep"]');
        if (!form) {
            setTimeout(runAnalysis, 1000);
            return;
        }
        analyzeEntityFields();
        analyzeChildEntities();
        console.log('🔍 ENHANCED DEBUG COMPLETE');
    }

    setTimeout(runAnalysis, 2000);
    window.runEnhancedDebug = runAnalysis;
})();
