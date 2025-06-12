/**
 * Webflow Field Enhancer - Advanced field behaviors for Webflow forms
 * Provides functionality beyond default Webflow form behavior
 * Works alongside Webflow's native form functionality and Formly for submission
 * @version 1.1.0
 * @author Chris Brummer
 * @license MIT
 */

// Import libphonenumber for dynamic phone formatting and country data
import { AsYouType, getExampleNumber, parsePhoneNumber, getCountries, getCountryCallingCode } from 'libphonenumber-js';

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

        // Phone formatting cache to avoid repeated lookups
        phoneFormatCache: new Map(),
        countryDataCache: null,

        // Generate country data from libphonenumber with proper country names
        getCountryCodes: function() {
            // Return cached data if available
            if (this.countryDataCache) {
                return this.countryDataCache;
            }

            try {
                const countries = getCountries();
                const countryData = [];

                // Country name mapping for better display
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
                    'RO': 'Romania',
                    'BG': 'Bulgaria',
                    'HR': 'Croatia',
                    'SI': 'Slovenia',
                    'SK': 'Slovakia',
                    'LT': 'Lithuania',
                    'LV': 'Latvia',
                    'EE': 'Estonia',
                    'JP': 'Japan',
                    'KR': 'South Korea',
                    'CN': 'China',
                    'IN': 'India',
                    'SG': 'Singapore',
                    'HK': 'Hong Kong',
                    'TW': 'Taiwan',
                    'TH': 'Thailand',
                    'MY': 'Malaysia',
                    'ID': 'Indonesia',
                    'PH': 'Philippines',
                    'VN': 'Vietnam',
                    'BR': 'Brazil',
                    'MX': 'Mexico',
                    'AR': 'Argentina',
                    'CL': 'Chile',
                    'CO': 'Colombia',
                    'PE': 'Peru',
                    'VE': 'Venezuela',
                    'ZA': 'South Africa',
                    'EG': 'Egypt',
                    'NG': 'Nigeria',
                    'KE': 'Kenya',
                    'MA': 'Morocco',
                    'TN': 'Tunisia',
                    'IL': 'Israel',
                    'AE': 'United Arab Emirates',
                    'SA': 'Saudi Arabia',
                    'TR': 'Turkey',
                    'RU': 'Russia',
                    'UA': 'Ukraine',
                    'BY': 'Belarus',
                    'KZ': 'Kazakhstan',
                    'UZ': 'Uzbekistan',
                    'NZ': 'New Zealand',
                    // Additional countries to cover more ISO codes
                    'EH': 'Western Sahara',
                    'DZ': 'Algeria',
                    'LY': 'Libya',
                    'SD': 'Sudan',
                    'SS': 'South Sudan',
                    'ET': 'Ethiopia',
                    'SO': 'Somalia',
                    'DJ': 'Djibouti',
                    'ER': 'Eritrea',
                    'UG': 'Uganda',
                    'TZ': 'Tanzania',
                    'RW': 'Rwanda',
                    'BI': 'Burundi',
                    'MZ': 'Mozambique',
                    'MG': 'Madagascar',
                    'ZM': 'Zambia',
                    'ZW': 'Zimbabwe',
                    'BW': 'Botswana',
                    'NA': 'Namibia',
                    'SZ': 'Eswatini',
                    'LS': 'Lesotho',
                    'MW': 'Malawi',
                    'KM': 'Comoros',
                    'SC': 'Seychelles',
                    'MU': 'Mauritius',
                    'RE': 'Réunion',
                    'YT': 'Mayotte',
                    'SH': 'Saint Helena',
                    'GM': 'Gambia',
                    'SN': 'Senegal',
                    'MR': 'Mauritania',
                    'ML': 'Mali',
                    'BF': 'Burkina Faso',
                    'NE': 'Niger',
                    'TD': 'Chad',
                    'CF': 'Central African Republic',
                    'CM': 'Cameroon',
                    'GQ': 'Equatorial Guinea',
                    'GA': 'Gabon',
                    'CG': 'Republic of the Congo',
                    'CD': 'Democratic Republic of the Congo',
                    'AO': 'Angola',
                    'GW': 'Guinea-Bissau',
                    'CV': 'Cape Verde',
                    'ST': 'São Tomé and Príncipe',
                    'GN': 'Guinea',
                    'SL': 'Sierra Leone',
                    'LR': 'Liberia',
                    'CI': 'Côte d\'Ivoire',
                    'GH': 'Ghana',
                    'TG': 'Togo',
                    'BJ': 'Benin',
                    'AF': 'Afghanistan',
                    'PK': 'Pakistan',
                    'BD': 'Bangladesh',
                    'LK': 'Sri Lanka',
                    'MV': 'Maldives',
                    'BT': 'Bhutan',
                    'NP': 'Nepal',
                    'MM': 'Myanmar',
                    'LA': 'Laos',
                    'KH': 'Cambodia',
                    'BN': 'Brunei',
                    'TL': 'Timor-Leste',
                    'MN': 'Mongolia',
                    'KP': 'North Korea',
                    'MO': 'Macau',
                    'IR': 'Iran',
                    'IQ': 'Iraq',
                    'SY': 'Syria',
                    'LB': 'Lebanon',
                    'JO': 'Jordan',
                    'PS': 'Palestine',
                    'KW': 'Kuwait',
                    'BH': 'Bahrain',
                    'QA': 'Qatar',
                    'OM': 'Oman',
                    'YE': 'Yemen',
                    'GE': 'Georgia',
                    'AM': 'Armenia',
                    'AZ': 'Azerbaijan',
                    'KG': 'Kyrgyzstan',
                    'TJ': 'Tajikistan',
                    'TM': 'Turkmenistan',
                    'MD': 'Moldova',
                    'RS': 'Serbia',
                    'ME': 'Montenegro',
                    'XK': 'Kosovo',
                    'BA': 'Bosnia and Herzegovina',
                    'MK': 'North Macedonia',
                    'AL': 'Albania',
                    'MT': 'Malta',
                    'CY': 'Cyprus',
                    'IS': 'Iceland',
                    'FO': 'Faroe Islands',
                    'GL': 'Greenland',
                    'LU': 'Luxembourg',
                    'LI': 'Liechtenstein',
                    'MC': 'Monaco',
                    'SM': 'San Marino',
                    'VA': 'Vatican City',
                    'AD': 'Andorra',
                    'GI': 'Gibraltar',
                    'JE': 'Jersey',
                    'GG': 'Guernsey',
                    'IM': 'Isle of Man',
                    'AX': 'Åland Islands',
                    'SJ': 'Svalbard and Jan Mayen',
                    'CU': 'Cuba',
                    'JM': 'Jamaica',
                    'HT': 'Haiti',
                    'DO': 'Dominican Republic',
                    'PR': 'Puerto Rico',
                    'VI': 'U.S. Virgin Islands',
                    'AG': 'Antigua and Barbuda',
                    'DM': 'Dominica',
                    'GD': 'Grenada',
                    'KN': 'Saint Kitts and Nevis',
                    'LC': 'Saint Lucia',
                    'VC': 'Saint Vincent and the Grenadines',
                    'BB': 'Barbados',
                    'TT': 'Trinidad and Tobago',
                    'GY': 'Guyana',
                    'SR': 'Suriname',
                    'GF': 'French Guiana',
                    'UY': 'Uruguay',
                    'PY': 'Paraguay',
                    'BO': 'Bolivia',
                    'EC': 'Ecuador',
                    'FK': 'Falkland Islands',
                    'BZ': 'Belize',
                    'GT': 'Guatemala',
                    'SV': 'El Salvador',
                    'HN': 'Honduras',
                    'NI': 'Nicaragua',
                    'CR': 'Costa Rica',
                    'PA': 'Panama',
                    'BS': 'Bahamas',
                    'BM': 'Bermuda',
                    'KY': 'Cayman Islands',
                    'TC': 'Turks and Caicos Islands',
                    'AI': 'Anguilla',
                    'MS': 'Montserrat',
                    'VG': 'British Virgin Islands',
                    'AS': 'American Samoa',
                    'GU': 'Guam',
                    'MP': 'Northern Mariana Islands',
                    'PW': 'Palau',
                    'FM': 'Micronesia',
                    'MH': 'Marshall Islands',
                    'KI': 'Kiribati',
                    'NR': 'Nauru',
                    'TV': 'Tuvalu',
                    'TO': 'Tonga',
                    'WS': 'Samoa',
                    'VU': 'Vanuatu',
                    'SB': 'Solomon Islands',
                    'FJ': 'Fiji',
                    'NC': 'New Caledonia',
                    'PF': 'French Polynesia',
                    'WF': 'Wallis and Futuna',
                    'CK': 'Cook Islands',
                    'NU': 'Niue',
                    'TK': 'Tokelau',
                    'PG': 'Papua New Guinea',
                    'NF': 'Norfolk Island',
                    'CC': 'Cocos Islands',
                    'CX': 'Christmas Island',
                    'IO': 'British Indian Ocean Territory',
                    'AC': 'Ascension Island',
                    'TA': 'Tristan da Cunha',
                    'PM': 'Saint Pierre and Miquelon',
                    'GP': 'Guadeloupe',
                    'MQ': 'Martinique',
                    'BL': 'Saint Barthélemy',
                    'MF': 'Saint Martin',
                    'SX': 'Sint Maarten',
                    'CW': 'Curaçao',
                    'BQ': 'Caribbean Netherlands',
                    'AW': 'Aruba'
                };

                for (const countryCode of countries) {
                    try {
                        const callingCode = getCountryCallingCode(countryCode);
                        
                        countryData.push({
                            name: countryNames[countryCode] || countryCode, // Use proper name or fall back to ISO code
                            countryCode: `+${callingCode}`, // Dialing code (e.g., "+1", "+44", "+33")
                            isoCode: countryCode, // Keep ISO code for reference
                            flag: '' // No flag emoji
                        });
                    } catch (error) {
                        // Skip countries that cause errors
                        continue;
                    }
                }

                // Cache the result
                this.countryDataCache = countryData;
                return countryData;

            } catch (error) {
                console.warn('Could not generate country data from libphonenumber:', error);
                // Fallback to minimal data
                return [
                    { name: 'United States', countryCode: '+1', isoCode: 'US', flag: '' },
                    { name: 'United Kingdom', countryCode: '+44', isoCode: 'GB', flag: '' }
                ];
            }
        },

        // Get country code from dialing code using libphonenumber (e.g., "+1" -> "US")
        getCountryFromDialingCode: function(dialingCode) {
            if (!dialingCode) return null;
            
            // Remove the '+' prefix for comparison
            const numericCode = dialingCode.replace('+', '');
            
            try {
                // Get all countries supported by libphonenumber
                const countries = getCountries();
                
                // Find the country that matches this dialing code
                for (const countryCode of countries) {
                    const countryCallingCode = getCountryCallingCode(countryCode);
                    if (countryCallingCode === numericCode) {
                        return countryCode;
                    }
                }
                
                return null;
            } catch (error) {
                console.warn(`Could not find country for dialing code: ${dialingCode}`, error);
                return null;
            }
        },

        // Get example phone number for a country
        getExamplePhoneNumber: function(countryCode, phoneType = 'mobile') {
            if (!countryCode) return null;
            
            // Create cache key that includes phone type
            const cacheKey = `${countryCode}-${phoneType}`;
            
            // Check cache first
            if (this.phoneFormatCache.has(cacheKey)) {
                return this.phoneFormatCache.get(cacheKey);
            }
            
            try {
                // Try to get example number from libphonenumber
                let exampleNumber = getExampleNumber(countryCode, phoneType);
                
                // If libphonenumber doesn't have examples, provide common patterns
                if (!exampleNumber) {
                    const patterns = this.getPhonePatterns(countryCode, phoneType);
                    const formatted = patterns[phoneType] || patterns.mobile || patterns.fixed_line || null;
                    
                    // Cache the result
                    this.phoneFormatCache.set(cacheKey, formatted);
                    return formatted;
                }
                
                const formatted = exampleNumber.formatNational();
                
                // Cache the result
                this.phoneFormatCache.set(cacheKey, formatted);
                return formatted;
            } catch (error) {
                // Fallback to common patterns if libphonenumber fails
                const patterns = this.getPhonePatterns(countryCode, phoneType);
                const formatted = patterns[phoneType] || patterns.mobile || patterns.fixed_line || null;
                
                // Cache the result
                this.phoneFormatCache.set(cacheKey, formatted);
                return formatted;
            }
        },

        // Get common phone patterns for countries (fallback when libphonenumber doesn't have examples)
        getPhonePatterns: function(countryCode, requestedType) {
            const patterns = {
                'US': {
                    mobile: '(555) 123-4567',
                    fixed_line: '(555) 123-4567',
                    toll_free: '(800) 123-4567',
                    premium_rate: '(900) 123-4567'
                },
                'GB': {
                    mobile: '07911 123456',
                    fixed_line: '020 7946 0958',
                    toll_free: '0800 123456',
                    premium_rate: '0906 123456'
                },
                'FR': {
                    mobile: '06 12 34 56 78',
                    fixed_line: '01 23 45 67 89',
                    toll_free: '0800 123456',
                    premium_rate: '0899 123456'
                },
                'DE': {
                    mobile: '0151 12345678',
                    fixed_line: '030 12345678',
                    toll_free: '0800 1234567',
                    premium_rate: '0900 1234567'
                },
                'JP': {
                    mobile: '090-1234-5678',
                    fixed_line: '03-1234-5678',
                    toll_free: '0120-123-456',
                    premium_rate: '0990-123-456'
                },
                'AU': {
                    mobile: '0412 345 678',
                    fixed_line: '02 1234 5678',
                    toll_free: '1800 123 456',
                    premium_rate: '1900 123 456'
                },
                'CA': {
                    mobile: '(555) 123-4567',
                    fixed_line: '(555) 123-4567',
                    toll_free: '(800) 123-4567',
                    premium_rate: '(900) 123-4567'
                },
                'IN': {
                    mobile: '98765 43210',
                    fixed_line: '011 2345 6789',
                    toll_free: '1800 123 4567',
                    premium_rate: '1900 123 456'
                },
                'BR': {
                    mobile: '(11) 99999-9999',
                    fixed_line: '(11) 3333-4444',
                    toll_free: '0800 123 4567',
                    premium_rate: '0900 123 456'
                },
                'CN': {
                    mobile: '138 0013 8000',
                    fixed_line: '010 1234 5678',
                    toll_free: '400 123 4567',
                    premium_rate: '900 123 456'
                }
            };

            // Return patterns for the country, or generic mobile pattern
            return patterns[countryCode] || {
                mobile: '123 456 7890',
                fixed_line: '123 456 7890',
                toll_free: '800 123 4567',
                premium_rate: '900 123 456'
            };
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
                'customValidation', 'inputMask', 'autoComplete', 'fieldSync', 'countryCode', 'phoneFormat', 'phoneType',
                'googlePlaces', 'addressComponent', 'postalCode', 'stateName'
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
            
            // Country code selector
            if (field.dataset.countryCode === 'true' && field.tagName === 'SELECT') {
                this.setupCountryCodeSelect(field);
            }
            
            // Dynamic phone formatting based on country code
            if (field.dataset.phoneFormat !== undefined) {
                this.setupDynamicPhoneFormatting(field);
            }
            
            // Google Places Autocomplete
            if (field.dataset.googlePlaces === 'true') {
                this.setupGooglePlaces(field);
            }
            
            // Postal code detection (fallback if Google Places not used)
            if (field.dataset.postalCode === 'true') {
                this.setupPostalCodeDetection(field);
            }
            
            // State name population (can work with Google Places or postal code)
            if (field.dataset.stateName === 'true') {
                this.setupStateNameField(field);
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

        // Setup country code select field
        setupCountryCodeSelect: function(field) {
            // Check if searchable option is enabled
            const isSearchable = field.dataset.countrySearchable !== 'false'; // Default to true
            
            if (isSearchable) {
                this.createSearchableCountrySelect(field);
            } else {
                this.createStandardCountrySelect(field);
            }
        },

        // Create standard (non-searchable) country select
        createStandardCountrySelect: function(field) {
            // Clear existing options except placeholder
            const existingOptions = field.querySelectorAll('option');
            const placeholderOption = existingOptions[0];
            
            // Clear all options
            field.innerHTML = '';
            
            // Re-add placeholder if it existed
            if (placeholderOption && (placeholderOption.value === '' || placeholderOption.textContent.trim() === '' || placeholderOption.hasAttribute('disabled'))) {
                field.appendChild(placeholderOption);
            }
            
            this.populateCountryOptions(field);
        },

        // Create searchable country select
        createSearchableCountrySelect: function(field) {
            // Store original field properties
            const fieldName = field.name;
            const fieldId = field.id;
            const fieldClass = field.className;
            const isRequired = field.required;
            const placeholder = field.querySelector('option[disabled]')?.textContent || 'Select Country';
            
            // Create container for custom dropdown
            const container = document.createElement('div');
            container.className = 'wf-country-select-container';
            container.style.position = 'relative';
            container.style.width = '100%';
            
            // Create search input
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = fieldClass + ' wf-country-search';
            searchInput.placeholder = placeholder;
            searchInput.autocomplete = 'off';
            if (fieldId) searchInput.id = fieldId + '_search';
            
            // Create hidden select for form submission
            const hiddenSelect = document.createElement('select');
            hiddenSelect.name = fieldName;
            hiddenSelect.required = isRequired;
            hiddenSelect.style.display = 'none';
            if (fieldId) hiddenSelect.id = fieldId;
            
            // Create dropdown list
            const dropdownList = document.createElement('div');
            dropdownList.className = 'wf-country-dropdown';
            dropdownList.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #ccc;
                border-top: none;
                max-height: 200px;
                overflow-y: auto;
                z-index: 1000;
                display: none;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            
            // Insert container before original field
            field.parentNode.insertBefore(container, field);
            
            // Add elements to container
            container.appendChild(searchInput);
            container.appendChild(hiddenSelect);
            container.appendChild(dropdownList);
            
            // Remove original field
            field.remove();
            
            // Get countries data
            const countries = this.getFormattedCountries(field);
            
            // Populate dropdown options
            this.populateSearchableDropdown(dropdownList, hiddenSelect, searchInput, countries, field);
            
            // Add event listeners
            this.attachSearchableEvents(searchInput, dropdownList, hiddenSelect, countries, field);
            
            // Trigger custom event
            this.triggerCustomEvent(searchInput, 'countryCodeSetup', { 
                searchable: true,
                countriesCount: countries.length 
            });
        },

        // Get formatted countries data
        getFormattedCountries: function(field) {
            const displayFormat = field.dataset.countryFormat || 'name-code';
            const sortBy = field.dataset.countrySortBy || 'name';
            const valueType = field.dataset.countryValue || 'code';
            
            // Get countries from libphonenumber
            const countries = this.getCountryCodes();
            
            // Sort countries with United States first
            let sortedCountries = [...countries];
            
            // Always put United States first
            const usIndex = sortedCountries.findIndex(country => country.isoCode === 'US');
            if (usIndex > -1) {
                const usCountry = sortedCountries.splice(usIndex, 1)[0];
                
                // Sort the remaining countries
                if (sortBy === 'name') {
                    sortedCountries.sort((a, b) => a.name.localeCompare(b.name));
                } else if (sortBy === 'code') {
                    sortedCountries.sort((a, b) => a.countryCode.localeCompare(b.countryCode));
                }
                
                // Put US at the beginning
                sortedCountries.unshift(usCountry);
                } else {
                // If US not found, just sort normally
                if (sortBy === 'name') {
                    sortedCountries.sort((a, b) => a.name.localeCompare(b.name));
                } else if (sortBy === 'code') {
                    sortedCountries.sort((a, b) => a.countryCode.localeCompare(b.countryCode));
                }
            }
            
            return sortedCountries.map(country => {
                let displayText;
                switch (displayFormat) {
                    case 'name':
                        displayText = country.name;
                        break;
                    case 'code':
                        displayText = country.countryCode;
                        break;
                    case 'name-code':
                    default:
                        displayText = `${country.name} (${country.countryCode})`;
                        break;
                }
                
                let value;
                switch (valueType) {
                    case 'name':
                        value = country.name;
                        break;
                    case 'full':
                        value = `${country.name} (${country.countryCode})`;
                        break;
                    case 'code':
                    default:
                        value = country.countryCode;
                        break;
                }
                
                return {
                    ...country,
                    displayText,
                    value,
                    searchText: `${country.name} ${country.countryCode}`.toLowerCase()
                };
            });
        },

        // Populate searchable dropdown
        populateSearchableDropdown: function(dropdownList, hiddenSelect, searchInput, countries, originalField) {
            dropdownList.innerHTML = '';
            hiddenSelect.innerHTML = '<option value=""></option>';
            
            countries.forEach(country => {
                // Create dropdown option
                const option = document.createElement('div');
                option.className = 'wf-country-option';
                option.textContent = country.displayText;
                option.style.cssText = `
                    padding: 8px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #eee;
                `;
                option.dataset.value = country.value;
                option.dataset.countryName = country.name;
                option.dataset.countryCode = country.countryCode;
                option.dataset.countryFlag = country.flag;
                
                // Add hover effects
                option.addEventListener('mouseenter', () => {
                    option.style.backgroundColor = '#f5f5f5';
                });
                option.addEventListener('mouseleave', () => {
                    option.style.backgroundColor = 'white';
                });
                
                // Add click handler
                option.addEventListener('click', () => {
                    this.selectCountryOption(option, searchInput, hiddenSelect, dropdownList, originalField);
                });
                
                dropdownList.appendChild(option);
                
                // Create hidden select option
                const selectOption = document.createElement('option');
                selectOption.value = country.value;
                selectOption.textContent = country.displayText;
                selectOption.dataset.countryName = country.name;
                selectOption.dataset.countryCode = country.countryCode;
                selectOption.dataset.countryFlag = country.flag;
                hiddenSelect.appendChild(selectOption);
            });
        },

        // Attach searchable events
        attachSearchableEvents: function(searchInput, dropdownList, hiddenSelect, countries, originalField) {
            // Show/hide dropdown on focus/blur
            searchInput.addEventListener('focus', () => {
                dropdownList.style.display = 'block';
                this.filterCountryOptions(searchInput.value, dropdownList, countries);
            });
            
            // Hide dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !dropdownList.contains(e.target)) {
                    dropdownList.style.display = 'none';
                }
            });
            
            // Filter options as user types
            searchInput.addEventListener('input', () => {
                this.filterCountryOptions(searchInput.value, dropdownList, countries);
                dropdownList.style.display = 'block';
                
                // Clear selection if input doesn't match
                if (hiddenSelect.value && !searchInput.value) {
                    hiddenSelect.value = '';
                    this.triggerCustomEvent(searchInput, 'countrySelectionCleared');
                }
            });
            
            // Handle keyboard navigation
            searchInput.addEventListener('keydown', (e) => {
                this.handleCountryKeyboardNavigation(e, dropdownList, searchInput, hiddenSelect, originalField);
            });
        },

        // Filter country options based on search
        filterCountryOptions: function(searchTerm, dropdownList, countries) {
            const options = dropdownList.querySelectorAll('.wf-country-option');
            const search = searchTerm.toLowerCase();
            
            options.forEach((option, index) => {
                const country = countries[index];
                const matches = country.searchText.includes(search);
                option.style.display = matches ? 'block' : 'none';
            });
        },

        // Handle keyboard navigation
        handleCountryKeyboardNavigation: function(e, dropdownList, searchInput, hiddenSelect, originalField) {
            const visibleOptions = Array.from(dropdownList.querySelectorAll('.wf-country-option'))
                .filter(option => option.style.display !== 'none');
            
            let currentIndex = visibleOptions.findIndex(option => 
                option.style.backgroundColor === 'rgb(245, 245, 245)' || option.classList.contains('highlighted')
            );
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    currentIndex = Math.min(currentIndex + 1, visibleOptions.length - 1);
                    this.highlightCountryOption(visibleOptions, currentIndex);
                    dropdownList.style.display = 'block';
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    currentIndex = Math.max(currentIndex - 1, 0);
                    this.highlightCountryOption(visibleOptions, currentIndex);
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    if (currentIndex >= 0 && visibleOptions[currentIndex]) {
                        this.selectCountryOption(visibleOptions[currentIndex], searchInput, hiddenSelect, dropdownList, originalField);
                    }
                    break;
                    
                case 'Escape':
                    dropdownList.style.display = 'none';
                    searchInput.blur();
                    break;
            }
        },

        // Highlight option during keyboard navigation
        highlightCountryOption: function(options, index) {
            options.forEach((option, i) => {
                if (i === index) {
                    option.style.backgroundColor = '#f5f5f5';
                    option.classList.add('highlighted');
                    option.scrollIntoView({ block: 'nearest' });
                } else {
                    option.style.backgroundColor = 'white';
                    option.classList.remove('highlighted');
                }
            });
        },

        // Select country option
        selectCountryOption: function(option, searchInput, hiddenSelect, dropdownList, originalField) {
            const value = option.dataset.value;
            const displayText = option.textContent;
            
            // Update inputs
            searchInput.value = displayText;
            hiddenSelect.value = value;
            
            // Hide dropdown
            dropdownList.style.display = 'none';
            
            // Trigger events
            this.triggerCustomEvent(searchInput, 'countrySelected', {
                value: value,
                name: option.dataset.countryName,
                code: option.dataset.countryCode,
                flag: option.dataset.countryFlag,
                displayText: displayText
            });
            
            // Trigger change event on hidden select for form handling
            const changeEvent = new Event('change', { bubbles: true });
            hiddenSelect.dispatchEvent(changeEvent);
        },

        // Populate standard country options (for non-searchable)
        populateCountryOptions: function(field) {
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
            
            // Trigger custom event
            this.triggerCustomEvent(field, 'countryCodeSetup', { 
                searchable: false,
                countriesCount: countries.length 
            });
        },

        // Setup dynamic phone formatting based on country code selection
        setupDynamicPhoneFormatting: function(field) {
            // Find the country code selector
            const countrySelector = this.findCountryCodeSelector(field);
            
            if (!countrySelector) {
                console.warn('Phone format field found but no country code selector detected');
                return;
            }
            
            // Store reference to phone field on country selector
            if (!countrySelector._phoneFields) {
                countrySelector._phoneFields = [];
            }
            countrySelector._phoneFields.push(field);
            
            // Set initial format if country is already selected
            this.updatePhoneFormat(field, countrySelector);
            
            // Listen for country changes
            const updateFormat = () => {
                setTimeout(() => this.updatePhoneFormat(field, countrySelector), 0);
            };
            
            // Handle both standard select and searchable country selects
            if (countrySelector.tagName === 'SELECT') {
                countrySelector.addEventListener('change', updateFormat);
            } else if (countrySelector.classList.contains('wf-country-search')) {
                // For searchable country selects, listen to the hidden select
                const hiddenSelect = countrySelector.parentNode.querySelector('select[style*="display: none"]');
                if (hiddenSelect) {
                    hiddenSelect.addEventListener('change', updateFormat);
                }
            }
            
            // Also listen for custom country selection events
            document.addEventListener('webflowField:countrySelected', (e) => {
                if (e.detail.field === countrySelector || 
                    (countrySelector._phoneFields && countrySelector._phoneFields.includes(field))) {
                    this.updatePhoneFormat(field, countrySelector);
                }
            });
            
            this.triggerCustomEvent(field, 'phoneFormatSetup', { 
                countrySelector: countrySelector 
            });
        },

        // Find the country code selector for a phone field
        findCountryCodeSelector: function(phoneField) {
            const form = phoneField.closest('form');
            if (!form) return null;
            
            // Look for country code selectors in the same form
            // First check for searchable country selects
            let countrySelector = form.querySelector('.wf-country-search');
            if (countrySelector) return countrySelector;
            
            // Then check for standard country selects
            countrySelector = form.querySelector('select[data-country-code="true"]');
            if (countrySelector) return countrySelector;
            
            // Check by data attribute reference
            const countryFieldRef = phoneField.dataset.phoneCountryField;
            if (countryFieldRef) {
                return form.querySelector(countryFieldRef);
            }
            
            return null;
        },

        // Update phone field formatting based on selected country
        updatePhoneFormat: function(phoneField, countrySelector) {
            let selectedDialingCode = '';
            
            // Get selected country dialing code
            if (countrySelector.tagName === 'SELECT') {
                const selectedOption = countrySelector.options[countrySelector.selectedIndex];
                selectedDialingCode = selectedOption ? selectedOption.dataset.countryCode : '';
            } else if (countrySelector.classList.contains('wf-country-search')) {
                // For searchable selects, get from hidden select
                const hiddenSelect = countrySelector.parentNode.querySelector('select[style*="display: none"]');
                if (hiddenSelect && hiddenSelect.selectedIndex > 0) {
                    const selectedOption = hiddenSelect.options[hiddenSelect.selectedIndex];
                    selectedDialingCode = selectedOption ? selectedOption.dataset.countryCode : '';
                }
            }
            
            // Convert dialing code to ISO country code for libphonenumber
            const countryCode = this.getCountryFromDialingCode(selectedDialingCode);
            
            // Get phone type preference from data attribute (mobile, fixed_line, etc.)
            const phoneType = phoneField.dataset.phoneType || 'mobile';
            
            // Get example phone number for placeholder with specified type
            const exampleNumber = this.getExamplePhoneNumber(countryCode, phoneType);
            
            // Update placeholder to show country code + line break + example
            if (exampleNumber && phoneField.dataset.phoneUpdatePlaceholder !== 'false') {
                let cleanDialingCode = selectedDialingCode;
                if (cleanDialingCode && !cleanDialingCode.startsWith('+')) {
                    cleanDialingCode = '+' + cleanDialingCode;
                }
                const countryCodePrefix = cleanDialingCode ? cleanDialingCode + '\n' : '';
                phoneField.placeholder = countryCodePrefix + exampleNumber;
            }
            
            // Store current format info on field
            phoneField._currentCountryCode = countryCode;
            phoneField._currentDialingCode = selectedDialingCode;
            phoneField._currentPhoneType = phoneType;
            phoneField._asYouType = countryCode ? new AsYouType(countryCode) : new AsYouType();
            
            // Remove existing phone formatting listeners
            if (phoneField._phoneFormatHandler) {
                phoneField.removeEventListener('input', phoneField._phoneFormatHandler);
            }
            
            // Add new formatting listener
            phoneField._phoneFormatHandler = (e) => {
                this.formatPhoneInputWithLibphonenumber(phoneField);
            };
            
            phoneField.addEventListener('input', phoneField._phoneFormatHandler);
            
            // Inject country code into field value if not already present
            if (selectedDialingCode) {
                this.injectCountryCodeIntoPhoneField(phoneField, selectedDialingCode);
            }
            
            // Format current value if it exists
            if (phoneField.value) {
                this.formatPhoneInputWithLibphonenumber(phoneField);
            }
            
            this.triggerCustomEvent(phoneField, 'phoneFormatChanged', {
                countryCode: countryCode,
                dialingCode: selectedDialingCode,
                phoneType: phoneType,
                placeholder: exampleNumber
            });
        },

        // Inject country code into phone field
        injectCountryCodeIntoPhoneField: function(field, dialingCode) {
            // Ensure dialingCode starts with + and is properly formatted
            let cleanDialingCode = dialingCode;
            if (!cleanDialingCode.startsWith('+')) {
                cleanDialingCode = '+' + cleanDialingCode;
            }
            
            const countryCodePrefix = cleanDialingCode + '\n';
            const currentValue = field.value;
            
            // Check if country code is already present
            if (!currentValue.startsWith(cleanDialingCode)) {
                // Extract any existing phone number part (after a newline if present)
                let existingPhonePart = '';
                if (currentValue.includes('\n')) {
                    // If there's already a newline, get everything after the first newline
                    existingPhonePart = currentValue.split('\n').slice(1).join('\n');
                } else if (currentValue && !currentValue.startsWith('+')) {
                    // If there's existing content that doesn't start with +, preserve it
                    existingPhonePart = currentValue;
                }
                
                // Set the new value with country code + line break + existing phone part
                field.value = countryCodePrefix + existingPhonePart;
                
                // Position cursor after the line break
                setTimeout(() => {
                    const newlinePos = field.value.indexOf('\n') + 1;
                    field.setSelectionRange(newlinePos, newlinePos);
                }, 0);
            }
        },

        // Format phone input using libphonenumber
        formatPhoneInputWithLibphonenumber: function(field) {
            const currentValue = field.value;
            const cursorPos = field.selectionStart;
            
            // Check if value contains country code prefix (before newline)
            const hasCountryCodePrefix = currentValue.includes('\n') && currentValue.startsWith('+');
            let countryCodePrefix = '';
            let phoneNumberPart = currentValue;
            
            if (hasCountryCodePrefix) {
                const parts = currentValue.split('\n');
                countryCodePrefix = parts[0] + '\n';
                phoneNumberPart = parts.slice(1).join('\n');
            }
            
            // Reset the AsYouType formatter for fresh formatting
            if (field._currentCountryCode) {
                field._asYouType = new AsYouType(field._currentCountryCode);
            } else {
                field._asYouType = new AsYouType();
            }
            
            // Remove all non-digit characters from phone number part only
            const digitsOnly = phoneNumberPart.replace(/\D/g, '');
            
            // Format using AsYouType
            let formattedPhoneNumber = '';
            for (let i = 0; i < digitsOnly.length; i++) {
                formattedPhoneNumber = field._asYouType.input(digitsOnly[i]);
            }
            
            // Combine country code prefix with formatted phone number
            const finalFormattedValue = countryCodePrefix + formattedPhoneNumber;
            
            // Update field value if changed
            if (field.value !== finalFormattedValue) {
                const oldLength = field.value.length;
                field.value = finalFormattedValue;
                
                // Restore cursor position accounting for formatting changes
                const newLength = finalFormattedValue.length;
                let newCursorPos = cursorPos;
                
                // If cursor is in the phone number part (after newline), adjust position
                if (hasCountryCodePrefix && cursorPos > countryCodePrefix.length) {
                    const phonePartOldLength = currentValue.length - countryCodePrefix.length;
                    const phonePartNewLength = formattedPhoneNumber.length;
                    const lengthDiff = phonePartNewLength - phonePartOldLength;
                    newCursorPos = Math.max(countryCodePrefix.length, Math.min(cursorPos + lengthDiff, finalFormattedValue.length));
                }
                
                // Set cursor position after a brief delay to ensure it takes effect
                setTimeout(() => {
                    field.setSelectionRange(newCursorPos, newCursorPos);
                }, 0);
                
                this.triggerCustomEvent(field, 'phoneFormatted', {
                    countryCode: field._currentCountryCode,
                    dialingCode: field._currentDialingCode,
                    rawValue: digitsOnly,
                    formattedValue: finalFormattedValue
                });
            }
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
        },

        // Google Places Autocomplete
        setupGooglePlaces: function(field) {
            // Check if Google Places API is loaded
            if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
                console.warn('Google Places API not loaded. Please include: <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>');
                return;
            }

            // Configuration options
            const options = {
                types: field.dataset.placesTypes ? field.dataset.placesTypes.split(',') : ['address'],
                componentRestrictions: field.dataset.placesCountries ? 
                    { country: field.dataset.placesCountries.split(',') } : undefined,
                fields: ['address_components', 'formatted_address', 'geometry', 'name']
            };

            // Initialize autocomplete
            const autocomplete = new google.maps.places.Autocomplete(field, options);

            // Handle place selection
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                
                if (!place.address_components) {
                    console.warn('No address components found for selected place');
                    return;
                }

                // Populate related fields if enabled
                if (field.dataset.populateFields === 'true') {
                    this.populateAddressFields(place, field);
                }

                // Trigger custom event
                this.triggerCustomEvent(field, 'placeSelected', {
                    place: place,
                    formattedAddress: place.formatted_address,
                    addressComponents: place.address_components
                });
            });

            // Store autocomplete instance for later use
            field._googleAutocomplete = autocomplete;

            this.triggerCustomEvent(field, 'googlePlacesSetup', {
                options: options
            });
        },

        // Populate address fields based on Google Places selection
        populateAddressFields: function(place, sourceField) {
            const form = sourceField.closest('form');
            if (!form) return;

            // Create address component map
            const addressMap = {};
            place.address_components.forEach(component => {
                const types = component.types;
                types.forEach(type => {
                    addressMap[type] = {
                        long_name: component.long_name,
                        short_name: component.short_name
                    };
                });
            });

            // Find and populate fields with address component data attributes
            const fieldsToPopulate = form.querySelectorAll('[data-address-component]');
            
            fieldsToPopulate.forEach(targetField => {
                const componentTypes = targetField.dataset.addressComponent.split(',');
                let value = '';

                // Try each component type until we find a match
                for (const componentType of componentTypes) {
                    const trimmedType = componentType.trim();
                    if (addressMap[trimmedType]) {
                        // Use short_name for states/countries, long_name for others
                        if (trimmedType === 'administrative_area_level_1' || trimmedType === 'country') {
                            value = targetField.dataset.useFullName === 'true' ? 
                                addressMap[trimmedType].long_name : 
                                addressMap[trimmedType].short_name;
                        } else {
                            value = addressMap[trimmedType].long_name;
                        }
                        break;
                    }
                }

                // Special handling for combined fields (e.g., street number + route)
                if (componentTypes.includes('street_number') && componentTypes.includes('route')) {
                    const streetNumber = addressMap['street_number']?.long_name || '';
                    const route = addressMap['route']?.long_name || '';
                    value = `${streetNumber} ${route}`.trim();
                }

                // Populate the field
                if (value) {
                    if (targetField.tagName === 'SELECT') {
                        this.populateSelectField(targetField, value, addressMap);
                    } else {
                        targetField.value = value;
                        // Trigger input event for any listeners
                        const inputEvent = new Event('input', { bubbles: true });
                        targetField.dispatchEvent(inputEvent);
                    }
                }
            });

            this.triggerCustomEvent(sourceField, 'addressFieldsPopulated', {
                addressMap: addressMap,
                populatedFields: fieldsToPopulate.length
            });
        },

        // Populate select fields (like country/state dropdowns)
        populateSelectField: function(selectField, value, addressMap) {
            // For country fields with our country code data
            if (selectField.dataset.countryCode === 'true') {
                const countryCode = addressMap['country']?.short_name;
                if (countryCode) {
                    // Find option by country code
                    const options = selectField.querySelectorAll('option');
                    for (const option of options) {
                        if (option.dataset.countryName === countryCode || 
                            option.textContent.includes(countryCode) ||
                            option.value.includes(countryCode)) {
                            selectField.value = option.value;
                            break;
                        }
                    }
                }
                return;
            }

            // For state fields
            if (selectField.dataset.stateName === 'true') {
                const stateCode = addressMap['administrative_area_level_1']?.short_name;
                const stateName = addressMap['administrative_area_level_1']?.long_name;
                
                // Try to find existing option
                const options = selectField.querySelectorAll('option');
                let optionFound = false;
                
                for (const option of options) {
                    if (option.value === stateCode || 
                        option.value === stateName ||
                        option.textContent.includes(stateCode) ||
                        option.textContent.includes(stateName)) {
                        selectField.value = option.value;
                        optionFound = true;
                        break;
                    }
                }

                // If no option found, add new option
                if (!optionFound && (stateCode || stateName)) {
                    const newOption = document.createElement('option');
                    newOption.value = stateCode || stateName;
                    newOption.textContent = stateName && stateCode ? `${stateName} (${stateCode})` : (stateName || stateCode);
                    selectField.appendChild(newOption);
                    selectField.value = newOption.value;
                }
                return;
            }

            // For other select fields, try to find matching option
            const options = selectField.querySelectorAll('option');
            for (const option of options) {
                if (option.value === value || option.textContent.trim() === value) {
                    selectField.value = option.value;
                    break;
                }
            }
        },

        // Postal code detection (fallback if Google Places not used)
        setupPostalCodeDetection: function(field) {
            // This would be implemented if needed as a fallback
            // For now, we'll focus on Google Places as the primary method
            console.log('Postal code detection - use Google Places for better accuracy');
        },

        // State name population (can work with Google Places or postal code)
        setupStateNameField: function(field) {
            // This field will be populated by Google Places autocomplete
            // Mark it as ready for population
            field.classList.add('wf-state-field');
            
            this.triggerCustomEvent(field, 'stateFieldSetup', {
                ready: true
            });
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