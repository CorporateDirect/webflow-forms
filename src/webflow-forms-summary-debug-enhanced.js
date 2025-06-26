/**
 * Enhanced Debug Script - Shows detailed field information
 */
(function() {
    'use strict';

    console.log('🔍 ENHANCED DEBUG - Detailed Field Analysis');
    console.log('═══════════════════════════════════════════════════════════════════');

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
        console.log('🔍 ENTITY SELECTIONS - DETAILED ANALYSIS:');
        console.log('─────────────────────────────────────────────────────────────────');
        
        const entityFields = document.querySelectorAll(`
            [data-step-field-name*="Type"],
            [data-step-field-name*="type"],
            input[name*="member"],
            input[name*="entity"],
            input[name*="management"],
            input[value="Individual"],
            input[value="Entity"]
        `);
        
        console.log(`📊 Found ${entityFields.length} entity-related fields:`);
        
        Array.from(entityFields).forEach((field, index) => {
            const fieldName = field.dataset.stepFieldName || field.dataset.stepField;
            const stepContainer = field.closest('[data-step-type]');
            const currentValue = getFieldValue(field);
            
            console.log(`🏢 ENTITY FIELD ${index + 1}:`);
            console.log(`   fieldName: "${fieldName}"`);
            console.log(`   name: "${field.name}"`);
            console.log(`   type: "${field.type}"`);
            console.log(`   value: "${field.value}"`);
            console.log(`   currentValue: "${currentValue}"`);
            console.log(`   checked: ${field.checked}`);
            console.log(`   stepType: "${stepContainer?.dataset.stepType}"`);
            console.log(`   stepNumber: "${stepContainer?.dataset.stepNumber}"`);
            console.log(`   stepSubtype: "${stepContainer?.dataset.stepSubtype}"`);
            console.log(`   ─────────────────────────────────────────────────────────────────`);
        });
    }

    function analyzeChildEntityDetails() {
        console.log('🔍 CHILD ENTITIES - DETAILED ANALYSIS:');
        console.log('─────────────────────────────────────────────────────────────────');
        
        const childEntityContainers = document.querySelectorAll('[data-step-type="child-entity"]');
        console.log(`📊 Found ${childEntityContainers.length} child entity containers:`);
        
        Array.from(childEntityContainers).forEach((container, index) => {
            console.log(`👶 CHILD ENTITY FORM ${index + 1}:`);
            console.log(`   stepType: "${container.dataset.stepType}"`);
            console.log(`   stepNumber: "${container.dataset.stepNumber}"`);
            console.log(`   stepSubtype: "${container.dataset.stepSubtype}"`);
            
            const childFields = container.querySelectorAll('[data-step-field-name], [data-step-field]');
            console.log(`   └─ ${childFields.length} fields in container:`);
            
            Array.from(childFields).forEach((field, fieldIndex) => {
                const fieldName = field.dataset.stepFieldName || field.dataset.stepField;
                const currentValue = getFieldValue(field);
                
                console.log(`      Field ${fieldIndex + 1}:`);
                console.log(`        fieldName: "${fieldName}"`);
                console.log(`        type: "${field.type || field.tagName}"`);
                console.log(`        currentValue: "${currentValue}"`);
                console.log(`        name: "${field.name}"`);
            });
            console.log(`   ─────────────────────────────────────────────────────────────────`);
        });

        // Summary containers
        const childSummaryContainers = document.querySelectorAll('[data-summary-type="child-entity"]');
        console.log(`📊 Found ${childSummaryContainers.length} child entity summary containers:`);
        
        Array.from(childSummaryContainers).forEach((container, index) => {
            console.log(`👶 CHILD ENTITY SUMMARY ${index + 1}:`);
            console.log(`   summaryType: "${container.dataset.summaryType}"`);
            console.log(`   summaryNumber: "${container.dataset.summaryNumber}"`);
            console.log(`   summarySubtype: "${container.dataset.summarySubtype}"`);
            
            const summaryFields = container.querySelectorAll('[data-summary-field]');
            console.log(`   └─ ${summaryFields.length} summary fields:`);
            
            Array.from(summaryFields).forEach((field, fieldIndex) => {
                console.log(`      Summary ${fieldIndex + 1}:`);
                console.log(`        fieldName: "${field.dataset.summaryField}"`);
                console.log(`        currentText: "${field.textContent?.trim()}"`);
            });
            console.log(`   ─────────────────────────────────────────────────────────────────`);
        });
    }

    function analyzeMatchingIssues() {
        console.log('🔍 MATCHING ISSUES - DETAILED ANALYSIS:');
        console.log('─────────────────────────────────────────────────────────────────');
        
        // Focus on entity type fields specifically
        const memberTypeFields = document.querySelectorAll('[data-step-field-name="memberType"]');
        const managementTypeFields = document.querySelectorAll('[data-step-field-name="managementType"]');
        
        console.log(`📊 memberType fields found: ${memberTypeFields.length}`);
        Array.from(memberTypeFields).forEach((field, index) => {
            const stepContainer = field.closest('[data-step-type]');
            const currentValue = getFieldValue(field);
            
            console.log(`🏢 memberType Field ${index + 1}:`);
            console.log(`   currentValue: "${currentValue}"`);
            console.log(`   checked: ${field.checked}`);
            console.log(`   value: "${field.value}"`);
            console.log(`   stepType: "${stepContainer?.dataset.stepType}"`);
            console.log(`   stepNumber: "${stepContainer?.dataset.stepNumber}"`);
            console.log(`   stepSubtype: "${stepContainer?.dataset.stepSubtype}"`);
            
            // Find matching summary
            const summaryElements = document.querySelectorAll(`
                [data-summary-type="${stepContainer?.dataset.stepType}"][data-summary-number="${stepContainer?.dataset.stepNumber}"] [data-summary-field="memberType"]
            `);
            console.log(`   └─ Matching summaries found: ${summaryElements.length}`);
            Array.from(summaryElements).forEach((elem, summIndex) => {
                console.log(`      Summary ${summIndex + 1}: "${elem.textContent?.trim()}"`);
            });
        });

        console.log(`📊 managementType fields found: ${managementTypeFields.length}`);
        Array.from(managementTypeFields).forEach((field, index) => {
            const stepContainer = field.closest('[data-step-type]');
            const currentValue = getFieldValue(field);
            
            console.log(`🏢 managementType Field ${index + 1}:`);
            console.log(`   currentValue: "${currentValue}"`);
            console.log(`   checked: ${field.checked}`);
            console.log(`   value: "${field.value}"`);
            console.log(`   stepType: "${stepContainer?.dataset.stepType}"`);
            console.log(`   stepNumber: "${stepContainer?.dataset.stepNumber}"`);
            console.log(`   stepSubtype: "${stepContainer?.dataset.stepSubtype}"`);
            
            // Find matching summary
            const summaryElements = document.querySelectorAll(`
                [data-summary-type="${stepContainer?.dataset.stepType}"][data-summary-number="${stepContainer?.dataset.stepNumber}"] [data-summary-field="managementType"]
            `);
            console.log(`   └─ Matching summaries found: ${summaryElements.length}`);
            Array.from(summaryElements).forEach((elem, summIndex) => {
                console.log(`      Summary ${summIndex + 1}: "${elem.textContent?.trim()}"`);
            });
        });
    }

    function runEnhancedAnalysis() {
        const form = document.querySelector('[data-form="multistep"]');
        if (!form) {
            console.log('⏳ Waiting for form to load...');
            setTimeout(runEnhancedAnalysis, 1000);
            return;
        }

        analyzeEntityFields();
        analyzeChildEntityDetails();
        analyzeMatchingIssues();
        
        console.log('🔍 ENHANCED DEBUG ANALYSIS COMPLETE');
        console.log('═══════════════════════════════════════════════════════════════════');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runEnhancedAnalysis, 2000);
        });
    } else {
        setTimeout(runEnhancedAnalysis, 2000);
    }

    // Expose to window
    window.runEnhancedDebug = runEnhancedAnalysis;

})(); 