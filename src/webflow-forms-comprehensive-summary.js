/**
 * Webflow Forms - NON-INTERFERING Data Collection & Summary System
 * Collects form data WITHOUT interfering with existing validation/flow
 * @version 1.1.0-non-interfering
 * @author Chris Brummer
 */

(function(window, document) {
    'use strict';

    if (window.WebflowComprehensiveSummary) {
        console.log('📦 Summary already initialized, skipping...');
        return;
    }

    const WebflowComprehensiveSummary = {
        version: '1.1.0-non-interfering',
        formData: new Map(),
        
        init: function() {
            console.log('🔄 NON-INTERFERING Summary System starting...');
            
            const waitForMain = () => {
                if (typeof window.WebflowFieldEnhancer !== 'undefined' && 
                    document.querySelector('[data-form="multistep"]')) {
                    setTimeout(() => this.setup(), 3000); // Wait 3 seconds for main lib
                } else {
                    setTimeout(waitForMain, 1000);
                }
            };
            waitForMain();
        },

        setup: function() {
            console.log('✅ Setting up PASSIVE data collection...');
            
            // Initialize branching tracking (was missing)
            this.setupBranchingTracking();
            
            // Only use periodic scanning to avoid event conflicts
            setInterval(() => this.scanFormData(), 2000);
            
            // Expose global methods
            window.getFormSummary = () => this.generateSummary();
            window.showFormSummary = () => this.displaySummary();
            
            console.log('✅ NON-INTERFERING Summary ready!');
        },

        setupBranchingTracking: function() {
            console.log('🌳 Setting up branching tracking...');
            // This method was referenced but missing - adding empty implementation for now
            // to prevent the error while maintaining non-interfering design
        },

        scanFormData: function() {
            try {
                const fields = document.querySelectorAll(`
                    input[data-step-field-name]:not([type="button"]):not([type="submit"]), 
                    select[data-step-field-name], 
                    textarea[data-step-field-name]
                `);

                fields.forEach(field => {
                    const fieldName = field.dataset.stepFieldName;
                    const value = this.getFieldValue(field);
                    
                    if (fieldName && value && value.trim() !== '') {
                        const stepContainer = field.closest('[data-step-type]');
                        if (stepContainer) {
                            const stepKey = stepContainer.dataset.stepType + '-' + 
                                          (stepContainer.dataset.stepNumber || '1');
                            
                            this.formData.set(`${stepKey}::${fieldName}`, {
                                fieldName,
                                value,
                                stepKey,
                                label: this.getLabel(field),
                                timestamp: Date.now()
                            });
                        }
                    }
                });
            } catch (error) {
                // Silent error handling
            }
        },

        getFieldValue: function(field) {
            try {
                if (field.type === 'radio') {
                    const checked = document.querySelector(`input[name="${field.name}"]:checked`);
                    return checked ? checked.value : '';
                } else if (field.type === 'checkbox') {
                    return field.checked ? (field.value || 'Yes') : '';
                } else if (field.tagName.toLowerCase() === 'select') {
                    return field.options[field.selectedIndex]?.text || '';
                } else {
                    return field.value || '';
                }
            } catch (error) {
                return '';
            }
        },

        getLabel: function(field) {
            try {
                const label = field.closest('.multi-form_field-wrapper')?.querySelector('label');
                return label ? label.textContent.replace('*', '').trim() : field.name || 'Field';
            } catch (error) {
                return 'Field';
            }
        },

        generateSummary: function() {
            const summary = {
                metadata: {
                    generatedAt: new Date().toISOString(),
                    totalFields: this.formData.size
                },
                sections: {}
            };

            for (const [key, fieldData] of this.formData) {
                const sectionKey = fieldData.stepKey;
                
                if (!summary.sections[sectionKey]) {
                    summary.sections[sectionKey] = {
                        sectionName: this.getSectionName(sectionKey),
                        fields: {}
                    };
                }

                summary.sections[sectionKey].fields[fieldData.fieldName] = {
                    label: fieldData.label,
                    value: fieldData.value,
                    timestamp: fieldData.timestamp
                };
            }

            return summary;
        },

        getSectionName: function(stepKey) {
            const names = {
                'contact-1': 'Main Contact Information',
                'company-1': 'Holding Company Details',
                'member-1': 'First Member',
                'member-2': 'Second Member',
                'member-3': 'Third Member',
                'management-1': 'Management Structure',
                'manager-1': 'First Manager',
                'manager-2': 'Second Manager',
                'child-entity-1': 'First Child Entity',
                'child-entity-2': 'Second Child Entity'
            };
            return names[stepKey] || stepKey;
        },

        displaySummary: function() {
            const summary = this.generateSummary();
            
            console.log('\n🎯 COMPREHENSIVE FORM SUMMARY');
            console.log('═══════════════════════════════════════════');
            console.log(`📅 Generated: ${summary.metadata.generatedAt}`);
            console.log(`📊 Total Fields: ${summary.metadata.totalFields}`);
            
            console.log('\n📋 FORM DATA BY SECTION:');
            console.log('───────────────────────────────────────────');
            
            for (const [sectionKey, sectionData] of Object.entries(summary.sections)) {
                console.log(`\n📂 ${sectionData.sectionName}`);
                
                for (const [fieldName, fieldData] of Object.entries(sectionData.fields)) {
                    console.log(`   ${fieldData.label}: "${fieldData.value}"`);
                }
            }
            
            console.log('\n═══════════════════════════════════════════');
            return summary;
        }
    };

    // Initialize
    WebflowComprehensiveSummary.init();
    window.WebflowComprehensiveSummary = WebflowComprehensiveSummary;

})(window, document);
