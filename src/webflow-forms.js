/**
 * Webflow Field Enhancer - Advanced field behaviors for Webflow forms
 * Provides functionality beyond default Webflow form behavior
 * Works alongside Webflow's native form functionality and Formly for submission
 * @version 1.1.0
 * @author Chris Brummer
 * @license MIT
 */

(function(window, document) {
    'use strict';

    // Main WebflowFieldEnhancer object
    const WebflowFieldEnhancer = {
        version: '1.1.0',
        
        // Configuration options
        config: {
            autoInit: true,
            enhancedClass: 'wf-field-enhanced',
            focusClass: 'wf-field-focus',
            typingClass: 'wf-field-typing'
        },

        // Initialize the library
        init: function(options = {}) {
            this.config = { ...this.config, ...options };
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupFields());
            } else {
                this.setupFields();
            }
        },

        // Setup all form fields on the page
        setupFields: function() {
            // Target all input fields in forms that have enhancement data attributes
            const fields = document.querySelectorAll('form[data-name] input, form[data-name] textarea, form[data-name] select');
            fields.forEach(field => this.enhanceField(field));
        },

        // Enhance individual field
        enhanceField: function(field) {
            const form = field.closest('form');
            
            // Check if form or field should be skipped
            if (form && form.dataset.webflowFieldsDisable === 'true') {
                return;
            }
            if (field.dataset.webflowFieldsDisable === 'true') {
                return;
            }

            // Only enhance fields that have specific enhancement attributes
            const hasEnhancements = this.fieldHasEnhancements(field);
            if (!hasEnhancements) {
                return;
            }

            // Mark as enhanced
            field.classList.add(this.config.enhancedClass);
            
            // Add enhanced interactions (beyond Webflow's default)
            this.addEnhancedInteractions(field);
            
            // Add custom behaviors that Webflow doesn't provide
            this.addCustomBehaviors(field);
        },

        // Check if field has any enhancement data attributes
        fieldHasEnhancements: function(field) {
            const enhancementAttributes = [
                'format', 'characterCounter', 'autoResize', 'showsField', 'hidesField',
                'customValidation', 'inputMask', 'autoComplete', 'fieldSync'
            ];
            
            return enhancementAttributes.some(attr => 
                field.dataset[attr] !== undefined
            );
        },

        // Add enhanced interactions beyond Webflow's default focus/blur
        addEnhancedInteractions: function(field) {
            // Enhanced focus state with custom class
            field.addEventListener('focus', () => {
                field.classList.add(this.config.focusClass);
                this.triggerCustomEvent(field, 'enhancedFocus');
            });
            
            field.addEventListener('blur', () => {
                field.classList.remove(this.config.focusClass);
                field.classList.remove(this.config.typingClass);
                this.triggerCustomEvent(field, 'enhancedBlur');
            });
            
            // Typing indicator (useful for live validation feedback)
            let typingTimer;
            field.addEventListener('input', () => {
                field.classList.add(this.config.typingClass);
                
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    field.classList.remove(this.config.typingClass);
                    this.triggerCustomEvent(field, 'typingStop');
                }, 500);
                
                this.triggerCustomEvent(field, 'enhancedInput');
                
                // Update character counter if present
                this.updateCharacterCount(field);
                
                // Handle field syncing if configured
                this.handleFieldSync(field);
            });
        },

        // Add custom behaviors that Webflow doesn't provide natively
        addCustomBehaviors: function(field) {
            // Input formatting (phone, currency, etc.)
            if (field.dataset.format) {
                this.setupInputFormatting(field);
            }
            
            // Character counter
            if (field.dataset.characterCounter === 'true') {
                this.setupCharacterCounter(field);
            }
            
            // Auto-resize textareas
            if (field.tagName === 'TEXTAREA' && field.dataset.autoResize === 'true') {
                this.setupAutoResize(field);
            }
            
            // Conditional fields (show/hide based on other fields)
            if (field.dataset.showsField || field.dataset.hidesField) {
                this.setupConditionalFields(field);
            }
            
            // Custom validation beyond Webflow's basic validation
            if (field.dataset.customValidation) {
                this.setupCustomValidation(field);
            }
            
            // Input masking
            if (field.dataset.inputMask) {
                this.setupInputMask(field);
            }
            
            // Auto-complete enhancements
            if (field.dataset.autoComplete) {
                this.setupAutoComplete(field);
            }
        },

        // Setup input formatting (beyond what Webflow provides)
        setupInputFormatting: function(field) {
            const format = field.dataset.format;
            
            if (format === 'phone-us') {
                field.addEventListener('input', () => {
                    let value = field.value.replace(/\D/g, '');
                    if (value.length >= 6) {
                        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                    } else if (value.length >= 3) {
                        value = value.replace(/(\d{3})(\d{3})/, '($1) $2');
                    }
                    if (field.value !== value) {
                        field.value = value;
                        this.triggerCustomEvent(field, 'formatted', { format: 'phone-us' });
                    }
                });
            } else if (format === 'currency') {
                field.addEventListener('input', () => {
                    let value = field.value.replace(/[^\d.]/g, '');
                    const parts = value.split('.');
                    if (parts.length > 2) {
                        value = parts[0] + '.' + parts.slice(1).join('');
                    }
                    if (parts[1] && parts[1].length > 2) {
                        value = parts[0] + '.' + parts[1].substring(0, 2);
                    }
                    const formattedValue = value ? '$' + value : '';
                    if (field.value !== formattedValue) {
                        field.value = formattedValue;
                        this.triggerCustomEvent(field, 'formatted', { format: 'currency' });
                    }
                });
            } else if (format === 'credit-card') {
                field.addEventListener('input', () => {
                    let value = field.value.replace(/\D/g, '');
                    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                    if (field.value !== value) {
                        field.value = value;
                        this.triggerCustomEvent(field, 'formatted', { format: 'credit-card' });
                    }
                });
            }
        },

        // Setup character counter (Webflow doesn't provide this)
        setupCharacterCounter: function(field) {
            const maxLength = field.getAttribute('maxlength') || field.dataset.maxLength;
            if (!maxLength) return;
            
            const counterElement = document.createElement('div');
            counterElement.className = 'wf-character-counter';
            
            // Insert counter based on position preference
            const position = field.dataset.counterPosition || 'after';
            const container = field.parentNode;
            
            if (position === 'before') {
                container.insertBefore(counterElement, field);
            } else {
                container.appendChild(counterElement);
            }
            
            const updateCounter = () => {
                const remaining = maxLength - field.value.length;
                const percentage = (field.value.length / maxLength) * 100;
                
                counterElement.textContent = field.dataset.counterFormat 
                    ? field.dataset.counterFormat.replace('{remaining}', remaining).replace('{current}', field.value.length).replace('{max}', maxLength)
                    : `${remaining} characters remaining`;
                
                // Add warning classes based on percentage
                counterElement.className = 'wf-character-counter';
                if (percentage > 90) {
                    counterElement.classList.add('wf-counter-danger');
                } else if (percentage > 75) {
                    counterElement.classList.add('wf-counter-warning');
                }
                
                this.triggerCustomEvent(field, 'characterCount', { remaining, current: field.value.length, max: maxLength });
            };
            
            field.addEventListener('input', updateCounter);
            updateCounter();
        },

        // Update character count
        updateCharacterCount: function(field) {
            const counter = field.parentNode.querySelector('.wf-character-counter');
            if (counter) {
                const maxLength = field.getAttribute('maxlength') || field.dataset.maxLength;
                if (maxLength) {
                    const remaining = maxLength - field.value.length;
                    counter.textContent = field.dataset.counterFormat 
                        ? field.dataset.counterFormat.replace('{remaining}', remaining).replace('{current}', field.value.length).replace('{max}', maxLength)
                        : `${remaining} characters remaining`;
                }
            }
        },

        // Setup auto-resize for textareas (Webflow doesn't provide this)
        setupAutoResize: function(textarea) {
            const minHeight = textarea.dataset.minHeight || textarea.offsetHeight;
            const maxHeight = textarea.dataset.maxHeight || null;
            
            const resize = () => {
                textarea.style.height = 'auto';
                let newHeight = textarea.scrollHeight;
                
                if (maxHeight && newHeight > parseInt(maxHeight)) {
                    newHeight = parseInt(maxHeight);
                    textarea.style.overflowY = 'scroll';
                } else {
                    textarea.style.overflowY = 'hidden';
                }
                
                if (newHeight < parseInt(minHeight)) {
                    newHeight = parseInt(minHeight);
                }
                
                textarea.style.height = newHeight + 'px';
                this.triggerCustomEvent(textarea, 'resized', { height: newHeight });
            };
            
            textarea.addEventListener('input', resize);
            textarea.addEventListener('focus', resize);
            
            // Initial resize
            setTimeout(resize, 0);
        },

        // Setup conditional fields (show/hide based on other field values)
        setupConditionalFields: function(field) {
            const showsField = field.dataset.showsField;
            const hidesField = field.dataset.hidesField;
            const triggerValue = field.dataset.triggerValue;
            const triggerValues = field.dataset.triggerValues ? field.dataset.triggerValues.split(',') : null;
            
            const handleConditional = () => {
                let shouldTrigger = false;
                
                if (triggerValues) {
                    shouldTrigger = triggerValues.includes(field.value);
                } else if (triggerValue) {
                    shouldTrigger = field.value === triggerValue;
                } else {
                    shouldTrigger = !!field.value;
                }
                
                if (showsField) {
                    const targetFields = document.querySelectorAll(showsField);
                    targetFields.forEach(targetField => {
                        const container = targetField.closest('.w-form-formdata') || targetField.parentNode;
                        container.style.display = shouldTrigger ? '' : 'none';
                        this.triggerCustomEvent(field, 'conditionalChange', { 
                            action: 'show', 
                            target: showsField, 
                            visible: shouldTrigger 
                        });
                    });
                }
                
                if (hidesField) {
                    const targetFields = document.querySelectorAll(hidesField);
                    targetFields.forEach(targetField => {
                        const container = targetField.closest('.w-form-formdata') || targetField.parentNode;
                        container.style.display = shouldTrigger ? 'none' : '';
                        this.triggerCustomEvent(field, 'conditionalChange', { 
                            action: 'hide', 
                            target: hidesField, 
                            visible: !shouldTrigger 
                        });
                    });
                }
            };
            
            field.addEventListener('change', handleConditional);
            field.addEventListener('input', handleConditional);
            
            // Initial check
            setTimeout(handleConditional, 0);
        },

        // Setup custom validation beyond Webflow's basic validation
        setupCustomValidation: function(field) {
            const validationRule = field.dataset.customValidation;
            const validationMessage = field.dataset.validationMessage || 'Invalid input';
            
            const validate = () => {
                if (!field.value) return true; // Let Webflow handle required validation
                
                const regex = new RegExp(validationRule);
                const isValid = regex.test(field.value);
                
                // Use Webflow's validation classes or create custom feedback
                if (isValid) {
                    field.setCustomValidity('');
                    this.triggerCustomEvent(field, 'customValidationPass');
                } else {
                    field.setCustomValidity(validationMessage);
                    this.triggerCustomEvent(field, 'customValidationFail', { message: validationMessage });
                }
                
                return isValid;
            };
            
            field.addEventListener('blur', validate);
            field.addEventListener('input', () => {
                if (field.dataset.validateOnInput === 'true') {
                    validate();
                }
            });
        },

        // Setup input masking
        setupInputMask: function(field) {
            const mask = field.dataset.inputMask;
            // Simple mask implementation - can be extended
            field.addEventListener('input', () => {
                // Implement masking logic based on mask pattern
                this.triggerCustomEvent(field, 'masked', { mask });
            });
        },

        // Setup auto-complete enhancements
        setupAutoComplete: function(field) {
            const autoCompleteType = field.dataset.autoComplete;
            // Enhanced autocomplete beyond browser defaults
            this.triggerCustomEvent(field, 'autoCompleteSetup', { type: autoCompleteType });
        },

        // Handle field syncing (sync values between fields)
        handleFieldSync: function(field) {
            const syncTarget = field.dataset.fieldSync;
            if (syncTarget) {
                const targetField = document.querySelector(syncTarget);
                if (targetField) {
                    const syncType = field.dataset.syncType || 'copy';
                    
                    if (syncType === 'copy') {
                        targetField.value = field.value;
                    } else if (syncType === 'uppercase') {
                        targetField.value = field.value.toUpperCase();
                    } else if (syncType === 'lowercase') {
                        targetField.value = field.value.toLowerCase();
                    }
                    
                    this.triggerCustomEvent(field, 'fieldSynced', { target: syncTarget, type: syncType });
                }
            }
        },

        // Trigger custom events
        triggerCustomEvent: function(field, eventName, detail = {}) {
            const event = new CustomEvent(`webflowField:${eventName}`, {
                detail: { field, ...detail },
                bubbles: true
            });
            field.dispatchEvent(event);
        },

        // Public method to refresh enhancements (useful for dynamic content)
        refresh: function() {
            this.setupFields();
        },

        // Public method to enhance a specific field
        enhanceSpecificField: function(field) {
            this.enhanceField(field);
        }
    };

    // Auto-initialize if config allows
    if (WebflowFieldEnhancer.config.autoInit) {
        WebflowFieldEnhancer.init();
    }

    // Export to global scope
    window.WebflowFieldEnhancer = WebflowFieldEnhancer;
    
    // Keep backward compatibility
    window.WebflowForms = WebflowFieldEnhancer;

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = WebflowFieldEnhancer;
    }

})(window, document); 