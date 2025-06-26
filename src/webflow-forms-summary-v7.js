/**
 * Webflow Forms - Summary Card Extension V7 (No Placeholders)
 * Clean implementation with no placeholder text and proper visibility control
 * @version 1.0.7
 * @author Chris Brummer
 */

(function(window, document) {
    'use strict';

    // Prevent duplicate initialization
    if (window.WebflowSummaryV7Loaded) {
        console.log('📦 Summary V7 already loaded, skipping...');
        return;
    }
    window.WebflowSummaryV7Loaded = true;

    const WebflowSummaryCards = {
        version: '1.0.7-no-placeholders',
        mainLibraryReady: false,
        stepStates: new Map(),
        
        init: function() {
            console.log('🔄 Summary Cards V7 (No Placeholders) starting...');
            
            const waitForReadiness = () => {
                const mainLibraryExists = typeof window.WebflowFieldEnhancer !== 'undefined';
                const formExists = document.querySelector('[data-form="multistep"]');
                
                if (mainLibraryExists && formExists) {
                    console.log('✅ Ready - initializing V7...');
                    this.mainLibraryReady = true;
                    setTimeout(() => this.setup(), 1000);
                } else {
                    setTimeout(waitForReadiness, 200);
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', waitForReadiness);
            } else {
                waitForReadiness();
            }
        },

        setup: function() {
            this.hideAllSummaryCards();
            this.setupEventListeners();
            console.log('✅ V7 Summary Cards initialized');
        },

        hideAllSummaryCards: function() {
            const cards = document.querySelectorAll('[data-summary-type]');
            cards.forEach(card => card.style.display = 'none');
            console.log(`🙈 Hidden ${cards.length} summary cards`);
        },

        setupEventListeners: function() {
            // Single event delegation to prevent duplicates
            document.addEventListener('input', (e) => {
                if (this.shouldHandle(e.target)) {
                    this.handleFieldChange(e.target);
                }
            }, { passive: true });

            document.addEventListener('change', (e) => {
                if (this.shouldHandle(e.target)) {
                    this.handleFieldChange(e.target);
                }
            }, { passive: true });

            // Next button clicks
            document.addEventListener('click', (e) => {
                if (e.target.matches('[data-form="next-btn"]')) {
                    setTimeout(() => this.checkStepCompletion(), 100);
                }
            });
        },

        shouldHandle: function(field) {
            return field.dataset.stepFieldName && 
                   !field.matches('button, [type="button"], [type="submit"]');
        },

        handleFieldChange: function(field) {
            const fieldName = field.dataset.stepFieldName;
            const value = this.getFieldValue(field);

            // Handle phone specially
            if (fieldName === 'phone' || fieldName === 'countryCode') {
                this.updatePhoneSummary(field);
                return;
            }

            // Update regular fields
            this.updateFieldSummary(field, fieldName, value);
        },

        getFieldValue: function(field) {
            if (field.type === 'radio') {
                const checked = document.querySelector(`input[name="${field.name}"]:checked`);
                return checked ? checked.value : '';
            }
            if (field.type === 'checkbox') {
                return field.checked ? (field.value || 'Yes') : '';
            }
            if (field.tagName === 'SELECT') {
                return field.selectedIndex > 0 ? field.options[field.selectedIndex].text : '';
            }
            return field.value || '';
        },

        updatePhoneSummary: function(field) {
            const container = field.closest('[data-step-type]');
            if (!container) return;

            const phoneField = container.querySelector('[data-step-field-name="phone"]');
            const countryField = container.querySelector('[data-step-field-name="countryCode"]');
            
            if (!phoneField || !countryField) return;

            const phoneValue = phoneField.value || '';
            const countryValue = countryField.value || '';

            // NO PLACEHOLDERS - empty stays empty
            const formatted = this.formatPhone(phoneValue, countryValue);
            
            this.updateFieldSummary(phoneField, 'phone', formatted);
            
            if (formatted) {
                console.log(`📞 Phone updated: "${formatted}"`);
            }
        },

        formatPhone: function(phone, country) {
            if (!phone || phone.trim() === '') return ''; // NO PLACEHOLDERS
            
            // Clean country code (remove emoji)
            let cleanCode = '+1';
            if (country) {
                const match = country.match(/\+\d+/);
                if (match) cleanCode = match[0];
            }
            
            const cleaned = phone.replace(/\D/g, '');
            if (cleanCode === '+1' && cleaned.length === 10) {
                return `+1 (${cleaned.substr(0,3)}) ${cleaned.substr(3,3)}-${cleaned.substr(6,4)}`;
            }
            
            return `${cleanCode} ${phone}`;
        },

        updateFieldSummary: function(field, fieldName, value) {
            const summaryElements = this.findSummaryElements(field, fieldName);
            
            summaryElements.forEach(element => {
                element.textContent = value || ''; // NO PLACEHOLDERS
            });

            if (summaryElements.length > 0 && value) {
                console.log(`📊 Updated ${fieldName}: "${value}"`);
            }
        },

        findSummaryElements: function(field, fieldName) {
            const container = field.closest('[data-step-type]');
            if (!container) return [];

            const stepType = container.dataset.stepType;
            const stepNumber = container.dataset.stepNumber || '1';
            const stepSubtype = container.dataset.stepSubtype || '';

            // Find matching summary containers
            let summaryContainers = document.querySelectorAll(
                `[data-summary-type="${stepType}"][data-summary-number="${stepNumber}"]`
            );

            const elements = [];
            summaryContainers.forEach(container => {
                let field = container.querySelector(`[data-summary-field="${fieldName}"]`);
                
                // Handle taxCollection -> taxClassification
                if (!field && fieldName === 'taxCollection') {
                    field = container.querySelector(`[data-summary-field="taxClassification"]`);
                }
                
                if (field) elements.push(field);
            });

            return elements;
        },

        checkStepCompletion: function() {
            // Show summary cards only for steps with actual content
            const summaryCards = document.querySelectorAll('[data-summary-type]');
            summaryCards.forEach(card => {
                const fields = card.querySelectorAll('[data-summary-field]');
                let hasContent = false;
                
                fields.forEach(field => {
                    if (field.textContent && field.textContent.trim() !== '') {
                        hasContent = true;
                    }
                });
                
                if (hasContent) {
                    card.style.display = 'block';
                    console.log(`👁️ Showing summary card with content`);
                }
            });
        }
    };

    console.log('📦 Loading Summary Cards V7 (No Placeholders)');
    WebflowSummaryCards.init();
    window.WebflowSummaryV7 = WebflowSummaryCards;

})(window, document);
