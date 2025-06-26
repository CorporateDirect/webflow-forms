/**
 * Webflow Forms - Summary Card Debug Analysis
 * @version DEBUG-1.0
 */
(function(){
    console.log("🔍 DEBUG ANALYSIS - Form Inputs & Summary Outputs");
    
    function getFieldValue(field) {
        if (field.type === "radio") {
            const checkedRadio = document.querySelector(`input[name="${field.name}"]:checked`);
            return checkedRadio ? checkedRadio.value : "";
        } else if (field.type === "checkbox") {
            return field.checked ? (field.value || "Yes") : "";
        } else if (field.tagName.toLowerCase() === "select") {
            const selectedOption = field.options[field.selectedIndex];
            return selectedOption ? selectedOption.text : "";
        } else {
            return field.value || "";
        }
    }

    function analyzeAllInputs() {
        console.log("🔍 ANALYZING ALL FORM INPUTS:");
        const allInputs = document.querySelectorAll(`
            input[data-step-field-name], select[data-step-field-name], textarea[data-step-field-name],
            input[data-step-field], select[data-step-field], textarea[data-step-field]
        `);
        
        console.log(`📊 TOTAL FORM INPUTS FOUND: ${allInputs.length}`);
        
        Array.from(allInputs).forEach((input, index) => {
            const stepContainer = input.closest("[data-step-type]");
            const fieldName = input.dataset.stepFieldName || input.dataset.stepField;
            
            console.log(`📝 INPUT ${index + 1}:`, {
                fieldName: fieldName,
                type: input.type || input.tagName.toLowerCase(),
                name: input.name,
                currentValue: getFieldValue(input),
                stepType: stepContainer?.dataset.stepType,
                stepNumber: stepContainer?.dataset.stepNumber,
                stepSubtype: stepContainer?.dataset.stepSubtype
            });
        });
    }

    function analyzeSummaryOutputs() {
        console.log("🔍 ANALYZING ALL SUMMARY OUTPUTS:");
        const allSummaryFields = document.querySelectorAll("[data-summary-field]");
        
        console.log(`📊 TOTAL SUMMARY OUTPUTS FOUND: ${allSummaryFields.length}`);
        
        Array.from(allSummaryFields).forEach((output, index) => {
            const summaryContainer = output.closest("[data-summary-type]");
            const fieldName = output.dataset.summaryField;
            
            console.log(`📋 OUTPUT ${index + 1}:`, {
                fieldName: fieldName,
                currentText: output.textContent?.trim(),
                summaryType: summaryContainer?.dataset.summaryType,
                summaryNumber: summaryContainer?.dataset.summaryNumber,
                summarySubtype: summaryContainer?.dataset.summarySubtype
            });
        });
    }

    function analyzeEntitySelections() {
        console.log("🔍 ANALYZING ENTITY SELECTIONS:");
        const entityFields = document.querySelectorAll(`
            [data-step-field-name*="Type"], [data-step-field-name*="type"],
            input[name*="member"], input[name*="entity"], input[name*="management"],
            input[value="Individual"], input[value="Entity"]
        `);
        
        console.log(`📊 ENTITY-RELATED FIELDS FOUND: ${entityFields.length}`);
        
        Array.from(entityFields).forEach((field, index) => {
            const fieldName = field.dataset.stepFieldName || field.dataset.stepField;
            const stepContainer = field.closest("[data-step-type]");
            
            console.log(`🏢 ENTITY FIELD ${index + 1}:`, {
                fieldName: fieldName,
                name: field.name,
                type: field.type,
                value: field.value,
                currentValue: getFieldValue(field),
                checked: field.checked,
                stepType: stepContainer?.dataset.stepType,
                stepNumber: stepContainer?.dataset.stepNumber,
                stepSubtype: stepContainer?.dataset.stepSubtype
            });
        });
    }

    function analyzeChildEntities() {
        console.log("🔍 ANALYZING CHILD ENTITIES:");
        
        const childEntityContainers = document.querySelectorAll("[data-step-type=\"child-entity\"]");
        console.log(`📊 CHILD ENTITY FORM CONTAINERS: ${childEntityContainers.length}`);
        
        Array.from(childEntityContainers).forEach((container, index) => {
            console.log(`👶 CHILD ENTITY FORM ${index + 1}:`, {
                stepType: container.dataset.stepType,
                stepNumber: container.dataset.stepNumber,
                stepSubtype: container.dataset.stepSubtype
            });
            
            const childFields = container.querySelectorAll("[data-step-field-name], [data-step-field]");
            console.log(`   └─ Fields in container: ${childFields.length}`);
            
            Array.from(childFields).forEach((field, fieldIndex) => {
                const fieldName = field.dataset.stepFieldName || field.dataset.stepField;
                console.log(`      └─ Field ${fieldIndex + 1}: ${fieldName} = "${getFieldValue(field)}"`);
            });
        });
        
        const childSummaryContainers = document.querySelectorAll("[data-summary-type=\"child-entity\"]");
        console.log(`📊 CHILD ENTITY SUMMARY CONTAINERS: ${childSummaryContainers.length}`);
        
        Array.from(childSummaryContainers).forEach((container, index) => {
            console.log(`👶 CHILD ENTITY SUMMARY ${index + 1}:`, {
                summaryType: container.dataset.summaryType,
                summaryNumber: container.dataset.summaryNumber,
                summarySubtype: container.dataset.summarySubtype
            });
        });
    }

    function runFullAnalysis() {
        const form = document.querySelector("[data-form=\"multistep\"]");
        if (!form) {
            console.log("⏳ Waiting for form to load...");
            setTimeout(runFullAnalysis, 1000);
            return;
        }

        analyzeAllInputs();
        analyzeSummaryOutputs();
        analyzeEntitySelections();
        analyzeChildEntities();
        
        console.log("🔍 DEBUG ANALYSIS COMPLETE");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            setTimeout(runFullAnalysis, 2000);
        });
    } else {
        setTimeout(runFullAnalysis, 2000);
    }

    window.WebflowDebugAnalysis = { runFullAnalysis };
})();
