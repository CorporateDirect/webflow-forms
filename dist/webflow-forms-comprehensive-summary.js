/**
 * Webflow Forms - Comprehensive Data Collection & Summary System
 * Collects all form inputs and produces a complete summary that only shows
 * fields the user has actually filled out, handling branching logic properly.
 * @version 1.0.0
 * @author Chris Brummer
 */

(function(window, document) {
    'use strict';

    // Check if we're already initialized
    if (window.WebflowComprehensiveSummary) {
        console.log('📦 Comprehensive Summary already initialized, skipping...');
        return;
    }

    const WebflowComprehensiveSummary = {
        version: '1.0.0',
        formData: new Map(), // Store all form data
        branchingChoices: new Map(), // Track branching decisions
        stepCompletions: new Map(), // Track completed steps
        
        // Initialize the system
        init: function() {
            console.log('🔄 Comprehensive Summary System starting...');
            
            const waitForReadiness = () => {
                const mainLibraryExists = typeof window.WebflowFieldEnhancer !== 'undefined';
                const formExists = document.querySelector('[data-form="multistep"]');
                const stepsVisible = document.querySelectorAll('[data-form="step"]').length > 0;
                
                if (mainLibraryExists && formExists && stepsVisible) {
                    console.log('✅ System ready, initializing comprehensive summary...');
                    setTimeout(() => {
                        this.setup();
                    }, 1000);
                } else {
                    console.log(`⏳ Waiting... Main:${mainLibraryExists} Form:${!!formExists} Steps:${stepsVisible}`);
                    setTimeout(waitForReadiness, 200);
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(waitForReadiness, 1000);
                });
            } else {
                setTimeout(waitForReadiness, 1000);
            }
        },

        // Setup the comprehensive system
        setup: function() {
            console.log('🔄 Setting up comprehensive data collection...');
            
            this.setupFormDataCollection();
            this.setupBranchingTracking();
            this.setupSubmissionHandler();
            this.createSummaryDisplay();
            
            // Expose methods globally for debugging
            window.getFormSummary = () => this.generateComprehensiveSummary();
            window.getFormData = () => this.getAllFormData();
            window.showFormSummary = () => this.displayComprehensiveSummary();
            
            console.log('✅ Comprehensive Summary System ready!');
            console.log('💡 Use window.getFormSummary() to get current form data');
            console.log('💡 Use window.showFormSummary() to display comprehensive summary');
        },

        // Setup form data collection
        setupFormDataCollection: function() {
            const form = document.querySelector('[data-form="multistep"]');
            if (!form) return;

            // Listen for all input changes
            form.addEventListener('input', (event) => {
                this.handleFieldInput(event.target);
            }, { passive: true });

            form.addEventListener('change', (event) => {
                this.handleFieldChange(event.target);
            }, { passive: true });

            // Initial data collection
            this.collectExistingData();
        },

        // Handle field input (real-time updates)
        handleFieldInput: function(field) {
            if (!this.isFormField(field)) return;
            
            const fieldInfo = this.getFieldInfo(field);
            if (fieldInfo) {
                const value = this.getFieldValue(field);
                if (value) { // Only store non-empty values
                    this.storeFieldData(fieldInfo, value, field);
                } else {
                    this.removeFieldData(fieldInfo);
                }
            }
        },

        // Handle field change (selections, etc.)
        handleFieldChange: function(field) {
            if (!this.isFormField(field)) return;
            
            const fieldInfo = this.getFieldInfo(field);
            if (fieldInfo) {
                const value = this.getFieldValue(field);
                if (value) {
                    this.storeFieldData(fieldInfo, value, field);
                    
                    // Track branching decisions
                    if (this.isBranchingField(field)) {
                        this.trackBranchingChoice(fieldInfo, value, field);
                    }
                } else {
                    this.removeFieldData(fieldInfo);
                }
            }
        },

        // Check if field is a form field we should track
        isFormField: function(field) {
            return field.dataset.stepFieldName || 
                   field.dataset.stepField ||
                   (field.name && !field.matches('[data-form="next-btn"], [data-form="back-btn"], [data-form="submit"], button, [type="submit"], [type="button"]'));
        },

        // Get field information
        getFieldInfo: function(field) {
            const fieldName = field.dataset.stepFieldName || field.dataset.stepField || field.name;
            if (!fieldName) return null;

            const stepContainer = field.closest('[data-step-type], [data-form="step"]');
            if (!stepContainer) return null;

            return {
                fieldName,
                stepType: stepContainer.dataset.stepType || 'unknown',
                stepNumber: stepContainer.dataset.stepNumber || '1',
                stepSubtype: stepContainer.dataset.stepSubtype || '',
                stepKey: this.generateStepKey(stepContainer),
                fieldType: field.type || field.tagName.toLowerCase(),
                fieldId: field.id,
                fieldElement: field
            };
        },

        // Generate unique step key
        generateStepKey: function(stepContainer) {
            const stepType = stepContainer.dataset.stepType || 'unknown';
            const stepNumber = stepContainer.dataset.stepNumber || '1';
            const stepSubtype = stepContainer.dataset.stepSubtype || '';
            return `${stepType}-${stepNumber}${stepSubtype ? '-' + stepSubtype : ''}`;
        },

        // Get field value based on field type
        getFieldValue: function(field) {
            if (field.type === 'radio') {
                const checkedRadio = document.querySelector(`input[name="${field.name}"]:checked`);
                return checkedRadio ? checkedRadio.value : '';
            } else if (field.type === 'checkbox') {
                return field.checked ? (field.value || 'Yes') : '';
            } else if (field.tagName.toLowerCase() === 'select') {
                const selectedOption = field.options[field.selectedIndex];
                return selectedOption ? selectedOption.text : '';
            } else {
                return field.value ? field.value.trim() : '';
            }
        },

        // Store field data
        storeFieldData: function(fieldInfo, value, fieldElement) {
            const key = `${fieldInfo.stepKey}::${fieldInfo.fieldName}`;
            
            this.formData.set(key, {
                ...fieldInfo,
                value,
                timestamp: Date.now(),
                displayLabel: this.getFieldLabel(fieldElement)
            });

            // Mark step as touched
            this.stepCompletions.set(fieldInfo.stepKey, 'touched');
            
            console.log(`📝 Stored: ${fieldInfo.fieldName} = "${value}" (${fieldInfo.stepKey})`);
        },

        // Remove field data
        removeFieldData: function(fieldInfo) {
            const key = `${fieldInfo.stepKey}::${fieldInfo.fieldName}`;
            this.formData.delete(key);
            console.log(`🗑️ Removed: ${fieldInfo.fieldName} (${fieldInfo.stepKey})`);
        },

        // Get field label
        getFieldLabel: function(fieldElement) {
            const label = fieldElement.closest('.multi-form_field-wrapper')?.querySelector('label');
            if (label) {
                return label.textContent.replace('*', '').trim();
            }
            
            // Fallback to placeholder or field name
            return fieldElement.placeholder || fieldElement.dataset.stepFieldName || fieldElement.name || 'Unknown Field';
        },

        // Check if field is a branching field
        isBranchingField: function(field) {
            return field.type === 'radio' && (
                field.name.includes('Type') || 
                field.name.includes('Management') ||
                field.value === 'Individual' ||
                field.value === 'Entity' ||
                field.value === 'Trust'
            );
        },

        // Track branching choices
        trackBranchingChoice: function(fieldInfo, value, field) {
            const branchKey = `${fieldInfo.stepKey}::${field.name}`;
            this.branchingChoices.set(branchKey, {
                fieldName: field.name,
                value,
                stepKey: fieldInfo.stepKey,
                timestamp: Date.now()
            });
            console.log(`🌳 Branching choice: ${field.name} = "${value}"`);
        },

        // Collect existing form data
        collectExistingData: function() {
            console.log('📋 Collecting existing form data...');
            
            const allFields = document.querySelectorAll(`
                input[data-step-field-name], 
                select[data-step-field-name], 
                textarea[data-step-field-name],
                input[data-step-field],
                select[data-step-field],
                textarea[data-step-field]
            `);

            let collectedCount = 0;
            allFields.forEach(field => {
                const value = this.getFieldValue(field);
                if (value) {
                    this.handleFieldChange(field);
                    collectedCount++;
                }
            });

            console.log(`📊 Collected ${collectedCount} existing field values`);
        },

        // Setup submission handler
        setupSubmissionHandler: function() {
            const form = document.querySelector('[data-form="multistep"]');
            if (form) {
                form.addEventListener('submit', (event) => {
                    console.log('📤 Form submission detected - generating final summary...');
                    const summary = this.generateComprehensiveSummary();
                    console.log('📊 Final Form Summary:', summary);
                    
                    // Store in hidden field or localStorage for backend processing
                    this.storeFormSummary(summary);
                });
            }
        },

        // Generate comprehensive summary
        generateComprehensiveSummary: function() {
            console.log('📊 Generating comprehensive form summary...');
            
            const summary = {
                metadata: {
                    generatedAt: new Date().toISOString(),
                    totalFields: this.formData.size,
                    totalSteps: this.stepCompletions.size,
                    branchingChoices: Array.from(this.branchingChoices.values())
                },
                sections: {}
            };

            // Group data by sections
            for (const [key, fieldData] of this.formData) {
                const sectionKey = this.getSectionKey(fieldData.stepKey);
                
                if (!summary.sections[sectionKey]) {
                    summary.sections[sectionKey] = {
                        sectionName: this.getSectionName(fieldData.stepKey),
                        stepKey: fieldData.stepKey,
                        fields: {}
                    };
                }

                summary.sections[sectionKey].fields[fieldData.fieldName] = {
                    label: fieldData.displayLabel,
                    value: fieldData.value,
                    fieldType: fieldData.fieldType,
                    timestamp: fieldData.timestamp
                };
            }

            return summary;
        },

        // Get section key for grouping
        getSectionKey: function(stepKey) {
            const parts = stepKey.split('-');
            if (parts.length >= 2) {
                return `${parts[0]}-${parts[1]}`;
            }
            return stepKey;
        },

        // Get human-readable section name
        getSectionName: function(stepKey) {
            const sectionNames = {
                'contact-1': 'Main Contact Information',
                'company-1': 'Holding Company Details',
                'member-1': 'First Member',
                'member-2': 'Second Member',
                'member-3': 'Third Member',
                'member-4': 'Fourth Member',
                'management-1': 'Management Structure',
                'manager-1': 'First Manager',
                'manager-2': 'Second Manager',
                'manager-3': 'Third Manager',
                'manager-4': 'Fourth Manager',
                'child-entity-1': 'First Child Entity',
                'child-entity-2': 'Second Child Entity',
                'child-entity-3': 'Third Child Entity'
            };

            const sectionKey = this.getSectionKey(stepKey);
            return sectionNames[sectionKey] || `Section: ${sectionKey}`;
        },

        // Get all form data
        getAllFormData: function() {
            const data = {};
            for (const [key, fieldData] of this.formData) {
                data[key] = fieldData;
            }
            return data;
        },

        // Store form summary for backend processing
        storeFormSummary: function(summary) {
            try {
                // Store in localStorage
                localStorage.setItem('webflow_form_summary', JSON.stringify(summary));
                
                // Try to store in hidden field if it exists
                const hiddenField = document.querySelector('#form-summary-data');
                if (hiddenField) {
                    hiddenField.value = JSON.stringify(summary);
                }
                
                console.log('💾 Form summary stored successfully');
            } catch (error) {
                console.error('❌ Error storing form summary:', error);
            }
        },

        // Create and display comprehensive summary
        displayComprehensiveSummary: function() {
            const summary = this.generateComprehensiveSummary();
            
            console.log('\n🎯 COMPREHENSIVE FORM SUMMARY');
            console.log('═══════════════════════════════════════════════════════════════');
            console.log(`📅 Generated: ${summary.metadata.generatedAt}`);
            console.log(`📊 Total Fields: ${summary.metadata.totalFields}`);
            console.log(`📝 Total Sections: ${Object.keys(summary.sections).length}`);
            
            if (summary.metadata.branchingChoices.length > 0) {
                console.log('\n🌳 BRANCHING CHOICES:');
                summary.metadata.branchingChoices.forEach(choice => {
                    console.log(`   ${choice.fieldName}: "${choice.value}"`);
                });
            }
            
            console.log('\n📋 FORM DATA BY SECTION:');
            console.log('─────────────────────────────────────────────────────────────────');
            
            for (const [sectionKey, sectionData] of Object.entries(summary.sections)) {
                console.log(`\n📂 ${sectionData.sectionName}`);
                
                for (const [fieldName, fieldData] of Object.entries(sectionData.fields)) {
                    console.log(`   ${fieldData.label}: "${fieldData.value}"`);
                }
            }
            
            console.log('\n═══════════════════════════════════════════════════════════════');
            
            return summary;
        },

        // Create summary display container
        createSummaryDisplay: function() {
            // Create hidden input for form submission
            const form = document.querySelector('[data-form="multistep"]');
            if (form && !document.querySelector('#form-summary-data')) {
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.id = 'form-summary-data';
                hiddenInput.name = 'form-summary-data';
                form.appendChild(hiddenInput);
                console.log('📝 Created hidden summary field for form submission');
            }
        }
    };

    // Initialize the system
    WebflowComprehensiveSummary.init();
    
    // Global reference
    window.WebflowComprehensiveSummary = WebflowComprehensiveSummary;

})(window, document);