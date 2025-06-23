// Import libphonenumber for dynamic phone formatting and country data
import { AsYouType, getExampleNumber, parsePhoneNumber, getCountries, getCountryCallingCode } from 'libphonenumber-js';

const WebflowFieldEnhancer = {
    version: '1.2.0',
    
    config: {
        autoInit: true,
        enhancedClass: 'wf-field-enhanced',
        focusClass: 'wf-field-focus',
        typingClass: 'wf-field-typing',
        branchingEnabled: true
    },

    // Cache for country data and phone formatting
    countryDataCache: null,
    phoneFormatCache: new Map(),
    
    // Branching logic state management
    branchingState: {
        currentStep: null,
        stepHistory: [],
        conditionalSteps: new Map(),
        branchingRules: new Map()
    },

    // Clear all caches
    clearCaches: function() {
        this.countryDataCache = null;
        this.phoneFormatCache.clear();
        this.branchingState.conditionalSteps.clear();
        this.branchingState.branchingRules.clear();
        this.branchingState.stepHistory = [];
    },

    // ======================
    // MODULAR BRANCHING LOGIC
    // ======================

    // Initialize branching logic for the form
    initBranchingLogic: function() {
        try {
            const form = document.querySelector('[data-form="multistep"]');
            if (!form) {
                return;
            }

            // Map all steps and their conditions
            this.mapFormSteps(form);
            
            // Set up branching listeners
            this.setupBranchingListeners(form);
            
            // Initialize step visibility
            this.initializeStepVisibility(form);
            
            } catch (error) {
            console.error('Error initializing branching logic:', error);
        }
    },

    // Map all form steps and their branching conditions
    mapFormSteps: function(form) {
        // Find all steps
        const steps = form.querySelectorAll('[data-form="step"]');
        
        steps.forEach((step, index) => {
            const stepWrapper = step.querySelector('[data-go-to], [data-answer]');
            if (!stepWrapper) return;
            
            const stepId = this.getStepId(step, index);
            const goTo = stepWrapper.dataset.goTo;
            const answer = stepWrapper.dataset.answer;
            
            // Store step information
            this.branchingState.conditionalSteps.set(stepId, {
                element: step,
                wrapper: stepWrapper,
                goTo: goTo,
                answer: answer,
                index: index,
                isVisible: index === 0 // First step visible by default
            });
            
            });

        // Find all branching inputs (radio buttons, selects with data-go-to)
        this.mapBranchingInputs(form);
    },

    // Map all inputs that trigger branching
    mapBranchingInputs: function(form) {
        const branchingInputs = form.querySelectorAll('[data-go-to]');
        
        branchingInputs.forEach(input => {
            const goTo = input.dataset.goTo;
            const value = input.value || input.dataset.value;
            const inputType = input.type || input.tagName.toLowerCase();
            
            // Create branching rule
            const rule = {
                element: input,
                goTo: goTo,
                value: value,
                inputType: inputType,
                isRadio: inputType === 'radio',
                isSelect: inputType === 'select'
            };
            
            // Group by parent container for related branching options
            const container = this.findBranchingContainer(input);
            const containerId = container.dataset.branchingGroup || this.generateContainerId(container);
            
            if (!this.branchingState.branchingRules.has(containerId)) {
                this.branchingState.branchingRules.set(containerId, []);
            }
            
            this.branchingState.branchingRules.get(containerId).push(rule);
            
            });
    },

    // Find the container that groups related branching options
    findBranchingContainer: function(input) {
        // Look for common parent containers
        let container = input.closest('[data-branching-group]');
        if (container) return container;
        
        container = input.closest('.radio_component');
        if (container) return container;
        
        container = input.closest('.multi-form_option-container');
        if (container) return container;
        
        // Fallback to step container
        return input.closest('[data-form="step"]') || input.parentElement;
    },

    // Generate a unique container ID
    generateContainerId: function(container) {
        const stepElement = container.closest('[data-form="step"]');
        const stepIndex = Array.from(stepElement.parentElement.children).indexOf(stepElement);
        const containerIndex = Array.from(stepElement.querySelectorAll('.radio_component, .multi-form_option-container')).indexOf(container);
        
        return `branching-${stepIndex}-${containerIndex}`;
    },

    // Get step identifier
    getStepId: function(step, index) {
        const wrapper = step.querySelector('[data-go-to], [data-answer]');
        return wrapper?.dataset.answer || wrapper?.dataset.goTo || `step-${index}`;
    },

    // Set up event listeners for branching
    setupBranchingListeners: function(form) {
        // Listen for all form input changes
        form.addEventListener('change', (event) => {
            this.handleBranchingChange(event);
        });
        
        // Listen for radio button clicks specifically
        form.addEventListener('click', (event) => {
            if (event.target.type === 'radio' && event.target.dataset.goTo) {
                this.handleBranchingChange(event);
            }
        });
        
        // Listen for next/back button clicks
        form.addEventListener('click', (event) => {
            if (event.target.dataset.form === 'next-btn') {
                this.handleNextStep(event);
            } else if (event.target.dataset.form === 'back-btn') {
                this.handleBackStep(event);
            }
        });
    },

    // Handle branching input changes
    handleBranchingChange: function(event) {
        const input = event.target;
        const goTo = input.dataset.goTo;
        
        if (!goTo) return;
        
        // Find all step items that match this branching decision
        const currentStep = input.closest('[data-form="step"]');
        const stepItems = currentStep.querySelectorAll('[data-answer]');
        
        // Hide all step items first
        stepItems.forEach(item => {
            this.hideStepItem(item);
        });
        
        // Show the selected step item
        const targetItem = currentStep.querySelector(`[data-answer="${goTo}"]`);
        if (targetItem) {
            this.showStepItem(targetItem);
        }
        
        // Trigger custom event
        this.triggerCustomEvent(input, 'branchingChange', {
            from: input.value,
            to: goTo,
            input: input
        });
    },

    // Handle next step navigation
    handleNextStep: function(event) {
        event.preventDefault();
        
        const currentStep = event.target.closest('[data-form="step"]');
        const nextStepId = this.determineNextStep(currentStep);
        
        if (nextStepId) {
            this.navigateToStep(nextStepId, 'forward');
        }
    },

    // Handle back step navigation
    handleBackStep: function(event) {
        event.preventDefault();
        
        if (this.branchingState.stepHistory.length > 0) {
            const previousStepId = this.branchingState.stepHistory.pop();
            this.navigateToStep(previousStepId, 'back');
        }
    },

    // Determine the next step based on current selections
    determineNextStep: function(currentStep) {
        // Check for selected branching options
        const selectedRadio = currentStep.querySelector('input[type="radio"]:checked[data-go-to]');
        if (selectedRadio) {
            return selectedRadio.dataset.goTo;
        }
        
        // Check for visible step items
        const visibleStepItem = currentStep.querySelector('.step_item:not([style*="display: none"])');
        if (visibleStepItem) {
            return visibleStepItem.dataset.goTo;
        }
        
        // Fallback to step wrapper's go-to
        const stepWrapper = currentStep.querySelector('[data-go-to]');
        return stepWrapper?.dataset.goTo;
    },

    // Navigate to a specific step
    navigateToStep: function(stepId, direction = 'forward') {
        `);
        
        // Hide current step
        if (this.branchingState.currentStep) {
            this.hideStep(this.branchingState.currentStep);
            
            // Add to history if moving forward
            if (direction === 'forward') {
                this.branchingState.stepHistory.push(this.getCurrentStepId());
            }
        }
        
        // Show target step
        const targetStep = this.findStepByAnswer(stepId) || this.findStepByGoTo(stepId);
        if (targetStep) {
            this.showStep(targetStep);
            this.branchingState.currentStep = targetStep;
            
            // Trigger custom event
            this.triggerCustomEvent(targetStep, 'stepNavigation', {
                stepId: stepId,
                direction: direction,
                step: targetStep
            });
        }
    },

    // Find step by data-answer attribute
    findStepByAnswer: function(answer) {
        return document.querySelector(`[data-form="step"] [data-answer="${answer}"]`)?.closest('[data-form="step"]');
    },

    // Find step by data-go-to attribute
    findStepByGoTo: function(goTo) {
        return document.querySelector(`[data-form="step"] [data-go-to="${goTo}"]`)?.closest('[data-form="step"]');
    },

    // Get current step ID
    getCurrentStepId: function() {
        if (!this.branchingState.currentStep) return null;
        
        const wrapper = this.branchingState.currentStep.querySelector('[data-answer], [data-go-to]');
        return wrapper?.dataset.answer || wrapper?.dataset.goTo;
    },

    // Initialize step visibility
    initializeStepVisibility: function(form) {
        const steps = form.querySelectorAll('[data-form="step"]');
        
        steps.forEach((step, index) => {
            if (index === 0) {
                this.showStep(step);
                this.branchingState.currentStep = step;
            } else {
                this.hideStep(step);
            }
            
            // Initialize step items visibility
            const stepItems = step.querySelectorAll('.step_item');
            stepItems.forEach(item => this.hideStepItem(item));
        });
    },

    // Show a step
    showStep: function(step) {
        step.style.display = 'flex';
        step.classList.add('active-step');
        
        );
    },

    // Hide a step
    hideStep: function(step) {
        step.style.display = 'none';
        step.classList.remove('active-step');
        
        );
    },

    // Show a step item (for conditional content within steps)
    showStepItem: function(item) {
        item.style.display = 'block';
        item.classList.add('active-step-item');
    },

    // Hide a step item
    hideStepItem: function(item) {
        item.style.display = 'none';
        item.classList.remove('active-step-item');
    },

    // ======================
    // UTILITY METHODS FOR BRANCHING
    // ======================

    // Reset branching state
    resetBranchingState: function() {
        this.branchingState.currentStep = null;
        this.branchingState.stepHistory = [];
        
        // Reset form to first step
        const form = document.querySelector('[data-form="multistep"]');
        if (form) {
            this.initializeStepVisibility(form);
        }
    },

    // Get branching analytics
    getBranchingAnalytics: function() {
        return {
            currentStep: this.getCurrentStepId(),
            stepHistory: [...this.branchingState.stepHistory],
            totalSteps: this.branchingState.conditionalSteps.size,
            totalBranchingRules: Array.from(this.branchingState.branchingRules.values()).flat().length
        };
    },

    // Validate current step
    validateCurrentStep: function() {
        if (!this.branchingState.currentStep) return false;
        
        const requiredFields = this.branchingState.currentStep.querySelectorAll('input[required], select[required], textarea[required]');
        
        for (const field of requiredFields) {
            if (!field.value.trim()) {
                return false;
            }
        }
        
        return true;
    },

    // ======================
    // EXISTING COUNTRY CODE METHODS (unchanged)
    // ======================

    // Get flag emoji for country ISO code
    getCountryFlag: function(isoCode) {
        if (!isoCode || isoCode.length !== 2) return '';
        
        // Convert ISO country code to flag emoji
        return isoCode.toUpperCase().replace(/./g, char => 
            String.fromCodePoint(char.charCodeAt(0) + 127397)
        );
    },

    // Generate country data from libphonenumber with proper country names
    getCountryCodes: function() {
        // Return cached data if available
        if (this.countryDataCache) {
            return this.countryDataCache;
        }

        try {
            const countries = getCountries();
            const countryData = [];

            // Comprehensive country name mapping
            const countryNames = {
                'US': 'United States',
                'GB': 'United Kingdom',
                'CA': 'Canada',
                'AU': 'Australia',
                'DE': 'Germany',
                'FR': 'France',
                'IT': 'Italy',
                'ES': 'Spain',
                'NL': 'Netherlands',
                'BE': 'Belgium',
                'CH': 'Switzerland',
                'AT': 'Austria',
                'SE': 'Sweden',
                'NO': 'Norway',
                'DK': 'Denmark',
                'FI': 'Finland',
                'IE': 'Ireland',
                'PT': 'Portugal',
                'GR': 'Greece',
                'PL': 'Poland',
                'CZ': 'Czech Republic',
                'HU': 'Hungary',
                'JP': 'Japan',
                'KR': 'South Korea',
                'CN': 'China',
                'IN': 'India',
                'BR': 'Brazil',
                'MX': 'Mexico',
                'RU': 'Russia',
                'ZA': 'South Africa',
                'EG': 'Egypt',
                'NG': 'Nigeria',
                'IL': 'Israel',
                'AE': 'United Arab Emirates',
                'SA': 'Saudi Arabia',
                'TR': 'Turkey',
                'NZ': 'New Zealand'
                // Add more as needed
            };

            for (const countryCode of countries) {
                try {
                    const callingCode = getCountryCallingCode(countryCode);
                    
                    countryData.push({
                        name: countryNames[countryCode] || countryCode,
                        countryCode: `+${callingCode}`,
                        isoCode: countryCode,
                        flag: this.getCountryFlag(countryCode)
                    });
                } catch (error) {
                    continue;
                }
            }

            // Sort with US first, then alphabetically
            countryData.sort((a, b) => {
                if (a.isoCode === 'US') return -1;
                if (b.isoCode === 'US') return 1;
                return a.name.localeCompare(b.name);
            });

            // Cache the result
            this.countryDataCache = countryData;
            return countryData;

        } catch (error) {
            console.error('Could not generate country data from libphonenumber:', error);
            // Return minimal fallback data
            return [
                { name: 'United States', countryCode: '+1', isoCode: 'US', flag: this.getCountryFlag('US') },
                { name: 'United Kingdom', countryCode: '+44', isoCode: 'GB', flag: this.getCountryFlag('GB') }
            ];
        }
    },

    // Setup country code select field - SIMPLIFIED AND FIXED
    setupCountryCodeSelect: function(field) {
        // Validate the field
        if (!field || field.tagName !== 'SELECT') {
            console.error('Invalid field passed to setupCountryCodeSelect:', field);
            return;
        }

        try {
            // Check if searchable option is enabled (default to searchable unless explicitly disabled)
            const isSearchable = field.dataset.countrySearchable !== 'false';
            
            if (isSearchable) {
                this.createSearchableCountrySelect(field);
            } else {
                this.createStandardCountrySelect(field);
            }
        } catch (error) {
            console.error('Error setting up country code select:', error);
            // Fallback to standard select
            this.createStandardCountrySelect(field);
        }
    },

    // Create standard (non-searchable) country select - SIMPLIFIED
    createStandardCountrySelect: function(field) {
        try {
            // Get the placeholder option if it exists
            const existingOptions = field.querySelectorAll('option');
            const placeholderOption = existingOptions[0];
            
            // Clear all options
            field.innerHTML = '';
            
            // Re-add placeholder if it was a proper placeholder
            if (placeholderOption && 
                (placeholderOption.value === '' || 
                 placeholderOption.textContent.trim() === '' || 
                 placeholderOption.hasAttribute('disabled') ||
                 placeholderOption.hasAttribute('selected'))) {
                field.appendChild(placeholderOption);
            }
            
            // Populate with country options
            this.populateCountryOptions(field);
            
            } catch (error) {
            console.error('Error creating standard country select:', error);
        }
    },

    // Create searchable country select - HEAVILY SIMPLIFIED AND FIXED
    createSearchableCountrySelect: function(field) {
        try {
            // Store original field properties
            const fieldName = field.name;
            const fieldId = field.id;
            const fieldClass = field.className;
            const isRequired = field.required;
            const placeholder = this.getPlaceholderText(field);
            
            // Create wrapper container
            const container = this.createDropdownContainer();
            
            // Create search input
            const searchInput = this.createSearchInput(fieldClass, placeholder, fieldId);
            
            // Create hidden select for form submission
            const hiddenSelect = this.createHiddenSelect(fieldName, fieldId, isRequired);
            
            // Create dropdown list
            const dropdownList = this.createDropdownList();
            
            // Insert container before original field
            field.parentNode.insertBefore(container, field);
            
            // Add elements to container
            container.appendChild(searchInput);
            container.appendChild(hiddenSelect);
            container.appendChild(dropdownList);
            
            // Get countries data
            const countries = this.getFormattedCountries(field);
            
            // Populate dropdown options
            this.populateSearchableDropdown(dropdownList, hiddenSelect, countries);
            
            // Add event listeners
            this.attachSearchableEvents(searchInput, dropdownList, hiddenSelect, countries, field);
            
            // Remove original field
            field.remove();
            
            // Trigger setup event
            this.triggerCustomEvent(searchInput, 'countryCodeSetup', { 
                searchable: true,
                countriesCount: countries.length 
            });
            
            } catch (error) {
            console.error('Error creating searchable country select:', error);
            // Fallback to standard select
            this.createStandardCountrySelect(field);
        }
    },

    // Helper method to get placeholder text
    getPlaceholderText: function(field) {
        const disabledOption = field.querySelector('option[disabled]');
        return disabledOption?.textContent || field.placeholder || 'Select or search for a country...';
    },

    // Helper method to create dropdown container
    createDropdownContainer: function() {
        const container = document.createElement('div');
        container.dataset.countrySelectContainer = 'true';
        container.style.position = 'relative';
        return container;
    },

    // Helper method to create search input
    createSearchInput: function(fieldClass, placeholder, fieldId) {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = fieldClass;
        searchInput.placeholder = placeholder;
        searchInput.autocomplete = 'off';
        searchInput.dataset.countrySearch = 'true';
        
        if (fieldId) {
            searchInput.id = fieldId + '_search';
        }
        
        return searchInput;
    },

    // Helper method to create hidden select
    createHiddenSelect: function(fieldName, fieldId, isRequired) {
        const hiddenSelect = document.createElement('select');
        hiddenSelect.name = fieldName;
        hiddenSelect.required = isRequired;
        hiddenSelect.style.display = 'none';
        
        if (fieldId) {
            hiddenSelect.id = fieldId;
        }
        
        // Add empty option
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        hiddenSelect.appendChild(emptyOption);
        
        return hiddenSelect;
    },

    // Helper method to create dropdown list
    createDropdownList: function() {
        const dropdownList = document.createElement('div');
        dropdownList.dataset.countryDropdown = 'true';
        dropdownList.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            width: 100%;
            background: white;
            border: 1px solid #ccc;
            border-top: none;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            box-sizing: border-box;
        `;
        return dropdownList;
    },

    // Get formatted countries data - SIMPLIFIED
    getFormattedCountries: function(field) {
        const countries = this.getCountryCodes();
        const displayFormat = field.dataset.countryFormat || 'flag-code';
        const valueType = field.dataset.countryValue || 'code';
        
        return countries.map(country => {
            let displayText = this.formatCountryDisplay(country, displayFormat);
            let value = this.formatCountryValue(country, valueType);
            
            return {
                ...country,
                displayText,
                value,
                searchText: `${country.name} ${country.countryCode}`.toLowerCase()
            };
        });
    },

    // Format country display text
    formatCountryDisplay: function(country, format) {
        switch (format) {
            case 'name': return country.name;
            case 'code': return country.countryCode;
            case 'name-code': return `${country.name} (${country.countryCode})`;
            case 'flag-name-code': return `${country.flag} ${country.name} (${country.countryCode})`;
            case 'flag-code':
            default: return `${country.flag} ${country.countryCode}`;
        }
    },

    // Format country value
    formatCountryValue: function(country, valueType) {
        switch (valueType) {
            case 'name': return country.name;
            case 'full': return `${country.name} (${country.countryCode})`;
            case 'code':
            default: return country.countryCode;
        }
    },

    // Populate standard country options
    populateCountryOptions: function(field) {
        try {
            const countries = this.getFormattedCountries(field);
            
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.value;
                option.textContent = country.displayText;
                option.dataset.countryName = country.name;
                option.dataset.countryCode = country.countryCode;
                option.dataset.countryFlag = country.flag;
                
                field.appendChild(option);
            });
            
            // Trigger setup event
            this.triggerCustomEvent(field, 'countryCodeSetup', { 
                searchable: false,
                countriesCount: countries.length 
            });
            
        } catch (error) {
            console.error('Error populating country options:', error);
        }
    },

    // Populate searchable dropdown - SIMPLIFIED
    populateSearchableDropdown: function(dropdownList, hiddenSelect, countries) {
        try {
            dropdownList.innerHTML = '';
            
            countries.forEach(country => {
                // Create dropdown option
                const option = this.createDropdownOption(country);
                dropdownList.appendChild(option);
                
                // Create hidden select option
                const selectOption = this.createSelectOption(country);
                hiddenSelect.appendChild(selectOption);
            });
            
        } catch (error) {
            console.error('Error populating searchable dropdown:', error);
        }
    },

    // Create dropdown option element
    createDropdownOption: function(country) {
        const option = document.createElement('div');
        option.dataset.countryOption = 'true';
        option.textContent = country.displayText;
        option.dataset.value = country.value;
        option.dataset.countryName = country.name;
        option.dataset.countryCode = country.countryCode;
        option.dataset.countryFlag = country.flag;
        
        option.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        `;
        
        // Add hover effects
        option.addEventListener('mouseenter', () => {
            option.style.backgroundColor = '#f5f5f5';
        });
        
        option.addEventListener('mouseleave', () => {
            option.style.backgroundColor = '';
        });
        
        return option;
    },

    // Create select option element
    createSelectOption: function(country) {
        const selectOption = document.createElement('option');
        selectOption.value = country.value;
        selectOption.textContent = country.displayText;
        selectOption.dataset.countryName = country.name;
        selectOption.dataset.countryCode = country.countryCode;
        selectOption.dataset.countryFlag = country.flag;
        
        return selectOption;
    },

    // Trigger custom events - UTILITY METHOD
    triggerCustomEvent: function(element, eventName, detail = {}) {
        try {
            const event = new CustomEvent(`webflowField:${eventName}`, {
                bubbles: true,
                detail: { ...detail, field: element }
            });
            element.dispatchEvent(event);
        } catch (error) {
            }
    },

    // Main initialization method
    init: function(options = {}) {
        this.config = Object.assign({}, this.config, options);
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupFields();
                if (this.config.branchingEnabled) {
                    this.initBranchingLogic();
                }
            });
        } else {
            this.setupFields();
            if (this.config.branchingEnabled) {
                this.initBranchingLogic();
            }
        }
    },

    // Setup all form fields
    setupFields: function() {
        try {
            const fields = document.querySelectorAll('form[data-name] input, form[data-name] textarea, form[data-name] select');
            
            fields.forEach(field => {
                // Country code selector
                if (field.dataset.countryCode === 'true' && field.tagName === 'SELECT') {
                    this.setupCountryCodeSelect(field);
                }
                
                // Add other field setups here...
            });
            
            } catch (error) {
            console.error('Error setting up fields:', error);
        }
    }
};

// Auto-initialize if config allows
if (WebflowFieldEnhancer.config.autoInit) {
    WebflowFieldEnhancer.init();
}

// Export for both CommonJS and browser environments
if (typeof window !== 'undefined') {
    window.WebflowFieldEnhancer = WebflowFieldEnhancer;
    window.WebflowForms = WebflowFieldEnhancer;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebflowFieldEnhancer;
}

export default WebflowFieldEnhancer; 