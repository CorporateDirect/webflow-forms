// Import libphonenumber for dynamic phone formatting and country data
import { AsYouType, getExampleNumber, parsePhoneNumber, getCountries, getCountryCallingCode } from 'libphonenumber-js';

const WebflowFieldEnhancer = {
    version: '1.1.0',
    
    config: {
        autoInit: true,
        enhancedClass: 'wf-field-enhanced',
        focusClass: 'wf-field-focus',
        typingClass: 'wf-field-typing'
    },

    // Cache for country data and phone formatting
    countryDataCache: null,
    phoneFormatCache: new Map(),

    // Clear all caches
    clearCaches: function() {
        this.countryDataCache = null;
        this.phoneFormatCache.clear();
    },

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
                    console.warn(`Country ${countryCode} caused an error and was skipped:`, error);
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
        console.log('Setting up country code select for:', field.id || field.name);
        
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
        console.log('Creating standard country select');
        
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
            
            console.log(`Standard country select created with ${field.options.length} options`);
            
        } catch (error) {
            console.error('Error creating standard country select:', error);
        }
    },

    // Create searchable country select - HEAVILY SIMPLIFIED AND FIXED
    createSearchableCountrySelect: function(field) {
        console.log('Creating searchable country select');
        
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
            
            console.log(`Searchable country select created with ${countries.length} countries`);
            
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
            console.warn('Error triggering custom event:', eventName, error);
        }
    },

    // Main initialization method
    init: function(options = {}) {
        this.config = Object.assign({}, this.config, options);
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupFields());
        } else {
            this.setupFields();
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
            
            console.log(`WebflowForms initialized - processed ${fields.length} fields`);
            
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