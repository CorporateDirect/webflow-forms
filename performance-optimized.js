/**
 * Performance-Optimized Webflow Forms
 * Addresses major efficiency issues found in the original codebase
 * @version 2.1.0
 */

import { AsYouType, parsePhoneNumber, getCountries, getCountryCallingCode } from 'libphonenumber-js';

class WebflowFormsOptimized {
    constructor() {
        this.config = {
            autoInit: true,
            enhancedClass: 'wf-field-enhanced',
            focusClass: 'wf-field-focus',
            typingClass: 'wf-field-typing',
            debug: false // Toggle for production
        };

        // Centralized caching system
        this.cache = {
            // DOM element caches
            forms: new Map(),
            fields: new Map(),
            steps: new Map(),
            
            // Data caches
            countryData: null,
            phoneFormats: new Map(),
            
            // Query caches (avoid repeated DOM queries)
            queryCache: new Map(),
            
            // Event listener tracking
            listeners: new Map()
        };

        // Performance optimizations
        this.debounceTimers = new Map();
        this.observers = new Map();
        
        if (this.config.autoInit) {
            this.init();
        }
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeAfterDOM());
        } else {
            this.initializeAfterDOM();
        }
    }

    initializeAfterDOM() {
        // Single DOM scan instead of multiple queries
        this.scanDOM();
        
        // Set up performance monitoring
        this.setupPerformanceMonitoring();
        
        // Initialize cached elements
        this.initializeCachedElements();
        
        // Setup mutation observer for dynamic content
        this.setupDynamicContentObserver();
        
        this.log('WebflowFormsOptimized initialized');
    }

    // ==========================================
    // PERFORMANCE OPTIMIZATION METHODS
    // ==========================================

    // Single DOM scan to cache all elements
    scanDOM() {
        const startTime = performance.now();
        
        // Single query for all forms and their elements
        const allForms = document.querySelectorAll('form');
        const allInputs = document.querySelectorAll('input, select, textarea');
        const allSteps = document.querySelectorAll('[data-form="step"], [data-step], .form-step');
        
        // Cache forms
        allForms.forEach(form => {
            const formId = form.id || this.generateId('form');
            this.cache.forms.set(formId, {
                element: form,
                fields: Array.from(form.querySelectorAll('input, select, textarea')),
                steps: Array.from(form.querySelectorAll('[data-form="step"], [data-step]')),
                buttons: Array.from(form.querySelectorAll('[data-form="next-btn"], [data-form="prev-btn"], [data-form="submit-btn"]'))
            });
        });

        // Cache individual fields with their enhancements
        allInputs.forEach(field => {
            const fieldId = field.id || field.name || this.generateId('field');
            this.cache.fields.set(fieldId, {
                element: field,
                enhancements: this.detectEnhancements(field),
                form: field.closest('form')
            });
        });

        // Cache steps
        allSteps.forEach(step => {
            const stepId = step.dataset.step || this.generateId('step');
            this.cache.steps.set(stepId, step);
        });

        const endTime = performance.now();
        this.log(`DOM scan completed in ${(endTime - startTime).toFixed(2)}ms`);
        this.log(`Cached: ${this.cache.forms.size} forms, ${this.cache.fields.size} fields, ${this.cache.steps.size} steps`);
    }

    // Detect what enhancements a field needs
    detectEnhancements(field) {
        const enhancements = new Set();
        
        // Check data attributes efficiently
        const dataset = field.dataset;
        
        if (dataset.phoneFormat !== undefined) enhancements.add('phone');
        if (dataset.countryCode !== undefined) enhancements.add('country');
        if (dataset.googlePlaces !== undefined) enhancements.add('places');
        if (dataset.addressComponent !== undefined) enhancements.add('address');
        if (field.hasAttribute('required')) enhancements.add('validation');
        
        return enhancements;
    }

    // Cached query system to avoid repeated DOM queries
    cachedQuery(selector, context = document) {
        const cacheKey = `${selector}:${context === document ? 'document' : context.id || 'unknown'}`;
        
        if (!this.cache.queryCache.has(cacheKey)) {
            const elements = Array.from(context.querySelectorAll(selector));
            this.cache.queryCache.set(cacheKey, elements);
        }
        
        return this.cache.queryCache.get(cacheKey);
    }

    // Debounced function execution
    debounce(key, func, delay = 300) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        const timer = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, delay);
        
        this.debounceTimers.set(key, timer);
    }

    // ==========================================
    // OPTIMIZED INITIALIZATION METHODS
    // ==========================================

    initializeCachedElements() {
        // Initialize forms
        this.cache.forms.forEach((formData, formId) => {
            this.initializeForm(formData);
        });

        // Initialize fields in batches to avoid blocking
        this.batchInitializeFields();
    }

    // Process fields in batches to avoid blocking the main thread
    batchInitializeFields() {
        const fields = Array.from(this.cache.fields.values());
        const batchSize = 10;
        let index = 0;

        const processBatch = () => {
            const batch = fields.slice(index, index + batchSize);
            
            batch.forEach(fieldData => {
                this.initializeField(fieldData);
            });

            index += batchSize;

            if (index < fields.length) {
                // Use requestAnimationFrame for smooth processing
                requestAnimationFrame(processBatch);
            } else {
                this.log(`Initialized ${fields.length} fields in batches`);
            }
        };

        processBatch();
    }

    generateId(prefix = 'wf') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    log(...args) {
        if (this.config.debug) {
            console.log('[WebflowFormsOptimized]', ...args);
        }
    }

    // Setup mutation observer for dynamic content
    setupDynamicContentObserver() {
        if (typeof MutationObserver === 'undefined') return;
        
        const observer = new MutationObserver((mutations) => {
            const addedElements = [];
            
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        addedElements.push(node);
                    }
                });
            });
            
            if (addedElements.length > 0) {
                this.debounce('dom-changes', () => {
                    this.handleDynamicContent(addedElements);
                }, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.observers.set('dynamic-content', observer);
    }

    setupPerformanceMonitoring() {
        if (!this.config.debug) return;
        
        // Monitor long tasks
        if (typeof PerformanceObserver !== 'undefined') {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        this.log(`Long task detected: ${entry.duration.toFixed(2)}ms`);
                    }
                }
            });
            observer.observe({ entryTypes: ['longtask'] });
        }
    }
}

// Export for use
window.WebflowFormsOptimized = WebflowFormsOptimized;

export default WebflowFormsOptimized; 