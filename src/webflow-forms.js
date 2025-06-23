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
        version: '1.2.0',
        
        // Configuration options
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
            branchingRules: new Map(),
            selectedBranch: null,
            branchHistory: [], // Track branching decisions for back navigation
            skipHistory: [], // Track skip navigation for analytics
            validationErrors: new Map(), // Track validation errors for each field
            radioGroups: null // Added for radio group validation
        },

        // Clear caches (useful for debugging)
        clearCaches: function() {
            this.countryDataCache = null;
            this.phoneFormatCache.clear();
            this.branchingState.conditionalSteps.clear();
            this.branchingState.branchingRules.clear();
            this.branchingState.stepHistory = [];
            this.branchingState.validationErrors.clear();
        },

        // Get flag emoji for country ISO code
        getCountryFlag: function(isoCode) {
            if (!isoCode || isoCode.length !== 2) return '';
            
            // Convert ISO country code to flag emoji
            // Flag emojis are created by combining regional indicator symbols
            const codePoints = isoCode.toUpperCase().split('').map(char => 
                0x1F1E6 + char.charCodeAt(0) - 'A'.charCodeAt(0)
            );
            return String.fromCodePoint(...codePoints);
        },

        // Generate country data from libphonenumber with proper country names
        getCountryCodes: function() {
            // Return cached data if available
            if (this.countryDataCache) {
                return this.countryDataCache;
            }

            // Check if libphonenumber is properly loaded
            if (typeof getCountries !== 'function' || typeof getCountryCallingCode !== 'function') {
                console.warn('libphonenumber not fully loaded, using fallback data');
                return [
                    { name: 'United States', countryCode: '+1', isoCode: 'US', flag: this.getCountryFlag('US') },
                    { name: 'United Kingdom', countryCode: '+44', isoCode: 'GB', flag: this.getCountryFlag('GB') }
                ];
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
                    'AW': 'Aruba',
                    'AX': 'Åland Islands',
                    'CC': 'Cocos Islands',
                    'CX': 'Christmas Island',
                    'SH': 'Saint Helena',
                    'TA': 'Tristan da Cunha'
                };

                for (const countryCode of countries) {
                    try {
                        const callingCode = getCountryCallingCode(countryCode);
                        
                        countryData.push({
                            name: countryNames[countryCode] || countryCode, // Use proper name or fall back to ISO code
                            countryCode: `+${callingCode}`, // Dialing code (e.g., "+1", "+44", "+33")
                            isoCode: countryCode, // Keep ISO code for reference
                            flag: this.getCountryFlag(countryCode) // Flag emoji
                        });
                    } catch (error) {
                        // Log which country caused the error and skip it
                        console.warn(`Country ${countryCode} caused an error and was skipped:`, error);
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
                    { name: 'United States', countryCode: '+1', isoCode: 'US', flag: this.getCountryFlag('US') },
                    { name: 'United Kingdom', countryCode: '+44', isoCode: 'GB', flag: this.getCountryFlag('GB') }
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
                
                // Priority mapping for shared dialing codes (main country first)
                const priorityMapping = {
                    '1': ['US', 'CA'],      // +1: US first, then Canada
                    '7': ['RU', 'KZ'],      // +7: Russia first, then Kazakhstan
                    '33': ['FR', 'MC'],     // +33: France first, then Monaco
                    '39': ['IT', 'SM', 'VA'], // +39: Italy first, then San Marino, Vatican
                    '44': ['GB', 'GG', 'IM', 'JE'], // +44: UK first, then dependencies
                    '45': ['DK', 'FO', 'GL'], // +45: Denmark first, then Faroe Islands, Greenland
                    '47': ['NO', 'SJ'],     // +47: Norway first, then Svalbard
                    '61': ['AU', 'CC', 'CX'], // +61: Australia first, then Cocos Islands, Christmas Island
                    '212': ['MA', 'EH'],    // +212: Morocco first, then Western Sahara
                    '262': ['RE', 'YT'],    // +262: Réunion first, then Mayotte
                    '290': ['SH', 'TA'],    // +290: Saint Helena first, then Tristan da Cunha
                    '358': ['FI', 'AX'],    // +358: Finland first, then Åland Islands
                    '590': ['GP', 'BL', 'MF'], // +590: Guadeloupe first
                    '596': ['MQ'],          // +596: Martinique
                    '599': ['CW', 'BQ']     // +599: Curaçao first, then Caribbean Netherlands
                };
                
                // Check if we have a priority mapping for this dialing code
                if (priorityMapping[numericCode]) {
                    for (const priorityCountry of priorityMapping[numericCode]) {
                        if (countries.includes(priorityCountry)) {
                            const countryCallingCode = getCountryCallingCode(priorityCountry);
                            if (countryCallingCode === numericCode) {
                                return priorityCountry;
                            }
                        }
                    }
                }
                
                // Fallback: find the first country that matches this dialing code
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
                },
                'FI': {
                    mobile: '050 123 4567',
                    fixed_line: '09 1234 5678',
                    toll_free: '0800 123 456',
                    premium_rate: '0600 123 456'
                },
                'AX': {
                    mobile: '050 123 4567',
                    fixed_line: '018 12345',
                    toll_free: '0800 123 456',
                    premium_rate: '0600 123 456'
                },
                'CC': {
                    mobile: '0412 345 678',
                    fixed_line: '08 9162 1234',
                    toll_free: '1800 123 456',
                    premium_rate: '1900 123 456'
                },
                'CX': {
                    mobile: '0412 345 678',
                    fixed_line: '08 9164 1234',
                    toll_free: '1800 123 456',
                    premium_rate: '1900 123 456'
                },
                'SH': {
                    mobile: '1234',
                    fixed_line: '1234',
                    toll_free: '1234',
                    premium_rate: '1234'
                },
                'TA': {
                    mobile: '1234',
                    fixed_line: '1234',
                    toll_free: '1234',
                    premium_rate: '1234'
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
                'googlePlaces', 'addressComponent', 'postalCode', 'stateName', 'populateFields'
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
            
            // Manual edit tracking for address fields
            if (field.dataset.addressComponent || field.dataset.googlePlaces === 'true') {
                this.setupManualEditTracking(field);
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
            console.log('Setting up country code select for:', field.id || field.name);
            
            // Validate the field
            if (!field || field.tagName !== 'SELECT') {
                console.error('Invalid field passed to setupCountryCodeSelect:', field);
                return;
            }

            // Prevent duplicate setup
            if (field._countryCodeSetup) {
                console.log('Country code select already setup for field:', field.id || field.name);
                return;
            }
            
            // Mark as setup to prevent duplicates
            field._countryCodeSetup = true;

            try {
                // Check if searchable option is enabled
                const isSearchable = field.dataset.countrySearchable !== 'false'; // Default to true
                
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

        // Create standard (non-searchable) country select
        createStandardCountrySelect: function(field) {
            console.log('Creating standard country select');
            
            try {
                // Clear existing options except placeholder
                const existingOptions = field.querySelectorAll('option');
                const placeholderOption = existingOptions[0];
                
                // Clear all options
                field.innerHTML = '';
                
                // Re-add placeholder if it existed and is actually a placeholder
                if (placeholderOption && 
                    (placeholderOption.value === '' || 
                     placeholderOption.textContent.trim() === '' || 
                     placeholderOption.hasAttribute('disabled') ||
                     placeholderOption.hasAttribute('selected'))) {
                    field.appendChild(placeholderOption);
                }
                
                this.populateCountryOptions(field);
                
                console.log(`Standard country select created with ${field.options.length} options`);
                
            } catch (error) {
                console.error('Error creating standard country select:', error);
            }
        },

        // Create searchable country select
        createSearchableCountrySelect: function(field) {
            console.log('Creating searchable country select');
            
            try {
                // Store original field properties
                const fieldName = field.name;
                const fieldId = field.id;
                const fieldClass = field.className;
                const isRequired = field.required;
                // Get placeholder from disabled option, original field placeholder, or leave empty
                const placeholder = field.querySelector('option[disabled]')?.textContent || field.placeholder || '';
            
            // Create container for proper dropdown positioning (but without problematic styling)
            const container = document.createElement('div');
            // Use data attribute instead of class for identification
            container.dataset.countrySelectContainer = 'true';
            // Only add positioning - no width or other layout styles
            container.style.position = 'relative';
            
            // Create search input to replace the original field
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = fieldClass; // Keep original classes only
            searchInput.placeholder = placeholder;
            searchInput.autocomplete = 'off';
            if (fieldId) searchInput.id = fieldId + '_search';
            
            // Add a data attribute for identification instead of a class
            searchInput.dataset.countrySearch = 'true';
            
            // Copy all data attributes from original field to search input
            for (const key in field.dataset) {
                if (field.dataset.hasOwnProperty(key)) {
                    searchInput.dataset[key] = field.dataset[key];
                }
            }
            
            // Create hidden select for form submission
            const hiddenSelect = document.createElement('select');
            hiddenSelect.name = fieldName;
            hiddenSelect.required = isRequired;
            hiddenSelect.style.display = 'none';
            if (fieldId) hiddenSelect.id = fieldId;
            
            // Copy all data attributes from original field to hidden select
            for (const key in field.dataset) {
                if (field.dataset.hasOwnProperty(key)) {
                    hiddenSelect.dataset[key] = field.dataset[key];
                }
            }
            
            // Create dropdown list
            const dropdownList = document.createElement('div');
            // Use data attribute instead of class for identification
            dropdownList.dataset.countryDropdown = 'true';
            // Minimal styling - dropdown matches input width dynamically
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
            
            console.log(`Searchable country select created with ${countries.length} countries`);
            
        } catch (error) {
            console.error('Error creating searchable country select:', error);
            // Fallback to standard select
            this.createStandardCountrySelect(field);
        }
        },

        // Get formatted countries data
        getFormattedCountries: function(field) {
            const displayFormat = field.dataset.countryFormat || 'flag-code';
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
                    case 'flag-code':
                        displayText = `${country.flag} ${country.countryCode}`;
                        break;
                    case 'name-code':
                        displayText = `${country.name} (${country.countryCode})`;
                        break;
                    case 'flag-name-code':
                        displayText = `${country.flag} ${country.name} (${country.countryCode})`;
                        break;
                    default:
                        displayText = `${country.flag} ${country.countryCode}`;
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
                // Use data attribute instead of class for identification
                option.dataset.countryOption = 'true';
                option.textContent = country.displayText;
                // Minimal styling - let Webflow handle the rest
                option.style.cssText = `
                    padding: 8px 12px;
                    cursor: pointer;
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
                    option.style.backgroundColor = '';
                });
                
                // Click handler is now managed by event delegation in attachSearchableEvents
                
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
            // Function to sync dropdown width with input
            const syncDropdownWidth = () => {
                // The dropdown uses width: 100% and is positioned relative to the container,
                // so it automatically matches the input width. No additional action needed.
            };
            
            // Watch for input size changes and sync dropdown width
            if (window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(() => {
                    syncDropdownWidth();
                });
                resizeObserver.observe(searchInput);
            }
            
            // Show/hide dropdown on focus/blur
            searchInput.addEventListener('focus', () => {
                syncDropdownWidth(); // Ensure width is synced when dropdown opens
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
                
                // Check if user typed a country code directly
                this.detectTypedCountryCode(searchInput, hiddenSelect, countries, originalField);
                
                // Clear selection if input doesn't match
                if (hiddenSelect.value && !searchInput.value) {
                    hiddenSelect.value = '';
                    this.triggerCustomEvent(searchInput, 'countrySelectionCleared');
                }
            });
            
            // Also detect country codes when user leaves the field
            searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    this.detectTypedCountryCode(searchInput, hiddenSelect, countries, originalField, true);
                }, 100); // Small delay to allow for click events
            });
            
            // Handle keyboard navigation
            searchInput.addEventListener('keydown', (e) => {
                this.handleCountryKeyboardNavigation(e, dropdownList, searchInput, hiddenSelect, originalField);
            });
            
            // Add click handlers to dropdown options - THIS WAS MISSING!
            dropdownList.addEventListener('click', (e) => {
                const option = e.target.closest('[data-country-option="true"]');
                if (option) {
                    this.selectCountryOption(option, searchInput, hiddenSelect, dropdownList, originalField);
                }
            });
        },

        // Detect if user typed a country code directly and update phone formatting
        detectTypedCountryCode: function(searchInput, hiddenSelect, countries, originalField, onBlur = false) {
            const inputValue = searchInput.value.trim();
            if (!inputValue) return;
            
            // Check if input looks like a country code (starts with + or is numeric)
            const isCountryCodePattern = /^(\+?\d{1,4})$/.test(inputValue);
            
            if (isCountryCodePattern) {
                // Normalize the input (add + if missing)
                let normalizedCode = inputValue.startsWith('+') ? inputValue : '+' + inputValue;
                
                // Find matching country
                const matchingCountry = countries.find(country => 
                    country.countryCode === normalizedCode
                );
                
                if (matchingCountry) {
                    // Update hidden select to trigger phone formatting
                    hiddenSelect.value = matchingCountry.value;
                    
                    // If on blur, keep the typed country code in the field
                    if (onBlur) {
                        searchInput.value = normalizedCode;
                    }
                    
                    // Trigger change event for phone formatting
                    const changeEvent = new Event('change', { bubbles: true });
                    hiddenSelect.dispatchEvent(changeEvent);
                    
                    // Trigger custom event
                    this.triggerCustomEvent(searchInput, 'countryCodeTyped', {
                        value: matchingCountry.value,
                        name: matchingCountry.name,
                        code: matchingCountry.countryCode,
                        flag: matchingCountry.flag,
                        typedValue: normalizedCode
                    });
                    
                    console.log('Country code detected:', normalizedCode, 'matched to:', matchingCountry.name);
                }
            }
        },

        // Filter country options based on search
        filterCountryOptions: function(searchTerm, dropdownList, countries) {
            const options = dropdownList.querySelectorAll('[data-country-option="true"]');
            const search = searchTerm.toLowerCase();
            
            options.forEach((option, index) => {
                const country = countries[index];
                const matches = country.searchText.includes(search);
                option.style.display = matches ? 'block' : 'none';
            });
        },

        // Handle keyboard navigation
        handleCountryKeyboardNavigation: function(e, dropdownList, searchInput, hiddenSelect, originalField) {
            const visibleOptions = Array.from(dropdownList.querySelectorAll('[data-country-option="true"]'))
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
                
                // Trigger custom event
                this.triggerCustomEvent(field, 'countryCodeSetup', { 
                    searchable: false,
                    countriesCount: countries.length 
                });
                
            } catch (error) {
                console.error('Error populating country options:', error);
            }
        },

        // Setup dynamic phone formatting based on country selection
        setupDynamicPhoneFormatting: function(field) {
            // Find the associated country code selector
            const countrySelector = this.findCountryCodeSelector(field);
            
            if (!countrySelector) {
                console.warn('Phone format field found but no country code selector detected');
                return;
            }
            
            // Prevent duplicate setup
            if (field._phoneFormatSetup) {
                console.log('Phone formatting already setup for field:', field.id || field.name);
                return;
            }
            
            // Mark as setup to prevent duplicates
            field._phoneFormatSetup = true;
            
            // Initialize phone fields array on country selector if not exists
            if (!countrySelector._phoneFields) {
                countrySelector._phoneFields = [];
            }
            
            // Only add if not already in the array
            if (!countrySelector._phoneFields.includes(field)) {
                countrySelector._phoneFields.push(field);
            }
            
            // Set initial format if country is already selected
            this.updatePhoneFormat(field, countrySelector);
            
            // Listen for country changes - but only add listener once
            if (!countrySelector._phoneFormatListenerAdded) {
                const updateFormat = () => {
                    // Use a small delay to ensure DOM updates are complete
                    setTimeout(() => {
                        if (countrySelector._phoneFields) {
                            countrySelector._phoneFields.forEach(phoneField => {
                                this.updatePhoneFormat(phoneField, countrySelector);
                            });
                        }
                    }, 10);
                };
                
                // Handle both standard select and searchable country selects
                if (countrySelector.tagName === 'SELECT') {
                    countrySelector.addEventListener('change', updateFormat);
                } else if (countrySelector.dataset.countrySearch === 'true') {
                    // For searchable country selects, listen to the hidden select
                    const hiddenSelect = countrySelector.parentNode.querySelector('select[style*="display: none"]');
                    if (hiddenSelect) {
                        hiddenSelect.addEventListener('change', updateFormat);
                    }
                }
                
                // Mark listener as added
                countrySelector._phoneFormatListenerAdded = true;
            }
            
            // Also listen for custom country selection events - but only once per field
            if (!field._customEventListenerAdded) {
                document.addEventListener('webflowField:countrySelected', (e) => {
                    if (e.detail.field === countrySelector || 
                        (countrySelector._phoneFields && countrySelector._phoneFields.includes(field))) {
                        this.updatePhoneFormat(field, countrySelector);
                    }
                });
                field._customEventListenerAdded = true;
            }
            
            this.triggerCustomEvent(field, 'phoneFormatSetup', { 
                countrySelector: countrySelector 
            });
        },

        // Find the country code selector for a phone field
        findCountryCodeSelector: function(phoneField) {
            const form = phoneField.closest('form');
            if (!form) return null;
            
            // First, check if there's a specific reference in the phone field's data attribute
            const countryFieldRef = phoneField.dataset.phoneCountryField;
            if (countryFieldRef) {
                return form.querySelector(countryFieldRef);
            }
            
            // Look for country code selectors in the same form using data attributes only
            // First check for searchable country selects
            let countrySelector = form.querySelector('[data-country-search="true"]');
            if (countrySelector) return countrySelector;
            
            // Then check for standard country selects
            countrySelector = form.querySelector('select[data-country-code="true"]');
            if (countrySelector) return countrySelector;
            
            return null;
        },

        // Helper function to check if field names are related (for phone/country field matching)
        areFieldNamesRelated: function(name1, name2) {
            if (!name1 || !name2) return false;
            
            // Convert to lowercase for comparison
            name1 = name1.toLowerCase();
            name2 = name2.toLowerCase();
            
            // Extract base names by removing common prefixes/suffixes
            const cleanName1 = name1.replace(/^(contact-?|user-?|customer-?)/i, '').replace(/(-?phone|-?tel|-?number)$/i, '');
            const cleanName2 = name2.replace(/^(contact-?|user-?|customer-?)/i, '').replace(/(-?country|-?code)$/i, '');
            
            // Check if they share a common base (e.g., "Contact-Phone" and "Contact-Country-Code" both have "Contact")
            return cleanName1 === cleanName2 || 
                   name1.includes(cleanName2) || 
                   name2.includes(cleanName1);
        },

        // Update phone field formatting based on selected country
        updatePhoneFormat: function(phoneField, countrySelector) {
            let selectedDialingCode = '';
            
            // Get selected country dialing code
            if (countrySelector.tagName === 'SELECT') {
                const selectedOption = countrySelector.options[countrySelector.selectedIndex];
                selectedDialingCode = selectedOption ? selectedOption.dataset.countryCode : '';
            } else if (countrySelector.dataset.countrySearch === 'true') {
                // For searchable selects, first try hidden select
                const hiddenSelect = countrySelector.parentNode.querySelector('select[style*="display: none"]');
                if (hiddenSelect && hiddenSelect.selectedIndex > 0) {
                    const selectedOption = hiddenSelect.options[hiddenSelect.selectedIndex];
                    selectedDialingCode = selectedOption ? selectedOption.dataset.countryCode : '';
                } else {
                    // If no selection in hidden select, check if user typed a country code directly
                    const searchInputValue = countrySelector.value.trim();
                    const isCountryCodePattern = /^(\+?\d{1,4})$/.test(searchInputValue);
                    if (isCountryCodePattern) {
                        selectedDialingCode = searchInputValue.startsWith('+') ? searchInputValue : '+' + searchInputValue;
                    }
                }
            }
            
            // Convert dialing code to ISO country code for libphonenumber
            const countryCode = this.getCountryFromDialingCode(selectedDialingCode);
            
            // Get phone type preference from data attribute (mobile, fixed_line, etc.)
            const phoneType = phoneField.dataset.phoneType || 'mobile';
            
            // Get example phone number for placeholder with specified type
            const exampleNumber = this.getExamplePhoneNumber(countryCode, phoneType);
            
            // Update placeholder to show country code + space + example (only if injection enabled)
            if (exampleNumber && phoneField.dataset.phoneUpdatePlaceholder !== 'false') {
                const injectCountryCode = phoneField.dataset.phoneInjectCountryCode === 'true';
                
                if (injectCountryCode) {
                    let cleanDialingCode = selectedDialingCode;
                    if (cleanDialingCode && !cleanDialingCode.startsWith('+')) {
                        cleanDialingCode = '+' + cleanDialingCode;
                    }
                    const countryCodePrefix = cleanDialingCode ? cleanDialingCode + ' ' : '';
                    phoneField.placeholder = countryCodePrefix + exampleNumber;
                } else {
                    // For national format, just show the example without country code
                    phoneField.placeholder = exampleNumber;
                }
            }
            
            // Store current format info on field
            phoneField._currentCountryCode = countryCode;
            phoneField._currentDialingCode = selectedDialingCode;
            phoneField._currentPhoneType = phoneType;
            phoneField._asYouType = countryCode ? new AsYouType(countryCode) : new AsYouType();
            
            // Set max length based on country's phone format
            this.setPhoneMaxLength(phoneField, countryCode, selectedDialingCode);
            
            // Remove existing phone formatting listeners
            if (phoneField._phoneFormatHandler) {
                phoneField.removeEventListener('input', phoneField._phoneFormatHandler);
            }
            
            // Add new formatting listener
            phoneField._phoneFormatHandler = (e) => {
                this.formatPhoneInputWithLibphonenumber(phoneField);
            };
            
            phoneField.addEventListener('input', phoneField._phoneFormatHandler);
            
            // Inject country code into field value if not already present (unless disabled)
            if (selectedDialingCode && phoneField.dataset.phoneInjectCountryCode === 'true') {
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

        // Set max length for phone field based on country format
        setPhoneMaxLength: function(phoneField, countryCode, selectedDialingCode) {
            const injectCountryCode = phoneField.dataset.phoneInjectCountryCode === 'true';
            
            // Get the max length for this country
            const maxLength = this.getPhoneMaxLength(countryCode, injectCountryCode, selectedDialingCode);
            
            if (maxLength > 0) {
                phoneField.setAttribute('maxlength', maxLength);
                console.log(`Set max length for ${countryCode || 'unknown'} to ${maxLength} characters`);
            } else {
                // Remove maxlength if we can't determine it
                phoneField.removeAttribute('maxlength');
            }
        },

        // Get max length for phone number based on country
        getPhoneMaxLength: function(countryCode, injectCountryCode, selectedDialingCode) {
            if (!countryCode) return 0;
            
            // Comprehensive country-specific max lengths (including formatting characters)
            const maxLengths = {
                // North America
                'US': injectCountryCode ? 17 : 14,  // "+1 (555) 123-4567" vs "(555) 123-4567"
                'CA': injectCountryCode ? 17 : 14,  // "+1 (555) 123-4567" vs "(555) 123-4567"
                'MX': injectCountryCode ? 17 : 12,  // "+52 55 1234 5678" vs "55 1234 5678"
                'GT': injectCountryCode ? 16 : 11,  // "+502 1234 5678" vs "1234 5678"
                'BZ': injectCountryCode ? 15 : 10,  // "+501 123 4567" vs "123 4567"
                'SV': injectCountryCode ? 16 : 11,  // "+503 1234 5678" vs "1234 5678"
                'HN': injectCountryCode ? 16 : 11,  // "+504 1234 5678" vs "1234 5678"
                'NI': injectCountryCode ? 16 : 11,  // "+505 1234 5678" vs "1234 5678"
                'CR': injectCountryCode ? 16 : 11,  // "+506 1234 5678" vs "1234 5678"
                'PA': injectCountryCode ? 16 : 11,  // "+507 1234 5678" vs "1234 5678"
                
                // South America
                'BR': injectCountryCode ? 20 : 15,  // "+55 (11) 99999-9999" vs "(11) 99999-9999"
                'AR': injectCountryCode ? 17 : 12,  // "+54 11 1234-5678" vs "11 1234-5678"
                'CL': injectCountryCode ? 14 : 9,   // "+56 9 1234 5678" vs "9 1234 5678"
                'CO': injectCountryCode ? 16 : 11,  // "+57 321 1234567" vs "321 1234567"
                'PE': injectCountryCode ? 15 : 10,  // "+51 987 654 321" vs "987 654 321"
                'VE': injectCountryCode ? 16 : 11,  // "+58 412-1234567" vs "412-1234567"
                'EC': injectCountryCode ? 16 : 11,  // "+593 99 123 4567" vs "99 123 4567"
                'BO': injectCountryCode ? 16 : 11,  // "+591 7 123 4567" vs "7 123 4567"
                'PY': injectCountryCode ? 16 : 11,  // "+595 981 123456" vs "981 123456"
                'UY': injectCountryCode ? 16 : 11,  // "+598 99 123 456" vs "99 123 456"
                'GY': injectCountryCode ? 15 : 10,  // "+592 123 4567" vs "123 4567"
                'SR': injectCountryCode ? 15 : 10,  // "+597 123 4567" vs "123 4567"
                'GF': injectCountryCode ? 18 : 13,  // "+594 694 12 34 56" vs "694 12 34 56"
                
                // Europe
                'GB': injectCountryCode ? 18 : 13,  // "+44 07911 123456" vs "07911 123456"
                'IE': injectCountryCode ? 16 : 11,  // "+353 087 1234567" vs "087 1234567"
                'FR': injectCountryCode ? 19 : 14,  // "+33 06 12 34 56 78" vs "06 12 34 56 78"
                'DE': injectCountryCode ? 19 : 15,  // "+49 0151 12345678" vs "0151 12345678"
                'IT': injectCountryCode ? 17 : 12,  // "+39 123 456 7890" vs "123 456 7890"
                'ES': injectCountryCode ? 16 : 11,  // "+34 123 45 67 89" vs "123 45 67 89"
                'PT': injectCountryCode ? 16 : 11,  // "+351 912 345 678" vs "912 345 678"
                'NL': injectCountryCode ? 16 : 11,  // "+31 06 12345678" vs "06 12345678"
                'BE': injectCountryCode ? 16 : 11,  // "+32 0123 45 67 89" vs "0123 45 67 89"
                'LU': injectCountryCode ? 16 : 11,  // "+352 123 456 789" vs "123 456 789"
                'CH': injectCountryCode ? 16 : 11,  // "+41 079 123 45 67" vs "079 123 45 67"
                'AT': injectCountryCode ? 17 : 12,  // "+43 0664 1234567" vs "0664 1234567"
                'LI': injectCountryCode ? 16 : 11,  // "+423 123 45 67" vs "123 45 67"
                'MC': injectCountryCode ? 16 : 11,  // "+377 06 12 34 56 78" vs "06 12 34 56 78"
                'AD': injectCountryCode ? 15 : 10,  // "+376 312 345" vs "312 345"
                'SM': injectCountryCode ? 16 : 11,  // "+378 0549 123456" vs "0549 123456"
                'VA': injectCountryCode ? 16 : 11,  // "+379 06 698 12345" vs "06 698 12345"
                'MT': injectCountryCode ? 15 : 10,  // "+356 9999 1234" vs "9999 1234"
                'CY': injectCountryCode ? 15 : 10,  // "+357 99 123456" vs "99 123456"
                'GR': injectCountryCode ? 16 : 11,  // "+30 694 1234567" vs "694 1234567"
                'AL': injectCountryCode ? 16 : 11,  // "+355 69 123 4567" vs "69 123 4567"
                'MK': injectCountryCode ? 16 : 11,  // "+389 70 123 456" vs "70 123 456"
                'ME': injectCountryCode ? 16 : 11,  // "+382 67 123 456" vs "67 123 456"
                'RS': injectCountryCode ? 16 : 11,  // "+381 64 123 4567" vs "64 123 4567"
                'BA': injectCountryCode ? 16 : 11,  // "+387 61 123 456" vs "61 123 456"
                'HR': injectCountryCode ? 17 : 12,  // "+385 091 1234567" vs "091 1234567"
                'SI': injectCountryCode ? 17 : 12,  // "+386 031 123 456" vs "031 123 456"
                'HU': injectCountryCode ? 15 : 10,  // "+36 30 1234567" vs "30 1234567"
                'RO': injectCountryCode ? 15 : 10,  // "+40 712 345 678" vs "712 345 678"
                'BG': injectCountryCode ? 16 : 11,  // "+359 87 1234567" vs "87 1234567"
                'MD': injectCountryCode ? 16 : 11,  // "+373 69 123456" vs "69 123456"
                'UA': injectCountryCode ? 17 : 12,  // "+380 67 123 4567" vs "67 123 4567"
                'BY': injectCountryCode ? 17 : 12,  // "+375 29 123-45-67" vs "29 123-45-67"
                'RU': injectCountryCode ? 16 : 11,  // "+7 912 345-67-89" vs "912 345-67-89"
                'KZ': injectCountryCode ? 16 : 11,  // "+7 701 123 4567" vs "701 123 4567"
                'GE': injectCountryCode ? 16 : 11,  // "+995 555 123456" vs "555 123456"
                'AM': injectCountryCode ? 16 : 11,  // "+374 77 123456" vs "77 123456"
                'AZ': injectCountryCode ? 16 : 11,  // "+994 50 123 45 67" vs "50 123 45 67"
                'CZ': injectCountryCode ? 17 : 12,  // "+420 123 456 789" vs "123 456 789"
                'SK': injectCountryCode ? 17 : 12,  // "+421 905 123 456" vs "905 123 456"
                'PL': injectCountryCode ? 16 : 11,  // "+48 512 345 678" vs "512 345 678"
                'LT': injectCountryCode ? 17 : 12,  // "+370 612 34567" vs "612 34567"
                'LV': injectCountryCode ? 16 : 11,  // "+371 21234567" vs "21234567"
                'EE': injectCountryCode ? 16 : 11,  // "+372 5123 4567" vs "5123 4567"
                'FI': injectCountryCode ? 16 : 11,  // "+358 050 1234567" vs "050 1234567"
                'AX': injectCountryCode ? 16 : 11,  // "+358 050 1234567" vs "050 1234567" (Åland Islands use same format as Finland)
                'SE': injectCountryCode ? 16 : 11,  // "+46 070 123 45 67" vs "070 123 45 67"
                'NO': injectCountryCode ? 13 : 8,   // "+47 12345678" vs "12345678"
                'DK': injectCountryCode ? 13 : 8,   // "+45 12345678" vs "12345678"
                'IS': injectCountryCode ? 15 : 10,  // "+354 123 4567" vs "123 4567"
                'FO': injectCountryCode ? 15 : 10,  // "+298 123456" vs "123456"
                'GL': injectCountryCode ? 15 : 10,  // "+299 12 34 56" vs "12 34 56"
                
                // Asia
                'CN': injectCountryCode ? 18 : 13,  // "+86 138 0013 8000" vs "138 0013 8000"
                'JP': injectCountryCode ? 18 : 13,  // "+81 090-1234-5678" vs "090-1234-5678"
                'KR': injectCountryCode ? 18 : 13,  // "+82 010-1234-5678" vs "010-1234-5678"
                'KP': injectCountryCode ? 16 : 11,  // "+850 191 123 4567" vs "191 123 4567"
                'MN': injectCountryCode ? 16 : 11,  // "+976 9911 1234" vs "9911 1234"
                'HK': injectCountryCode ? 14 : 9,   // "+852 9123 4567" vs "9123 4567"
                'MO': injectCountryCode ? 14 : 9,   // "+853 6123 4567" vs "6123 4567"
                'TW': injectCountryCode ? 16 : 11,  // "+886 912 345 678" vs "912 345 678"
                'IN': injectCountryCode ? 17 : 12,  // "+91 98765 43210" vs "98765 43210"
                'PK': injectCountryCode ? 16 : 11,  // "+92 300 1234567" vs "300 1234567"
                'BD': injectCountryCode ? 16 : 11,  // "+880 1712 345678" vs "1712 345678"
                'LK': injectCountryCode ? 16 : 11,  // "+94 77 123 4567" vs "77 123 4567"
                'MV': injectCountryCode ? 15 : 10,  // "+960 123 4567" vs "123 4567"
                'BT': injectCountryCode ? 15 : 10,  // "+975 17 123 456" vs "17 123 456"
                'NP': injectCountryCode ? 16 : 11,  // "+977 98 1234 5678" vs "98 1234 5678"
                'AF': injectCountryCode ? 16 : 11,  // "+93 70 123 4567" vs "70 123 4567"
                'IR': injectCountryCode ? 16 : 11,  // "+98 912 345 6789" vs "912 345 6789"
                'IQ': injectCountryCode ? 16 : 11,  // "+964 790 123 4567" vs "790 123 4567"
                'SY': injectCountryCode ? 16 : 11,  // "+963 944 567 890" vs "944 567 890"
                'LB': injectCountryCode ? 16 : 11,  // "+961 3 123 456" vs "3 123 456"
                'JO': injectCountryCode ? 16 : 11,  // "+962 79 123 4567" vs "79 123 4567"
                'PS': injectCountryCode ? 16 : 11,  // "+970 59 123 4567" vs "59 123 4567"
                'IL': injectCountryCode ? 16 : 11,  // "+972 50-123-4567" vs "50-123-4567"
                'TR': injectCountryCode ? 16 : 11,  // "+90 532 123 45 67" vs "532 123 45 67"
                'CY': injectCountryCode ? 15 : 10,  // "+357 99 123456" vs "99 123456"
                'GE': injectCountryCode ? 16 : 11,  // "+995 555 123456" vs "555 123456"
                'AM': injectCountryCode ? 16 : 11,  // "+374 77 123456" vs "77 123456"
                'AZ': injectCountryCode ? 16 : 11,  // "+994 50 123 45 67" vs "50 123 45 67"
                'KG': injectCountryCode ? 16 : 11,  // "+996 555 123456" vs "555 123456"
                'TJ': injectCountryCode ? 16 : 11,  // "+992 93 123 4567" vs "93 123 4567"
                'TM': injectCountryCode ? 16 : 11,  // "+993 65 123456" vs "65 123456"
                'UZ': injectCountryCode ? 16 : 11,  // "+998 90 123 45 67" vs "90 123 45 67"
                'TH': injectCountryCode ? 15 : 10,  // "+66 81 234 5678" vs "81 234 5678"
                'LA': injectCountryCode ? 16 : 11,  // "+856 20 123 4567" vs "20 123 4567"
                'KH': injectCountryCode ? 16 : 11,  // "+855 12 345 678" vs "12 345 678"
                'VN': injectCountryCode ? 15 : 10,  // "+84 91 234 56 78" vs "91 234 56 78"
                'MM': injectCountryCode ? 16 : 11,  // "+95 9 123 456 789" vs "9 123 456 789"
                'MY': injectCountryCode ? 15 : 10,  // "+60 12-345 6789" vs "12-345 6789"
                'SG': injectCountryCode ? 14 : 9,   // "+65 9123 4567" vs "9123 4567"
                'BN': injectCountryCode ? 15 : 10,  // "+673 123 4567" vs "123 4567"
                'ID': injectCountryCode ? 16 : 11,  // "+62 812-3456-789" vs "812-3456-789"
                'TL': injectCountryCode ? 16 : 11,  // "+670 7723 4567" vs "7723 4567"
                'PH': injectCountryCode ? 16 : 11,  // "+63 917 123 4567" vs "917 123 4567"
                
                // Middle East
                'SA': injectCountryCode ? 15 : 10,  // "+966 50 123 4567" vs "50 123 4567"
                'AE': injectCountryCode ? 15 : 10,  // "+971 50 123 4567" vs "50 123 4567"
                'QA': injectCountryCode ? 15 : 10,  // "+974 3312 3456" vs "3312 3456"
                'BH': injectCountryCode ? 15 : 10,  // "+973 3612 3456" vs "3612 3456"
                'KW': injectCountryCode ? 15 : 10,  // "+965 9123 4567" vs "9123 4567"
                'OM': injectCountryCode ? 15 : 10,  // "+968 9123 4567" vs "9123 4567"
                'YE': injectCountryCode ? 16 : 11,  // "+967 73 123 4567" vs "73 123 4567"
                
                // Africa
                'EG': injectCountryCode ? 15 : 10,  // "+20 100 123 4567" vs "100 123 4567"
                'LY': injectCountryCode ? 16 : 11,  // "+218 91 123 4567" vs "91 123 4567"
                'TN': injectCountryCode ? 15 : 10,  // "+216 20 123 456" vs "20 123 456"
                'DZ': injectCountryCode ? 16 : 11,  // "+213 55 123 4567" vs "55 123 4567"
                'MA': injectCountryCode ? 16 : 11,  // "+212 612-345678" vs "612-345678"
                'EH': injectCountryCode ? 16 : 11,  // "+212 528 123456" vs "528 123456"
                'SD': injectCountryCode ? 16 : 11,  // "+249 91 123 4567" vs "91 123 4567"
                'SS': injectCountryCode ? 16 : 11,  // "+211 91 123 4567" vs "91 123 4567"
                'ET': injectCountryCode ? 16 : 11,  // "+251 91 123 4567" vs "91 123 4567"
                'ER': injectCountryCode ? 15 : 10,  // "+291 7 123 456" vs "7 123 456"
                'DJ': injectCountryCode ? 15 : 10,  // "+253 77 123456" vs "77 123456"
                'SO': injectCountryCode ? 16 : 11,  // "+252 61 123 4567" vs "61 123 4567"
                'KE': injectCountryCode ? 16 : 11,  // "+254 712 123456" vs "712 123456"
                'UG': injectCountryCode ? 16 : 11,  // "+256 712 345678" vs "712 345678"
                'TZ': injectCountryCode ? 16 : 11,  // "+255 754 123456" vs "754 123456"
                'RW': injectCountryCode ? 16 : 11,  // "+250 788 123456" vs "788 123456"
                'BI': injectCountryCode ? 15 : 10,  // "+257 79 123456" vs "79 123456"
                'MZ': injectCountryCode ? 16 : 11,  // "+258 82 123 4567" vs "82 123 4567"
                'MW': injectCountryCode ? 16 : 11,  // "+265 99 123 4567" vs "99 123 4567"
                'ZM': injectCountryCode ? 16 : 11,  // "+260 97 123 4567" vs "97 123 4567"
                'ZW': injectCountryCode ? 16 : 11,  // "+263 77 123 4567" vs "77 123 4567"
                'BW': injectCountryCode ? 16 : 11,  // "+267 71 123 456" vs "71 123 456"
                'NA': injectCountryCode ? 16 : 11,  // "+264 81 123 4567" vs "81 123 4567"
                'ZA': injectCountryCode ? 15 : 10,  // "+27 82 123 4567" vs "82 123 4567"
                'LS': injectCountryCode ? 15 : 10,  // "+266 5012 3456" vs "5012 3456"
                'SZ': injectCountryCode ? 15 : 10,  // "+268 7612 3456" vs "7612 3456"
                'MG': injectCountryCode ? 16 : 11,  // "+261 32 12 345 67" vs "32 12 345 67"
                'MU': injectCountryCode ? 15 : 10,  // "+230 5123 4567" vs "5123 4567"
                'SC': injectCountryCode ? 15 : 10,  // "+248 251 2345" vs "251 2345"
                'KM': injectCountryCode ? 15 : 10,  // "+269 321 2345" vs "321 2345"
                'YT': injectCountryCode ? 18 : 13,  // "+262 639 12 34 56" vs "639 12 34 56"
                'RE': injectCountryCode ? 18 : 13,  // "+262 692 12 34 56" vs "692 12 34 56"
                'SH': injectCountryCode ? 14 : 9,   // "+290 1234" vs "1234"
                'TA': injectCountryCode ? 14 : 9,   // "+290 1234" vs "1234" (Tristan da Cunha uses same format as Saint Helena)
                'CC': injectCountryCode ? 17 : 12,  // "+61 0412 345 678" vs "0412 345 678" (Cocos Islands use same format as Australia)
                'CX': injectCountryCode ? 17 : 12,  // "+61 0412 345 678" vs "0412 345 678" (Christmas Island uses same format as Australia)
                'NG': injectCountryCode ? 17 : 12,  // "+234 802 123 4567" vs "802 123 4567"
                'JM': injectCountryCode ? 17 : 14,  // "+1 876 123-4567" vs "876 123-4567"
                'CU': injectCountryCode ? 15 : 10,  // "+53 5 123 4567" vs "5 123 4567"
                'HT': injectCountryCode ? 15 : 10,  // "+509 34 12 3456" vs "34 12 3456"
                'DO': injectCountryCode ? 17 : 14,  // "+1 809 123-4567" vs "809 123-4567"
                'PR': injectCountryCode ? 17 : 14,  // "+1 787 123-4567" vs "787 123-4567"
                'VI': injectCountryCode ? 17 : 14,  // "+1 340 123-4567" vs "340 123-4567"
                'AG': injectCountryCode ? 17 : 14,  // "+1 268 123-4567" vs "268 123-4567"
                'AI': injectCountryCode ? 17 : 14,  // "+1 264 123-4567" vs "264 123-4567"
                'AW': injectCountryCode ? 15 : 10,  // "+297 123 4567" vs "123 4567"
                'BB': injectCountryCode ? 17 : 14,  // "+1 246 123-4567" vs "246 123-4567"
                'BM': injectCountryCode ? 17 : 14,  // "+1 441 123-4567" vs "441 123-4567"
                'BQ': injectCountryCode ? 15 : 10,  // "+599 318 1234" vs "318 1234"
                'BS': injectCountryCode ? 17 : 14,  // "+1 242 123-4567" vs "242 123-4567"
                'VG': injectCountryCode ? 17 : 14,  // "+1 284 123-4567" vs "284 123-4567"
                'KY': injectCountryCode ? 17 : 14,  // "+1 345 123-4567" vs "345 123-4567"
                'CW': injectCountryCode ? 15 : 10,  // "+599 9 123 4567" vs "9 123 4567"
                'DM': injectCountryCode ? 17 : 14,  // "+1 767 123-4567" vs "767 123-4567"
                'GD': injectCountryCode ? 17 : 14,  // "+1 473 123-4567" vs "473 123-4567"
                'GP': injectCountryCode ? 18 : 13,  // "+590 690 12 34 56" vs "690 12 34 56"
                'GY': injectCountryCode ? 15 : 10,  // "+592 123 4567" vs "123 4567"
                'KN': injectCountryCode ? 17 : 14,  // "+1 869 123-4567" vs "869 123-4567"
                'LC': injectCountryCode ? 17 : 14,  // "+1 758 123-4567" vs "758 123-4567"
                'MF': injectCountryCode ? 18 : 13,  // "+590 690 12 34 56" vs "690 12 34 56"
                'MQ': injectCountryCode ? 18 : 13,  // "+596 696 12 34 56" vs "696 12 34 56"
                'MS': injectCountryCode ? 17 : 14,  // "+1 664 123-4567" vs "664 123-4567"
                'SX': injectCountryCode ? 15 : 10,  // "+1 721 123-4567" vs "721 123-4567"
                'SR': injectCountryCode ? 15 : 10,  // "+597 123 4567" vs "123 4567"
                'TC': injectCountryCode ? 17 : 14,  // "+1 649 123-4567" vs "649 123-4567"
                'TT': injectCountryCode ? 17 : 14,  // "+1 868 123-4567" vs "868 123-4567"
                'VC': injectCountryCode ? 17 : 14   // "+1 784 123-4567" vs "784 123-4567"
            };
            
            // Return the max length for this country, or calculate a default
            if (maxLengths[countryCode]) {
                return maxLengths[countryCode];
            }
            
            // Default calculation for unknown countries
            // Estimate based on country code length + typical phone number length
            const dialingCodeLength = selectedDialingCode ? selectedDialingCode.length : 3;
            const basePhoneLength = 15; // Typical formatted phone number length
            
            return injectCountryCode ? dialingCodeLength + 1 + basePhoneLength : basePhoneLength;
        },

        // Inject country code into phone field
        injectCountryCodeIntoPhoneField: function(field, dialingCode) {
            console.log('injectCountryCodeIntoPhoneField called with:', dialingCode);
            
            // Ensure dialingCode starts with + and is properly formatted
            let cleanDialingCode = dialingCode;
            if (!cleanDialingCode.startsWith('+')) {
                cleanDialingCode = '+' + cleanDialingCode;
            }
            
            console.log('cleanDialingCode:', cleanDialingCode);
            
            const countryCodePrefix = cleanDialingCode + ' ';
            const currentValue = field.value;
            
            console.log('currentValue:', currentValue);
            console.log('countryCodePrefix:', countryCodePrefix);
            
            // Check if country code is already present
            if (!currentValue.startsWith(cleanDialingCode)) {
                // Extract any existing phone number part (after a space if present)
                let existingPhonePart = '';
                if (currentValue.includes(' ') && currentValue.startsWith('+')) {
                    // If there's already a space and starts with +, get everything after the first space
                    existingPhonePart = currentValue.split(' ').slice(1).join(' ');
                } else if (currentValue && !currentValue.startsWith('+')) {
                    // If there's existing content that doesn't start with +, preserve it
                    existingPhonePart = currentValue;
                }
                
                console.log('existingPhonePart:', existingPhonePart);
                
                // Set the new value with country code + space + existing phone part
                field.value = countryCodePrefix + existingPhonePart;
                
                console.log('field.value set to:', field.value);
                
                // Position cursor after the space
                setTimeout(() => {
                    const spacePos = field.value.indexOf(' ') + 1;
                    field.setSelectionRange(spacePos, spacePos);
                }, 0);
            }
        },

        // Format phone input using libphonenumber
        formatPhoneInputWithLibphonenumber: function(field) {
            const currentValue = field.value;
            const cursorPos = field.selectionStart;
            
            console.log('formatPhoneInputWithLibphonenumber called with value:', currentValue);
            
            // Check if country code injection is disabled
            const injectCountryCode = field.dataset.phoneInjectCountryCode === 'true';
            
            // Check if value contains country code prefix (before space) - only if injection is enabled
            const hasCountryCodePrefix = injectCountryCode && currentValue.includes(' ') && currentValue.startsWith('+');
            let countryCodePrefix = '';
            let phoneNumberPart = currentValue;
            
            if (hasCountryCodePrefix) {
                const parts = currentValue.split(' ');
                countryCodePrefix = parts[0] + ' ';
                phoneNumberPart = parts.slice(1).join(' ');
            }
            
            console.log('injectCountryCode:', injectCountryCode);
            console.log('hasCountryCodePrefix:', hasCountryCodePrefix);
            console.log('countryCodePrefix:', countryCodePrefix);
            console.log('phoneNumberPart:', phoneNumberPart);
            
            // Reset the AsYouType formatter for fresh formatting
            if (field._currentCountryCode) {
                field._asYouType = new AsYouType(field._currentCountryCode);
            } else {
                field._asYouType = new AsYouType();
            }
            
            // Remove all non-digit characters from phone number part only
            const digitsOnly = phoneNumberPart.replace(/\D/g, '');
            
            console.log('digitsOnly:', digitsOnly);
            console.log('field._currentCountryCode:', field._currentCountryCode);
            
            // Format using AsYouType
            let formattedPhoneNumber = '';
            for (let i = 0; i < digitsOnly.length; i++) {
                formattedPhoneNumber = field._asYouType.input(digitsOnly[i]);
            }
            
            console.log('formattedPhoneNumber:', formattedPhoneNumber);
            
            // For national formatting without country code injection, remove the country code from the formatted result
            if (!injectCountryCode && formattedPhoneNumber.startsWith('+')) {
                // Convert to national format
                try {
                    const phoneNumber = parsePhoneNumber(formattedPhoneNumber, field._currentCountryCode);
                    if (phoneNumber && phoneNumber.isValid()) {
                        formattedPhoneNumber = phoneNumber.formatNational();
                    }
                } catch (error) {
                    // Keep the current formatting if parsing fails
                    console.log('Phone parsing failed, keeping current format');
                }
            }
            
            // Combine country code prefix with formatted phone number (only if injection enabled)
            const finalFormattedValue = injectCountryCode ? (countryCodePrefix + formattedPhoneNumber) : formattedPhoneNumber;
            
            console.log('finalFormattedValue:', finalFormattedValue);
            
            // Update field value if changed
            if (field.value !== finalFormattedValue) {
                const oldLength = field.value.length;
                field.value = finalFormattedValue;
                
                // Restore cursor position accounting for formatting changes
                const newLength = finalFormattedValue.length;
                let newCursorPos = cursorPos;
                
                // If cursor is in the phone number part (after space), adjust position
                if (hasCountryCodePrefix && cursorPos > countryCodePrefix.length) {
                    const phonePartOldLength = currentValue.length - countryCodePrefix.length;
                    const phonePartNewLength = formattedPhoneNumber.length;
                    const lengthDiff = phonePartNewLength - phonePartOldLength;
                    newCursorPos = Math.max(countryCodePrefix.length, Math.min(cursorPos + lengthDiff, finalFormattedValue.length));
                } else if (!injectCountryCode) {
                    // For non-injection mode, simple cursor adjustment
                    const lengthDiff = newLength - oldLength;
                    newCursorPos = Math.max(0, Math.min(cursorPos + lengthDiff, finalFormattedValue.length));
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

        // Google Places Autocomplete (New Implementation)
        setupGooglePlaces: function(field) {
            console.log('Setting up Google Places for field:', field.id || field.name);
            
            // Skip Google Places autocomplete for SELECT fields (they get populated but don't need autocomplete)
            if (field.tagName === 'SELECT') {
                console.log('Skipping Google Places autocomplete for SELECT field - will be populated when address is selected');
                console.log('Skipping manual edit tracking for Google Places field:', field.id || field.name);
                return;
            }
            
            // Check if already initialized to prevent duplicates
            if (field._placesDropdown) {
                console.log('Google Places already initialized for this field');
                return;
            }
            
            // Check if Google Places API is loaded (new API detection)
            if (typeof google === 'undefined' || 
                !google.maps || 
                !google.maps.places || 
                !google.maps.places.AutocompleteSuggestion) {
                console.warn('Google Places API (New) not loaded. Please include: <script async src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&loading=async"></script>');
                
                // Retry after a delay in case API is still loading
                setTimeout(() => {
                    if (typeof google !== 'undefined' && 
                        google.maps && 
                        google.maps.places &&
                        google.maps.places.AutocompleteSuggestion) {
                        console.log('Google Places API (New) loaded after delay, retrying setup...');
                        this.setupGooglePlaces(field);
                    }
                }, 2000);
                return;
            }

            // Configuration options
            const countryRestrictions = field.dataset.placesCountries ? 
                field.dataset.placesCountries.split(',') : undefined;

            // Create dropdown container
            const dropdown = document.createElement('div');
            dropdown.className = 'wf-places-dropdown';
            dropdown.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-top: none;
                border-radius: 0 0 4px 4px;
                max-height: 200px;
                overflow-y: auto;
                z-index: 9999;
                display: none;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                pointer-events: auto;
                visibility: hidden;
            `;
            
            // Function to show dropdown
            const showDropdown = () => {
                dropdown.style.display = 'block';
                dropdown.style.visibility = 'visible';
            };
            
            // Function to hide dropdown
            const hideDropdownCompletely = () => {
                dropdown.style.display = 'none';
                dropdown.style.visibility = 'hidden';
                dropdown.innerHTML = '';
            };

            // Position field container relatively
            const fieldContainer = field.parentElement;
            if (fieldContainer && getComputedStyle(fieldContainer).position === 'static') {
                fieldContainer.style.position = 'relative';
            } else if (!fieldContainer) {
                field.style.position = 'relative';
            }

            // Insert dropdown after field
            field.parentNode.insertBefore(dropdown, field.nextSibling);

            let currentSuggestions = [];
            let selectedIndex = -1;
            let isManualEdit = false;
            let sessionToken = new google.maps.places.AutocompleteSessionToken();

            // Track manual edits
            field.addEventListener('input', (e) => {
                if (!field.dataset.autoPopulated) {
                    isManualEdit = true;
                }
            });

            // Handle input for predictions
            field.addEventListener('input', async (e) => {
                // Skip processing if this was just auto-populated from a selection
                if (field.dataset.autoPopulated === 'true') {
                    field.dataset.autoPopulated = 'false'; // Reset flag
                    return;
                }
                
                const query = e.target.value.trim();
                
                if (query.length < 2) {
                    hideDropdownCompletely();
                    currentSuggestions = [];
                    selectedIndex = -1;
                    return;
                }

                try {
                    // Create request for new API
                    const request = {
                        input: query,
                        sessionToken: sessionToken
                    };
                    
                    // Only add includedPrimaryTypes if explicitly set via data attribute
                    if (field.dataset.placesTypes) {
                        request.includedPrimaryTypes = field.dataset.placesTypes.split(',');
                    }

                    if (countryRestrictions) {
                        request.includedRegionCodes = countryRestrictions;
                    }

                    // Use new AutocompleteSuggestion API
                    const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
                    
                    if (suggestions && suggestions.length > 0) {
                        currentSuggestions = suggestions;
                        this.renderSuggestions(dropdown, suggestions, field);
                        selectedIndex = -1;
                    } else {
                        hideDropdownCompletely();
                        currentSuggestions = [];
                        selectedIndex = -1;
                    }
                } catch (error) {
                    console.warn('Error fetching autocomplete suggestions:', error);
                    hideDropdownCompletely();
                    currentSuggestions = [];
                    selectedIndex = -1;
                }
            });

            // Handle keyboard navigation
            field.addEventListener('keydown', (e) => {
                if (dropdown.style.display === 'none') return;

                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        selectedIndex = Math.min(selectedIndex + 1, currentSuggestions.length - 1);
                        this.updateSelection(dropdown, selectedIndex);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        selectedIndex = Math.max(selectedIndex - 1, -1);
                        this.updateSelection(dropdown, selectedIndex);
                        break;
                    case 'Enter':
                        e.preventDefault();
                        if (selectedIndex >= 0 && currentSuggestions[selectedIndex]) {
                            this.selectSuggestion(currentSuggestions[selectedIndex], field, dropdown, sessionToken);
                        }
                        break;
                    case 'Escape':
                        hideDropdownCompletely();
                        selectedIndex = -1;
                        break;
                }
            });

            // Hide dropdown when clicking outside
            const hideDropdown = (e) => {
                if (!field.contains(e.target) && !dropdown.contains(e.target)) {
                    hideDropdownCompletely();
                }
            };
            document.addEventListener('click', hideDropdown);
            
            // Also hide on blur
            field.addEventListener('blur', (e) => {
                // Small delay to allow click events to fire first
                setTimeout(() => {
                    if (!dropdown.contains(document.activeElement)) {
                        hideDropdownCompletely();
                    }
                }, 150);
            });

            // Store references for cleanup
            field._placesDropdown = dropdown;
            field._sessionToken = sessionToken;

            this.triggerCustomEvent(field, 'googlePlacesSetup', {
                newImplementation: true,
                countryRestrictions: countryRestrictions
            });
        },

        // Render suggestions in dropdown (updated for new API)
        renderSuggestions: function(dropdown, suggestions, field) {
            dropdown.innerHTML = '';
            
            suggestions.forEach((suggestion, index) => {
                // Handle both place predictions and query predictions
                const prediction = suggestion.placePrediction || suggestion.queryPrediction;
                if (!prediction) return;

                const item = document.createElement('div');
                item.className = 'wf-places-item';
                item.style.cssText = `
                    padding: 10px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #f0f0f0;
                    font-size: 14px;
                    line-height: 1.4;
                `;
                
                // Main text (usually the address)
                const mainText = document.createElement('div');
                mainText.style.fontWeight = '500';
                mainText.textContent = prediction.structuredFormat?.mainText?.text || 
                                        prediction.text?.text || 
                                        prediction.text || '';
                
                // Secondary text (usually city, state, country)
                const secondaryText = document.createElement('div');
                secondaryText.style.cssText = 'color: #666; font-size: 12px; margin-top: 2px;';
                secondaryText.textContent = prediction.structuredFormat?.secondaryText?.text || '';
                
                item.appendChild(mainText);
                if (secondaryText.textContent) {
                    item.appendChild(secondaryText);
                }
                
                // Hover effects
                item.addEventListener('mouseenter', () => {
                    item.style.backgroundColor = '#f5f5f5';
                });
                
                item.addEventListener('mouseleave', () => {
                    item.style.backgroundColor = 'white';
                });
                
                // Click handler
                item.addEventListener('click', () => {
                    this.selectSuggestion(suggestion, field, dropdown, field._sessionToken);
                });
                
                dropdown.appendChild(item);
            });
            
            dropdown.style.display = 'block';
            dropdown.style.visibility = 'visible';
        },

        // Update visual selection in dropdown
        updateSelection: function(dropdown, selectedIndex) {
            const items = dropdown.querySelectorAll('.wf-places-item');
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    item.style.backgroundColor = '#e3f2fd';
                } else {
                    item.style.backgroundColor = 'white';
                }
            });
        },

        // Handle suggestion selection (updated for new API)
        selectSuggestion: async function(suggestion, field, dropdown, sessionToken) {
            try {
                // Handle both place predictions and query predictions
                const prediction = suggestion.placePrediction || suggestion.queryPrediction;
                if (!prediction) return;

                // Hide and clear dropdown immediately
                dropdown.style.display = 'none';
                dropdown.style.visibility = 'hidden';
                dropdown.innerHTML = '';
                
                // Set field value and mark as auto-populated BEFORE any async operations
                const addressText = prediction.text?.text || prediction.text || '';
                field.value = addressText;
                field.dataset.autoPopulated = 'true';
                field.classList.add('wf-auto-populated');
                
                console.log(`Address field set to: "${addressText}"`);
                
                // Only proceed with place details if it's a place prediction (not query prediction)
                if (suggestion.placePrediction) {
                    console.log('Fetching place details for address population...');
                    
                    // Convert to Place object and fetch details
                    const place = suggestion.placePrediction.toPlace();
                    
                    await place.fetchFields({
                        fields: ['addressComponents', 'formattedAddress', 'location', 'displayName']
                    });

                    console.log('Place details fetched:', place);

                    // Populate related fields if enabled (should be enabled by default)
                    const shouldPopulate = field.dataset.populateFields !== 'false'; // Default to true
                    if (shouldPopulate) {
                        console.log('Populating related address fields...');
                        this.populateAddressFields(place, field);
                    } else {
                        console.log('Address field population disabled via data-populate-fields="false"');
                    }

                    // Trigger custom event
                    this.triggerCustomEvent(field, 'placeSelected', {
                        place: place,
                        formattedAddress: place.formattedAddress,
                        addressComponents: place.addressComponents,
                        suggestion: suggestion
                    });

                    // Create new session token for next search
                    field._sessionToken = new google.maps.places.AutocompleteSessionToken();
                } else {
                    console.log('Query prediction selected - no additional field population');
                }
            } catch (error) {
                console.warn('Failed to get place details:', error);
                // Make sure the address field still keeps its value even if place details fail
                if (field.value === '') {
                    const prediction = suggestion.placePrediction || suggestion.queryPrediction;
                    const addressText = prediction?.text?.text || prediction?.text || '';
                    if (addressText) {
                        field.value = addressText;
                        field.dataset.autoPopulated = 'true';
                        field.classList.add('wf-auto-populated');
                    }
                }
            }
        },

        // Populate address fields based on Google Places selection (updated for new API)
        populateAddressFields: function(place, sourceField) {
            console.log('Populating address fields from place:', place.formattedAddress);
            
            const form = sourceField.closest('form');
            if (!form) {
                console.warn('No form found for source field');
                return;
            }

            // Create address component map (updated for new API camelCase format)
            const addressMap = {};
            if (place.addressComponents) {
                console.log('Raw address components from API:', place.addressComponents);
                place.addressComponents.forEach(component => {
                    console.log('Processing component:', component);
                    const types = component.types;
                    types.forEach(type => {
                        addressMap[type] = {
                            longText: component.longText,
                            shortText: component.shortText
                        };
                        console.log(`  Mapped ${type}: ${component.longText} / ${component.shortText}`);
                    });
                });
            }
            
            console.log('Final address component map:', addressMap);

            // Find and populate fields with address component data attributes
            // Only include fields that are meant for Google Places population
            const allAddressFields = form.querySelectorAll('[data-address-component]');
            const fieldsToPopulate = Array.from(allAddressFields).filter(field => {
                // Include the field if:
                // 1. It's not a country field, OR
                // 2. It's a country field with data-google-places="true"
                const isCountryField = field.dataset.addressComponent?.includes('country');
                return !isCountryField || field.dataset.googlePlaces === 'true';
            });
            
            console.log(`Found ${allAddressFields.length} total address fields, ${fieldsToPopulate.length} eligible for Google Places population`);
            console.log('All address fields found:', Array.from(allAddressFields).map(f => ({
                name: f.name || f.id,
                addressComponent: f.dataset.addressComponent,
                countryCode: f.dataset.countryCode,
                googlePlaces: f.dataset.googlePlaces,
                useFullName: f.dataset.useFullName,
                eligible: !f.dataset.addressComponent?.includes('country') || f.dataset.googlePlaces === 'true'
            })));
            console.log('Fields eligible for population:', fieldsToPopulate.map(f => ({
                name: f.name || f.id,
                addressComponent: f.dataset.addressComponent,
                googlePlaces: f.dataset.googlePlaces
            })));
            
            fieldsToPopulate.forEach(targetField => {
                const componentTypes = targetField.dataset.addressComponent.split(',');
                console.log(`Processing field: ${targetField.name || targetField.id} with components: ${componentTypes.join(', ')}`);
                
                // Skip the main address field if it already has the full address from selection
                if (targetField === sourceField && targetField.value && targetField.value.length > 20) {
                    console.log(`  Skipping main address field - already has full address: "${targetField.value}"`);
                    return;
                }
                
                let value = '';

                // Try each component type until we find a match
                for (const componentType of componentTypes) {
                    const trimmedType = componentType.trim();
                    if (addressMap[trimmedType]) {
                        // Use shortText for states/countries, longText for others
                        if (trimmedType === 'administrative_area_level_1' || trimmedType === 'country') {
                            // For country fields, default to full name unless explicitly set to use short
                            const useFullName = targetField.dataset.useFullName;
                            const shouldUseFullName = useFullName !== 'false' && trimmedType === 'country';
                            
                            value = shouldUseFullName ? 
                                addressMap[trimmedType].longText : 
                                addressMap[trimmedType].shortText;
                            
                            console.log(`  Field ${targetField.name || targetField.id} - use-full-name: "${useFullName}", defaulting to: ${shouldUseFullName ? 'full' : 'short'}`);
                        } else {
                            value = addressMap[trimmedType].longText;
                        }
                        console.log(`  Found match for ${trimmedType}: ${value}`);
                        break;
                    }
                }

                // Special handling for combined fields (e.g., street number + route)
                if (componentTypes.includes('street_number') && componentTypes.includes('route')) {
                    const streetNumber = addressMap['street_number']?.longText || '';
                    const route = addressMap['route']?.longText || '';
                    value = `${streetNumber} ${route}`.trim();
                    console.log(`  Combined street address: ${value}`);
                }

                // Populate the field
                if (value) {
                    console.log(`  Populating field ${targetField.name || targetField.id} with value: ${value}`);
                    if (targetField.tagName === 'SELECT') {
                        this.populateSelectField(targetField, value, addressMap);
                    } else {
                        // Check if field has been manually edited
                        const hasManualEdit = targetField.classList.contains('wf-manual-edit') || 
                                            targetField.dataset.manualEdit === 'true';
                        
                        // Only populate if field is empty or hasn't been manually edited
                        if (!targetField.value || (!hasManualEdit && targetField.dataset.autoPopulate !== 'false')) {
                            targetField.value = value;
                            
                            // Mark as auto-populated but keep editable
                            targetField.dataset.autoPopulated = 'true';
                            targetField.classList.add('wf-auto-populated');
                            targetField.classList.remove('wf-manual-edit');
                            
                            // Add visual feedback
                            targetField.style.backgroundColor = '#e3f2fd';
                            targetField.style.borderColor = '#2196f3';
                            
                            // Remove visual feedback after a delay
                            setTimeout(() => {
                                targetField.style.backgroundColor = '';
                                targetField.style.borderColor = '';
                            }, 2000);
                            
                            // Trigger input event for any listeners
                            const inputEvent = new Event('input', { bubbles: true });
                            targetField.dispatchEvent(inputEvent);
                            
                            // Also trigger change event
                            const changeEvent = new Event('change', { bubbles: true });
                            targetField.dispatchEvent(changeEvent);
                        } else if (hasManualEdit) {
                            console.log(`  Skipping field ${targetField.name || targetField.id} - manually edited`);
                        }
                    }
                } else {
                    console.log(`  No value found for field ${targetField.name || targetField.id} with components: ${componentTypes.join(', ')}`);
                }
            });

            // Auto-sync phone country dropdown if address has country data
            if (addressMap.country) {
                setTimeout(() => {
                    this.syncPhoneCountryFromAddress(addressMap.country);
                }, 100);
            }

            this.triggerCustomEvent(sourceField, 'addressFieldsPopulated', {
                addressMap: addressMap,
                populatedFields: fieldsToPopulate.length
            });
        },

        // Populate select fields (like country/state dropdowns) - updated for new API
        populateSelectField: function(selectField, value, addressMap) {
            console.log(`Populating select field: ${selectField.name || selectField.id} with value: ${value}`);
            
            // For country fields - prioritize address component fields with Google Places attributes
            if (selectField.dataset.addressComponent?.includes('country') && 
                selectField.dataset.googlePlaces === 'true') {
                // This is an address component field (for Google Places population)
                
                const countryCode = addressMap['country']?.shortText;
                const countryName = addressMap['country']?.longText;
                
                console.log(`  Country data: ${countryCode} / ${countryName}`);
                console.log(`  Use full name: ${selectField.dataset.useFullName}`);
                
                if (countryCode || countryName) {
                    // Check if this is a custom searchable country dropdown
                    // First check if the current field is already in a container
                    let container = selectField.closest('[data-country-select-container]');
                    
                    // If not found, look for containers in the same form
                    if (!container) {
                        const form = selectField.closest('form') || document;
                        const allContainers = form.querySelectorAll('[data-country-select-container]');
                        
                        // Find container that has a hidden select with matching name or id
                        for (const cont of allContainers) {
                            const hiddenSel = cont.querySelector('select[style*="display: none"]');
                            if (hiddenSel && (hiddenSel.name === selectField.name || hiddenSel.id === selectField.id)) {
                                container = cont;
                                break;
                            }
                        }
                    }
                    
                    const searchInput = container ? container.querySelector('[data-country-search]') : null;
                    const hiddenSelect = container ? container.querySelector('select[style*="display: none"]') : null;
                    const dropdownList = container ? container.querySelector('[data-country-dropdown]') : null;
                    
                    console.log(`  Debug - Field name/id: ${selectField.name || selectField.id}`);
                    console.log(`  Debug - Container found: ${!!container}`);
                    console.log(`  Debug - Search input found: ${!!searchInput}`);
                    console.log(`  Debug - Hidden select found: ${!!hiddenSelect}`);
                    console.log(`  Debug - Dropdown list found: ${!!dropdownList}`);
                    
                    if (searchInput && hiddenSelect && dropdownList) {
                        console.log(`  Detected custom searchable country dropdown`);
                        
                        // Determine which value to use based on data-use-full-name
                        const searchValue = selectField.dataset.useFullName === 'true' ? countryName : countryCode;
                        const fallbackValue = selectField.dataset.useFullName === 'true' ? countryCode : countryName;
                        
                        console.log(`  Searching for: ${searchValue} (fallback: ${fallbackValue})`);
                        
                        // Look for options in the custom dropdown
                        const customOptions = dropdownList.querySelectorAll('[data-country-option]');
                        console.log(`  Found ${customOptions.length} custom country options`);
                        
                        let optionFound = false;
                        let debugCount = 0;
                        
                        for (const option of customOptions) {
                            const optionValue = option.dataset.value;
                            const optionText = option.textContent.trim();
                            const optionCountryCode = option.dataset.countryCode;
                            const optionCountryName = option.dataset.countryName;
                            
                            // Only show first few options for debugging
                            if (debugCount < 3) {
                                console.log(`  Checking option: "${optionText}" (value: "${optionValue}", code: "${optionCountryCode}", name: "${optionCountryName}")`);
                                debugCount++;
                            }
                            
                            // Try exact matches first - prioritize country data attributes over display text
                            if (optionCountryCode === countryCode || 
                                optionCountryName === countryName ||
                                optionCountryCode === countryName || 
                                optionCountryName === countryCode ||
                                optionValue === searchValue || 
                                optionValue === fallbackValue) {
                                
                                // Set the search input display value
                                searchInput.value = optionText;
                                // Set the hidden select value for form submission
                                hiddenSelect.value = optionValue;
                                
                                optionFound = true;
                                console.log(`  Country option found: ${optionText} (value: ${optionValue})`);
                                
                                // Mark as auto-populated
                                searchInput.dataset.autoPopulated = 'true';
                                searchInput.classList.add('wf-auto-populated');
                                hiddenSelect.dataset.autoPopulated = 'true';
                                
                                // Trigger change event on hidden select
                                const changeEvent = new Event('change', { bubbles: true });
                                hiddenSelect.dispatchEvent(changeEvent);
                                break;
                            }
                        }
                        
                        if (!optionFound) {
                            console.log(`  Country option not found for: ${countryCode} / ${countryName}`);
                            // For debugging, show what options are available
                            console.log(`  Available custom options:`, Array.from(customOptions).slice(0, 5).map(opt => 
                                `"${opt.textContent.trim()}" (value: "${opt.dataset.value}", code: "${opt.dataset.countryCode}")`
                            ));
                        }
                    } else {
                        // Handle standard select field
                        console.log(`  Standard select field detected`);
                        
                        // Determine which value to use based on data-use-full-name
                        const searchValue = selectField.dataset.useFullName === 'true' ? countryName : countryCode;
                        const fallbackValue = selectField.dataset.useFullName === 'true' ? countryCode : countryName;
                        
                        console.log(`  Searching for: ${searchValue} (fallback: ${fallbackValue})`);
                        
                        // Find option by country code or name
                        const options = selectField.querySelectorAll('option');
                        let optionFound = false;
                        
                        // Debug: log all available options
                        console.log(`  Available options:`, Array.from(options).map(opt => `"${opt.textContent}" (value: "${opt.value}")"`));
                        
                        for (const option of options) {
                            const optionValue = option.value.trim();
                            const optionText = option.textContent.trim();
                            
                            // Try exact matches first
                            if (optionValue === searchValue || optionText === searchValue ||
                                optionValue === fallbackValue || optionText === fallbackValue ||
                                optionValue === countryCode || optionText === countryCode ||
                                optionValue === countryName || optionText === countryName) {
                                
                                selectField.value = option.value;
                                optionFound = true;
                                console.log(`  Country option found (exact): ${option.textContent} (value: ${option.value})`);
                                
                                // Mark as auto-populated and add visual feedback
                                selectField.dataset.autoPopulated = 'true';
                                selectField.classList.add('wf-auto-populated');
                                selectField.classList.remove('wf-manual-edit');
                                
                                // Trigger change event
                                const changeEvent = new Event('change', { bubbles: true });
                                selectField.dispatchEvent(changeEvent);
                                break;
                            }
                        }
                        
                        // If no exact match, try partial matches
                        if (!optionFound) {
                            for (const option of options) {
                                const optionValue = option.value.toLowerCase();
                                const optionText = option.textContent.toLowerCase();
                                
                                if ((countryCode && (optionValue.includes(countryCode.toLowerCase()) || optionText.includes(countryCode.toLowerCase()))) ||
                                    (countryName && (optionValue.includes(countryName.toLowerCase()) || optionText.includes(countryName.toLowerCase())))) {
                                    
                                    selectField.value = option.value;
                                    optionFound = true;
                                    console.log(`  Country option found (partial): ${option.textContent} (value: ${option.value})`);
                                    
                                    // Mark as auto-populated and add visual feedback
                                    selectField.dataset.autoPopulated = 'true';
                                    selectField.classList.add('wf-auto-populated');
                                    selectField.classList.remove('wf-manual-edit');
                                    
                                    // Trigger change event
                                    const changeEvent = new Event('change', { bubbles: true });
                                    selectField.dispatchEvent(changeEvent);
                                    break;
                                }
                            }
                        }
                        
                        if (!optionFound) {
                            console.log(`  Country option not found for: ${countryCode} / ${countryName}`);
                        }
                    }
                }
                return;
            } else if (selectField.dataset.countryCode === 'true') {
                // This is a legacy country code field (not for Google Places population)
                console.log(`  Legacy country field detected - skipping Google Places population`);
                return;
            }

            // For state/province/region fields
            if (selectField.dataset.stateName === 'true' || selectField.dataset.addressComponent?.includes('administrative_area_level_1')) {
                const stateCode = addressMap['administrative_area_level_1']?.short_name;
                const stateName = addressMap['administrative_area_level_1']?.long_name;
                
                console.log(`  State data: ${stateCode} / ${stateName}`);
                
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
                        console.log(`  State option found: ${option.textContent}`);
                        break;
                    }
                }

                // If no option found, add new option (fallback)
                if (!optionFound && (stateCode || stateName)) {
                    const newOption = document.createElement('option');
                    newOption.value = stateCode || stateName;
                    newOption.textContent = stateName && stateCode ? `${stateName} (${stateCode})` : (stateName || stateCode);
                    newOption.dataset.autoGenerated = 'true';
                    selectField.appendChild(newOption);
                    selectField.value = newOption.value;
                    console.log(`  Created new state option: ${newOption.textContent}`);
                }
                
                // State fields remain editable - no additional fallback needed
                return;
            }

            // For other select fields, try to find matching option
            const options = selectField.querySelectorAll('option');
            let optionFound = false;
            
            for (const option of options) {
                if (option.value === value || option.textContent.trim() === value) {
                    selectField.value = option.value;
                    optionFound = true;
                    break;
                }
            }
            
            if (!optionFound) {
                console.log(`  No matching option found for value: ${value}`);
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
        },

        // Manual edit tracking for address fields
        setupManualEditTracking: function(field) {
            let hasUserInput = false;
            
            // Skip manual edit tracking for Google Places autocomplete fields
            // They need to trigger autocomplete on input, not be marked as manual edits
            if (field.dataset.googlePlaces === 'true') {
                console.log(`Skipping manual edit tracking for Google Places field: ${field.name || field.id}`);
                return;
            }
            
            // For SELECT fields, track change events instead of input
            if (field.tagName === 'SELECT') {
                field.addEventListener('change', (e) => {
                    // Only mark as manual edit if it's not from auto-population
                    if (!field.dataset.autoPopulated || field.dataset.autoPopulated !== 'true') {
                        hasUserInput = true;
                        field.dataset.manualEdit = 'true';
                        field.classList.add('wf-manual-edit');
                        field.classList.remove('wf-auto-populated');
                        
                        // Add visual feedback for manual edit
                        field.style.backgroundColor = '#f1f8e9';
                        field.style.borderColor = '#4caf50';
                        
                        // Remove visual feedback after a delay
                        setTimeout(() => {
                            field.style.backgroundColor = '';
                            field.style.borderColor = '';
                        }, 1500);
                        
                        console.log(`Select field ${field.name || field.id} marked as manually edited`);
                    }
                    
                    // Reset auto-populated flag after manual change
                    if (field.dataset.autoPopulated === 'true') {
                        delete field.dataset.autoPopulated;
                    }
                });
            } else {
                // For INPUT fields, track input events
                field.addEventListener('input', (e) => {
                    // Only mark as manual edit if it's not from auto-population
                    if (!field.dataset.autoPopulated || field.dataset.autoPopulated !== 'true') {
                        hasUserInput = true;
                        field.dataset.manualEdit = 'true';
                        field.classList.add('wf-manual-edit');
                        field.classList.remove('wf-auto-populated');
                        
                        // Add visual feedback for manual edit
                        field.style.backgroundColor = '#f1f8e9';
                        field.style.borderColor = '#4caf50';
                        
                        // Remove visual feedback after a delay
                        setTimeout(() => {
                            field.style.backgroundColor = '';
                            field.style.borderColor = '';
                        }, 1500);
                        
                        console.log(`Field ${field.name || field.id} marked as manually edited`);
                    }
                    
                    // Reset auto-populated flag after input
                    if (field.dataset.autoPopulated === 'true') {
                        delete field.dataset.autoPopulated;
                    }
                });
            }
            
            // Track focus to detect user interaction
            field.addEventListener('focus', () => {
                if (field.dataset.autoPopulated === 'true') {
                    // User is focusing on an auto-populated field
                    field.classList.add('wf-user-focused');
                }
            });
            
            // Clear focus indicator
            field.addEventListener('blur', () => {
                field.classList.remove('wf-user-focused');
            });
        },

        // Sync phone country dropdown when address country is populated
        syncPhoneCountryFromAddress: function(countryData) {
            const countryName = countryData.longText; // e.g., "United States"
            const countryCode = countryData.shortText; // e.g., "US"
            
            console.log(`🔄 Auto-syncing phone country dropdown with address country: ${countryName} (${countryCode})`);
            
            // Find phone country dropdowns using data-country-code="true"
            const phoneCountryDropdowns = document.querySelectorAll('[data-country-code="true"]');
            console.log(`📞 Found ${phoneCountryDropdowns.length} phone country dropdowns with data-country-code="true"`);
            
            if (phoneCountryDropdowns.length === 0) {
                console.log(`⚠️ No phone country dropdowns found. Checking all dropdowns...`);
                
                // Debug: Show all form selects to help identify the issue
                const allSelects = document.querySelectorAll('select');
                console.log(`📋 Found ${allSelects.length} total select elements:`);
                allSelects.forEach((select, index) => {
                    console.log(`  ${index + 1}. Select name="${select.name}" id="${select.id}" data-country-code="${select.dataset.countryCode}"`);
                });
                
                // Also check for inputs that might be phone country fields
                const inputs = document.querySelectorAll('input[data-country-code]');
                console.log(`📋 Found ${inputs.length} input elements with data-country-code:`);
                inputs.forEach((input, index) => {
                    console.log(`  ${index + 1}. Input name="${input.name}" id="${input.id}" data-country-code="${input.dataset.countryCode}"`);
                });
                
                return;
            }
            
            phoneCountryDropdowns.forEach((dropdown, index) => {
                console.log(`📞 Processing dropdown ${index + 1}: ${dropdown.name || dropdown.id}`);
                console.log(`📞 Dropdown tag: ${dropdown.tagName}, type: ${dropdown.type}`);
                
                // Check if this field has been enhanced into a searchable dropdown
                // Look for the enhanced searchable input with "_search" suffix
                const searchInputId = `${dropdown.id}_search`;
                const searchInput = document.getElementById(searchInputId);
                
                console.log(`📞 Looking for searchable input with id: ${searchInputId}`);
                console.log(`📞 Searchable input found: ${!!searchInput}`);
                
                if (searchInput) {
                    console.log(`📞 Enhanced searchable dropdown detected`);
                    
                    // Find the container and hidden select
                    const container = searchInput.closest('[data-country-select-container]');
                    const hiddenSelect = container ? container.querySelector('select[style*="display: none"]') : dropdown;
                    
                    console.log(`📞 Container found: ${!!container}`);
                    console.log(`📞 Hidden select found: ${!!hiddenSelect}`);
                    
                    if (hiddenSelect) {
                        this.syncSearchableCountryDropdown(searchInput, hiddenSelect, countryName, countryCode);
                    } else {
                        console.log(`⚠️ Could not find hidden select for searchable dropdown`);
                    }
                } else {
                    // Check if it's in a container (library-created searchable dropdown)
                    const container = dropdown.closest('[data-country-select-container]');
                    if (container) {
                        console.log(`📞 Library-created searchable dropdown detected in container`);
                        const containerSearchInput = container.querySelector('[data-country-search]');
                        const hiddenSelect = container.querySelector('select[style*="display: none"]');
                        
                        console.log(`📞 Container elements - searchInput: ${!!containerSearchInput}, hiddenSelect: ${!!hiddenSelect}`);
                        
                        if (containerSearchInput && hiddenSelect) {
                            this.syncSearchableCountryDropdown(containerSearchInput, hiddenSelect, countryName, countryCode);
                        } else {
                            console.log(`⚠️ Missing searchable dropdown elements in container`);
                        }
                    } else {
                        console.log(`📞 Standard dropdown detected (no container)`);
                        this.syncStandardCountryDropdown(dropdown, countryName, countryCode);
                    }
                }
            });
        },

        // Sync searchable country dropdown
        syncSearchableCountryDropdown: function(searchInput, hiddenSelect, countryName, countryCode) {
            const options = hiddenSelect.querySelectorAll('option');
            console.log(`📞 Searching ${options.length} options for: ${countryName} or ${countryCode}`);
            
            // Debug: Show first few options
            console.log(`📞 First 5 options:`, Array.from(options).slice(0, 5).map(opt => `"${opt.textContent}" (value: "${opt.value}")`));
            
            let matchFound = false;
            for (const option of options) {
                const text = option.textContent.toLowerCase();
                const value = option.value.toLowerCase();
                
                // Look for United States variations and +1 country code
                if (text.includes('united states') || text.includes('usa') || 
                    value.includes('+1') || text.includes('america') ||
                    text.includes(countryName.toLowerCase()) ||
                    value.includes(countryCode.toLowerCase())) {
                    
                    searchInput.value = option.textContent;
                    hiddenSelect.value = option.value;
                    
                    console.log(`✅ Phone country synced to: ${option.textContent} (value: ${option.value})`);
                    
                    // Trigger change event
                    const changeEvent = new Event('change', { bubbles: true });
                    hiddenSelect.dispatchEvent(changeEvent);
                    matchFound = true;
                    break;
                }
            }
            
            if (!matchFound) {
                console.log(`⚠️ No matching option found for ${countryName} (${countryCode})`);
                console.log(`📞 All options:`, Array.from(options).map(opt => `"${opt.textContent}" (value: "${opt.value}")`));
            }
        },

        // Sync standard country dropdown
        syncStandardCountryDropdown: function(dropdown, countryName, countryCode) {
            const options = dropdown.querySelectorAll('option');
            console.log(`📞 Searching ${options.length} options for: ${countryName} or ${countryCode}`);
            
            // Debug: Show first few options
            console.log(`📞 First 5 options:`, Array.from(options).slice(0, 5).map(opt => `"${opt.textContent}" (value: "${opt.value}")`));
            
            let matchFound = false;
            for (const option of options) {
                const text = option.textContent.toLowerCase();
                const value = option.value.toLowerCase();
                
                // Look for United States variations and +1 country code
                if (text.includes('united states') || text.includes('usa') || 
                    value.includes('+1') || text.includes('america') ||
                    text.includes(countryName.toLowerCase()) ||
                    value.includes(countryCode.toLowerCase())) {
                    
                    dropdown.value = option.value;
                    
                    console.log(`✅ Phone country synced to: ${option.textContent} (value: ${option.value})`);
                    
                    // Trigger change event
                    const changeEvent = new Event('change', { bubbles: true });
                    dropdown.dispatchEvent(changeEvent);
                    matchFound = true;
                    break;
                }
            }
            
            if (!matchFound) {
                console.log(`⚠️ No matching option found for ${countryName} (${countryCode})`);
                console.log(`📞 All options:`, Array.from(options).map(opt => `"${opt.textContent}" (value: "${opt.value}")`));
            }
        },

        // ======================
        // MODULAR BRANCHING LOGIC
        // ======================

        // Initialize branching logic for the form
        initBranchingLogic: function() {
            console.log('Initializing modular branching logic...');
            
            try {
                const form = document.querySelector('[data-form="multistep"]');
                if (!form) {
                    console.warn('No multistep form found');
                    return;
                }

                // Auto-detect and validate branching patterns
                const patterns = this.detectBranchingPatterns(form);
                this.validateBranchingPatterns(patterns, form);

                // Map all steps and their conditions
                this.mapFormSteps(form);
                
                // Set up branching listeners
                this.setupBranchingListeners(form);
                
                // Initialize step visibility
                this.initializeStepVisibility(form);
                
                // Initialize custom error validation system
                this.initCustomErrorValidation(form);
                
                console.log('Modular branching logic initialized successfully');
                console.log(`Detected ${patterns.members.length} member patterns, ${patterns.managers.length} manager patterns, ${patterns.other.length} other patterns`);
                
            } catch (error) {
                console.error('Error initializing branching logic:', error);
            }
        },

        // Map all form steps and their branching conditions
        mapFormSteps: function(form) {
            console.log('Mapping form steps and conditions...');
            
            // Find all main steps
            const steps = form.querySelectorAll('[data-form="step"]');
            
            steps.forEach((step, index) => {
                const stepWrapper = step.querySelector('[data-go-to], [data-answer]');
                
                // Map main step
                if (stepWrapper) {
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
                    
                    console.log(`Mapped main step: ${stepId}`, { goTo, answer });
                }
                
                // Also map step_item elements within this step (for branching conditions)
                const stepItems = step.querySelectorAll('.step_item[data-answer], .step-item[data-answer]');
                stepItems.forEach((stepItem, itemIndex) => {
                    const itemId = stepItem.dataset.answer;
                    const itemGoTo = stepItem.dataset.goTo;
                    
                    if (itemId) {
                        this.branchingState.conditionalSteps.set(itemId, {
                            element: stepItem,
                            wrapper: stepItem,
                            goTo: itemGoTo,
                            answer: itemId,
                            index: index,
                            itemIndex: itemIndex,
                            isStepItem: true,
                            parentStep: step,
                            isVisible: false // Step items start hidden
                        });
                        
                        console.log(`Mapped step item: ${itemId}`, { goTo: itemGoTo, parentStep: index });
                    }
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
                
                console.log(`Mapped branching input: ${containerId} -> ${goTo}`);
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
            console.log('Setting up branching listeners...');
            
            // Listen for all form input changes
            form.addEventListener('change', (event) => {
                if (event.target.dataset.goTo) {
                    console.log('Change event triggered for:', event.target.id || event.target.name);
                    this.handleBranchingChange(event);
                }
            });
            
            // Listen for radio button clicks specifically (for immediate feedback)
            form.addEventListener('click', (event) => {
                if (event.target.type === 'radio' && event.target.dataset.goTo) {
                    console.log('Click event triggered for radio:', event.target.id || event.target.name);
                    // Use setTimeout to ensure the radio is checked before handling
                    setTimeout(() => {
                        this.handleBranchingChange(event);
                    }, 10);
                }
            });
            
            // Listen for next/back button clicks and skip navigation
            form.addEventListener('click', (event) => {
                if (event.target.dataset.form === 'next-btn') {
                    this.handleNextStep(event);
                } else if (event.target.dataset.form === 'back-btn') {
                    this.handleBackStep(event);
                } else if (event.target.dataset.skip) {
                    this.handleSkipNavigation(event);
                }
            });
            
            // Listen for radio button changes with data-skip attributes
            form.addEventListener('change', (event) => {
                if (event.target.matches('input[type="radio"][data-skip]') && event.target.checked) {
                    this.handleSkipNavigation(event);
                }
            });
        },

        // Handle branching input changes
        handleBranchingChange: function(event) {
            const input = event.target;
            const goTo = input.dataset.goTo;
            
            if (!goTo) return;
            
            // Only handle radio buttons that are actually checked
            if (input.type === 'radio' && !input.checked) {
                console.log(`Skipping unchecked radio: ${input.value}`);
                return;
            }
            
            console.log(`Branching change detected: "${input.value}" -> "${goTo}"`);
            console.log(`Input details:`, {
                id: input.id,
                name: input.name,
                value: input.value,
                checked: input.checked,
                type: input.type,
                goTo: goTo
            });
            
            // Store the selection for later use when navigating to the next step
            this.branchingState.selectedBranch = goTo;
            console.log(`Stored selected branch: ${goTo}`);
            
            // Store branching decision in history for back navigation
            const currentStep = input.closest('[data-form="step"]');
            const branchDecision = {
                stepElement: currentStep,
                selectedBranch: goTo,
                inputElement: input,
                timestamp: Date.now()
            };
            
            // Update or add to branch history
            const existingIndex = this.branchingState.branchHistory.findIndex(
                decision => decision.stepElement === currentStep
            );
            
            if (existingIndex >= 0) {
                console.log(`Updating existing branch decision for step:`, this.branchingState.branchHistory[existingIndex]);
                this.branchingState.branchHistory[existingIndex] = branchDecision;
                
                // Clear any downstream branch decisions that might be affected by this change
                this.branchingState.branchHistory = this.branchingState.branchHistory.slice(0, existingIndex + 1);
                console.log(`Cleared downstream branch decisions, remaining history:`, this.branchingState.branchHistory.length);
            } else {
                this.branchingState.branchHistory.push(branchDecision);
                console.log(`Added new branch decision to history`);
            }
            
            console.log(`Current branch history:`, this.branchingState.branchHistory.map(d => ({
                step: d.stepElement.dataset.answer || 'unknown',
                branch: d.selectedBranch,
                input: d.inputElement.value
            })));
            
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

        // Handle skip navigation
        handleSkipNavigation: function(event) {
            event.preventDefault();
            
            const skipTarget = event.target.dataset.skip;
            if (!skipTarget) {
                console.warn('Skip target not specified');
                return;
            }
            
            console.log(`🚀 Skip navigation triggered: ${event.target.tagName.toLowerCase()} -> ${skipTarget}`);
            
            // Log the element that triggered the skip
            const elementInfo = {
                tagName: event.target.tagName.toLowerCase(),
                type: event.target.type || 'N/A',
                id: event.target.id || 'N/A',
                className: event.target.className || 'N/A',
                text: event.target.textContent?.trim() || event.target.value || 'N/A'
            };
            console.log(`Skip triggered by:`, elementInfo);
            
            // Find the target step
            const targetStep = this.findStepByAnswer(skipTarget);
            if (!targetStep) {
                console.error(`❌ Skip target step not found: "${skipTarget}"`);
                console.log('Available steps with data-answer:', 
                    Array.from(document.querySelectorAll('[data-answer]')).map(el => el.dataset.answer)
                );
                return;
            }
            
            // Record the skip in history for analytics
            const currentStep = this.branchingState.currentStep;
            const skipRecord = {
                fromStep: this.getCurrentStepId(),
                toStep: skipTarget,
                skipElement: event.target,
                skipType: elementInfo.tagName,
                timestamp: Date.now()
            };
            
            // Add to branching state for tracking
            if (!this.branchingState.skipHistory) {
                this.branchingState.skipHistory = [];
            }
            this.branchingState.skipHistory.push(skipRecord);
            
            console.log(`✅ Skip navigation: ${skipRecord.fromStep} -> ${skipRecord.toStep}`);
            
            // Navigate to the target step
            this.navigateToStep(skipTarget, 'skip');
            
            // Trigger custom event
            this.triggerCustomEvent(event.target, 'skipNavigation', {
                from: skipRecord.fromStep,
                to: skipTarget,
                skipType: elementInfo.tagName,
                element: event.target
            });
        },

        // Determine the next step based on current selections - Flexible and extensible approach
        determineNextStep: function(currentStep) {
            console.log('🔍 Determining next step from current step...');
            
            // Priority 1: Active form controls with explicit navigation (radio buttons, checkboxes, selects)
            const activeControl = this.findActiveNavigationControl(currentStep);
            if (activeControl) {
                console.log(`✅ Found active control: ${activeControl.type} -> ${activeControl.target}`);
                return activeControl.target;
            }
            
            // Priority 2: Stored branching state (from previous selections)
            if (this.branchingState.selectedBranch) {
                console.log(`✅ Using stored selected branch: ${this.branchingState.selectedBranch}`);
                const branch = this.branchingState.selectedBranch;
                this.branchingState.selectedBranch = null; // Clear after use
                return branch;
            }
            
            // Priority 3: Visible step items with navigation (branch scenarios)
            const stepItemNavigation = this.findStepItemNavigation(currentStep);
            if (stepItemNavigation) {
                console.log(`✅ Found step item navigation: ${stepItemNavigation.source} -> ${stepItemNavigation.target}`);
                return stepItemNavigation.target;
            }
            
            // Priority 4: Intelligent pattern-based navigation (sequential, conditional)
            const patternNavigation = this.findPatternBasedNavigation(currentStep);
            if (patternNavigation) {
                console.log(`✅ Pattern-based navigation: ${patternNavigation.pattern} -> ${patternNavigation.target}`);
                return patternNavigation.target;
            }
            
            // Priority 5: Fallback navigation (step wrappers, default paths)
            const fallbackNavigation = this.findFallbackNavigation(currentStep);
            if (fallbackNavigation) {
                console.log(`✅ Fallback navigation: ${fallbackNavigation.source} -> ${fallbackNavigation.target}`);
                return fallbackNavigation.target;
            }
            
            console.warn('❌ No next step determined - all navigation methods failed');
            return null;
        },

        // Find active navigation controls (radio buttons, checkboxes, selects with data-go-to or data-skip)
        findActiveNavigationControl: function(currentStep) {
            // Radio buttons with data-go-to
            const selectedRadio = currentStep.querySelector('input[type="radio"]:checked[data-go-to]');
            if (selectedRadio) {
                return {
                    type: 'radio',
                    element: selectedRadio,
                    value: selectedRadio.value,
                    target: selectedRadio.dataset.goTo
                };
            }
            
            // Radio buttons with data-skip
            const selectedRadioSkip = currentStep.querySelector('input[type="radio"]:checked[data-skip]');
            if (selectedRadioSkip) {
                return {
                    type: 'radio-skip',
                    element: selectedRadioSkip,
                    value: selectedRadioSkip.value,
                    target: selectedRadioSkip.dataset.skip
                };
            }
            
            // Checkboxes with data-go-to
            const selectedCheckbox = currentStep.querySelector('input[type="checkbox"]:checked[data-go-to]');
            if (selectedCheckbox) {
                return {
                    type: 'checkbox',
                    element: selectedCheckbox,
                    value: selectedCheckbox.value,
                    target: selectedCheckbox.dataset.goTo
                };
            }
            
            // Checkboxes with data-skip
            const selectedCheckboxSkip = currentStep.querySelector('input[type="checkbox"]:checked[data-skip]');
            if (selectedCheckboxSkip) {
                return {
                    type: 'checkbox-skip',
                    element: selectedCheckboxSkip,
                    value: selectedCheckboxSkip.value,
                    target: selectedCheckboxSkip.dataset.skip
                };
            }
            
            // Select dropdowns with data-go-to
            const selectedOption = currentStep.querySelector('select option:checked[data-go-to]');
            if (selectedOption) {
                return {
                    type: 'select',
                    element: selectedOption,
                    value: selectedOption.value,
                    target: selectedOption.dataset.goTo
                };
            }
            
            // Select dropdowns with data-skip
            const selectedOptionSkip = currentStep.querySelector('select option:checked[data-skip]');
            if (selectedOptionSkip) {
                return {
                    type: 'select-skip',
                    element: selectedOptionSkip,
                    value: selectedOptionSkip.value,
                    target: selectedOptionSkip.dataset.skip
                };
            }
            
            return null;
        },

        // Find navigation within step items (branch scenarios)
        findStepItemNavigation: function(currentStep) {
            const visibleStepItem = currentStep.querySelector('.step_item:not([style*="display: none"]):not([style*="visibility: hidden"])');
            if (!visibleStepItem) return null;
            
            // Direct data-go-to on step item
            if (visibleStepItem.dataset.goTo) {
                return {
                    type: 'step-item-direct',
                    source: visibleStepItem.dataset.answer,
                    target: visibleStepItem.dataset.goTo
                };
            }
            
            // Navigation elements within step item (buttons, links, etc.)
            const navElements = [
                'button[data-go-to]',
                '[data-form="next-btn"][data-go-to]',
                'a[data-go-to]',
                '.next-btn[data-go-to]',
                'button[data-skip]',
                'a[data-skip]',
                '.skip-btn[data-skip]',
                '[data-skip]',
                '[data-go-to]'
            ];
            
            for (const selector of navElements) {
                const navElement = visibleStepItem.querySelector(selector);
                if (navElement) {
                    return {
                        type: 'step-item-child',
                        source: visibleStepItem.dataset.answer,
                        element: navElement,
                        target: navElement.dataset.goTo || navElement.dataset.skip
                    };
                }
            }
            
            return null;
        },

        // Find pattern-based navigation (sequential, conditional, custom patterns)
        findPatternBasedNavigation: function(currentStep) {
            // Sequential patterns (manager-1 -> manager-2, member-1 -> member-2)
            const visibleStepItem = currentStep.querySelector('.step_item:not([style*="display: none"]):not([style*="visibility: hidden"])');
            if (visibleStepItem && visibleStepItem.dataset.answer) {
                const sequentialNext = this.determineSequentialNextStep(visibleStepItem.dataset.answer);
                if (sequentialNext) {
                    return {
                        type: 'sequential',
                        pattern: 'numbered-sequence',
                        source: visibleStepItem.dataset.answer,
                        target: sequentialNext
                    };
                }
            }
            
            // Add more pattern types here as needed:
            // - Conditional patterns
            // - Custom business logic patterns
            // - Date-based patterns
            // - User role-based patterns
            
            return null;
        },

        // Find fallback navigation options
        findFallbackNavigation: function(currentStep) {
            // Step items with data-go-to (any step item, visible or not)
            const anyStepItem = currentStep.querySelector('.step_item[data-go-to]');
            if (anyStepItem) {
                return {
                    type: 'step-item-fallback',
                    source: anyStepItem.dataset.answer,
                    target: anyStepItem.dataset.goTo
                };
            }
            
            // Step wrapper navigation
            const stepWrapper = currentStep.querySelector('[data-go-to]');
            if (stepWrapper) {
                return {
                    type: 'step-wrapper',
                    source: 'step-wrapper',
                    target: stepWrapper.dataset.goTo
                };
            }
            
            // Next sibling step (DOM-based fallback)
            const nextStep = currentStep.nextElementSibling;
            if (nextStep && nextStep.dataset.form === 'step') {
                const nextStepId = this.getStepId(nextStep);
                if (nextStepId) {
                    return {
                        type: 'dom-sibling',
                        source: 'dom-navigation',
                        target: nextStepId
                    };
                }
            }
            
            return null;
        },

        // Determine the next step in a sequential pattern (e.g., manager-individual-1 -> manager-2)
        determineSequentialNextStep: function(currentBranch) {
            console.log(`Analyzing sequential pattern for: ${currentBranch}`);
            
            // Pattern matching for managers: manager-individual-1 -> manager-2, manager-entity-1 -> manager-2, etc.
            const managerMatch = currentBranch.match(/^manager-(individual|entity|trust)-(\d+)$/);
            if (managerMatch) {
                const [, type, number] = managerMatch;
                const currentNum = parseInt(number);
                const nextNum = currentNum + 1;
                const nextStep = `manager-${nextNum}`;
                
                console.log(`Manager pattern detected: ${currentBranch} -> ${nextStep}`);
                
                // Check if the next manager step exists
                if (document.querySelector(`[data-answer="${nextStep}"]`)) {
                    return nextStep;
                } else {
                    console.log(`Next manager step ${nextStep} not found, checking for member-1`);
                    // If no more managers, go to first member
                    if (document.querySelector(`[data-answer="member-1"]`)) {
                        return 'member-1';
                    }
                }
            }
            
            // Pattern matching for members: member-individual-1 -> member-2, member-entity-1 -> member-2, etc.
            const memberMatch = currentBranch.match(/^member-(individual|entity|trust)-(\d+)$/);
            if (memberMatch) {
                const [, type, number] = memberMatch;
                const currentNum = parseInt(number);
                const nextNum = currentNum + 1;
                const nextStep = `member-${nextNum}`;
                
                console.log(`Member pattern detected: ${currentBranch} -> ${nextStep}`);
                
                // Check if the next member step exists
                if (document.querySelector(`[data-answer="${nextStep}"]`)) {
                    return nextStep;
                } else {
                    console.log(`Next member step ${nextStep} not found, sequence may be complete`);
                }
            }
            
            // Pattern matching for simple numbered sequences: manager-1 -> manager-2, member-1 -> member-2
            const simpleMatch = currentBranch.match(/^(manager|member)-(\d+)$/);
            if (simpleMatch) {
                const [, type, number] = simpleMatch;
                const currentNum = parseInt(number);
                const nextNum = currentNum + 1;
                const nextStep = `${type}-${nextNum}`;
                
                console.log(`Simple sequence detected: ${currentBranch} -> ${nextStep}`);
                
                // Check if the next step exists
                if (document.querySelector(`[data-answer="${nextStep}"]`)) {
                    return nextStep;
                } else if (type === 'manager') {
                    console.log(`Next manager step ${nextStep} not found, checking for member-1`);
                    // If no more managers, go to first member
                    if (document.querySelector(`[data-answer="member-1"]`)) {
                        return 'member-1';
                    }
                }
            }
            
            console.log(`No sequential pattern found for: ${currentBranch}`);
            return null;
        },

        // Navigate to a specific step
        navigateToStep: function(stepId, direction = 'forward') {
            console.log(`Navigating to step: ${stepId} (${direction})`);
            
            // Store the selected branch before clearing it
            const selectedBranch = this.branchingState.selectedBranch;
            
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
                
                // Handle conditional step items within the target step
                this.handleStepItemVisibility(targetStep, direction, selectedBranch);
                
                // Clear the selected branch after navigation is complete
                this.branchingState.selectedBranch = null;
                
                // Trigger custom event
                this.triggerCustomEvent(targetStep, 'stepNavigation', {
                    stepId: stepId,
                    direction: direction,
                    step: targetStep
                });
            }
        },

        // Find relevant branch decision for a target step
        findRelevantBranchDecision: function(targetStep) {
            // Look through branch history to find decisions that led to this step
            for (let i = this.branchingState.branchHistory.length - 1; i >= 0; i--) {
                const decision = this.branchingState.branchHistory[i];
                
                // Check if this decision's target matches any step items in the target step
                const stepItems = targetStep.querySelectorAll('.step_item[data-answer], .step-item[data-answer]');
                for (const item of stepItems) {
                    if (item.dataset.answer === decision.selectedBranch) {
                        console.log(`Found relevant decision: ${decision.selectedBranch} for step`);
                        return decision;
                    }
                }
            }
            
            console.log('No relevant branch decision found for target step');
            return null;
        },

        // Auto-detect branching patterns in the form (modular pattern recognition)
        detectBranchingPatterns: function(form) {
            const patterns = {
                members: [],
                managers: [],
                other: []
            };
            
            // Find all radio button groups with data-go-to attributes
            const branchingGroups = form.querySelectorAll('input[type="radio"][data-go-to]');
            const groupsByName = {};
            
            branchingGroups.forEach(radio => {
                const groupName = radio.name;
                if (!groupsByName[groupName]) {
                    groupsByName[groupName] = [];
                }
                groupsByName[groupName].push(radio);
            });
            
            // Categorize patterns
            Object.entries(groupsByName).forEach(([groupName, radios]) => {
                const pattern = {
                    groupName: groupName,
                    radios: radios,
                    targets: radios.map(r => r.dataset.goTo),
                    step: radios[0].closest('[data-form="step"]')
                };
                
                if (groupName.toLowerCase().includes('member')) {
                    patterns.members.push(pattern);
                } else if (groupName.toLowerCase().includes('manager')) {
                    patterns.managers.push(pattern);
                } else {
                    patterns.other.push(pattern);
                }
            });
            
            console.log('Detected branching patterns:', patterns);
            return patterns;
        },

        // Validate that branching patterns have corresponding step items
        validateBranchingPatterns: function(patterns, form) {
            console.log('Validating branching patterns...');
            
            const allPatterns = [...patterns.members, ...patterns.managers, ...patterns.other];
            let validPatterns = 0;
            let invalidPatterns = 0;
            
            allPatterns.forEach(pattern => {
                const missingTargets = [];
                
                pattern.targets.forEach(target => {
                    const stepItem = form.querySelector(`[data-answer="${target}"]`);
                    if (!stepItem) {
                        missingTargets.push(target);
                    }
                });
                
                if (missingTargets.length === 0) {
                    validPatterns++;
                    console.log(`✅ Valid pattern: ${pattern.groupName} (${pattern.targets.length} options)`);
                } else {
                    invalidPatterns++;
                    console.warn(`⚠️ Invalid pattern: ${pattern.groupName} - Missing step items:`, missingTargets);
                }
            });
            
            console.log(`Pattern validation complete: ${validPatterns} valid, ${invalidPatterns} invalid`);
            
            if (invalidPatterns > 0) {
                console.warn('Some branching patterns are incomplete. Check your data-answer attributes on step items.');
            }
            
            return { validPatterns, invalidPatterns, total: allPatterns.length };
        },

        // Handle step item visibility based on selected branch
        handleStepItemVisibility: function(targetStep, direction = 'forward', selectedBranch = null) {
            const stepItems = targetStep.querySelectorAll('.step_item[data-answer], .step-item[data-answer]');
            
            if (stepItems.length === 0) {
                console.log('No step items found in target step');
                return;
            }
            
            console.log(`Found ${stepItems.length} step items in target step`);
            
            // Hide all step items first
            stepItems.forEach(item => {
                this.hideStepItem(item);
                console.log(`Hiding step item: ${item.dataset.answer}`);
            });
            
            let branchToShow = null;
            
            // For back navigation, look for previous branching decisions
            if (direction === 'back') {
                console.log('Back navigation detected, looking for previous branch decision...');
                
                // Find the most recent branching decision that led to this step
                const relevantDecision = this.findRelevantBranchDecision(targetStep);
                if (relevantDecision) {
                    branchToShow = relevantDecision.selectedBranch;
                    console.log(`Found previous branch decision: ${branchToShow}`);
                    
                    // Restore the radio button selection
                    if (relevantDecision.inputElement && relevantDecision.inputElement.type === 'radio') {
                        relevantDecision.inputElement.checked = true;
                        console.log(`Restored radio selection: ${relevantDecision.inputElement.value}`);
                    }
                }
            } else {
                // For forward navigation, prioritize new selections over history
                if (selectedBranch) {
                    branchToShow = selectedBranch;
                    console.log(`Using new selected branch for forward navigation: ${branchToShow}`);
                } else if (this.branchingState.selectedBranch) {
                    branchToShow = this.branchingState.selectedBranch;
                    console.log(`Using stored selected branch for forward navigation: ${branchToShow}`);
                } else {
                    // Only fall back to history if no new selection is available
                    console.log('No new selection found, checking branch history for forward navigation...');
                    const relevantDecision = this.findRelevantBranchDecision(targetStep);
                    if (relevantDecision) {
                        branchToShow = relevantDecision.selectedBranch;
                        console.log(`Using historical branch decision for forward navigation: ${branchToShow}`);
                    }
                }
            }
            
            // Show the appropriate step item
            if (branchToShow) {
                const targetItem = targetStep.querySelector(`[data-answer="${branchToShow}"]`);
                if (targetItem) {
                    this.showStepItem(targetItem);
                    console.log(`Showing step item: ${branchToShow}`);
                    
                    // Update current selected branch
                    this.branchingState.selectedBranch = branchToShow;
                    
                    // Update branching state
                    this.branchingState.conditionalSteps.forEach((stepInfo, stepId) => {
                        if (stepId === branchToShow) {
                            stepInfo.isVisible = true;
                        } else if (stepInfo.parentStep === targetStep) {
                            stepInfo.isVisible = false;
                        }
                    });
                } else {
                    console.warn(`Target step item not found: "${branchToShow}"`);
                    console.log(`Available step items:`, Array.from(stepItems).map(item => item.dataset.answer));
                }
            } else {
                console.log('No branch decision found, showing default step item');
                // Show first step item as default if no selection
                if (stepItems.length > 0) {
                    this.showStepItem(stepItems[0]);
                    console.log(`Showing default step item: ${stepItems[0].dataset.answer}`);
                }
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
            
            console.log('Showing step:', this.getStepId(step));
        },

        // Hide a step
        hideStep: function(step) {
            step.style.display = 'none';
            step.classList.remove('active-step');
            
            console.log('Hiding step:', this.getStepId(step));
        },

        // Show a step item (for conditional content within steps)
        showStepItem: function(item) {
            item.style.display = '';  // Reset to default display style
            item.style.visibility = 'visible';
            item.classList.add('active-step-item');
            console.log(`Step item shown: ${item.dataset.answer}`);
        },

        // Hide a step item
        hideStepItem: function(item) {
            item.style.display = 'none';
            item.style.visibility = 'hidden';
            item.classList.remove('active-step-item');
            console.log(`Step item hidden: ${item.dataset.answer}`);
        },

        // Reset branching state
        resetBranchingState: function() {
            this.branchingState.currentStep = null;
            this.branchingState.stepHistory = [];
            this.branchingState.branchHistory = [];
            this.branchingState.selectedBranch = null;
            
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
                branchHistory: [...this.branchingState.branchHistory],
                totalSteps: this.branchingState.conditionalSteps.size,
                totalBranchingRules: Array.from(this.branchingState.branchingRules.values()).flat().length,
                selectedBranch: this.branchingState.selectedBranch
            };
        },

        // Helper method for developers to easily create branching patterns
        createBranchingPattern: function(config) {
            /*
            Example usage:
            WebflowFieldEnhancer.createBranchingPattern({
                type: 'member', // or 'manager' or custom
                number: 5, // for member-5, manager-5, etc.
                options: ['individual', 'entity', 'trust'], // the branching options
                container: '.radio_component' // where to insert the pattern
            });
            */
            
            console.log('Creating branching pattern:', config);
            
            const { type, number, options, container } = config;
            
            if (!type || !options || !Array.isArray(options)) {
                console.error('Invalid branching pattern config. Required: type, options (array)');
                return false;
            }
            
            const patterns = options.map(option => ({
                radioId: `${option}-${type}${number ? `-${number}` : ''}`,
                radioName: `${type}${number ? `-${number}` : ''}-Type`,
                radioValue: option.charAt(0).toUpperCase() + option.slice(1),
                dataGoTo: `${option}${number ? `-${number}` : ''}`,
                stepItemAnswer: `${option}${number ? `-${number}` : ''}`
            }));
            
            console.log('Generated patterns:', patterns);
            
            return {
                patterns: patterns,
                instructions: {
                    radioButtons: 'Add radio buttons with the generated radioId, radioName, radioValue, and dataGoTo',
                    stepItems: 'Add step items with class "step_item" and data-answer matching stepItemAnswer',
                    validation: 'Use validateBranchingPatterns() to check implementation'
                }
            };
        },

        // Custom Error Validation System
        // ================================

        // Initialize custom error validation
        initCustomErrorValidation: function(form) {
            console.log('🔍 Initializing custom error validation system...');
            
            // Add CSS styles for enhanced validation
            this.addValidationStyles();
            
            // Find all required fields and their error messages
            const requiredFields = form.querySelectorAll('input[required]:not([type="radio"]), select[required], textarea[required]');
            
            requiredFields.forEach(field => {
                this.setupFieldValidation(field);
            });
            
            // Setup radio button group validation separately
            this.setupRadioGroupValidation(form);
            
            // Setup form submission validation
            this.setupFormSubmissionValidation(form);
            
            // Setup step navigation validation
            this.setupStepNavigationValidation(form);
            
            console.log(`✅ Custom validation setup complete for ${requiredFields.length} required fields`);
        },

        // Setup radio button group validation
        setupRadioGroupValidation: function(form) {
            console.log('🔘 Setting up radio button group validation...');
            
            // Find all required radio buttons and group them by name
            const requiredRadios = form.querySelectorAll('input[type="radio"][required]');
            const radioGroups = new Map();
            
            requiredRadios.forEach(radio => {
                const groupName = radio.name;
                if (!radioGroups.has(groupName)) {
                    radioGroups.set(groupName, {
                        name: groupName,
                        radios: [],
                        errorElement: null,
                        isBranching: false,
                        isStandardRequired: false,
                        isValid: true
                    });
                }
                
                const group = radioGroups.get(groupName);
                group.radios.push(radio);
                
                // Determine radio button type
                if (radio.hasAttribute('data-go-to')) {
                    group.isBranching = true;
                } else {
                    group.isStandardRequired = true;
                }
                
                // Track interaction state for standard required radio groups
                group.hasBeenInteracted = false;
            });
            
            // Setup validation for each radio group
            radioGroups.forEach((group, groupName) => {
                this.setupRadioGroupValidationForGroup(group, form);
            });
            
            // Store radio groups for later validation
            this.branchingState.radioGroups = radioGroups;
            
            console.log(`✅ Radio group validation setup complete for ${radioGroups.size} groups`);
        },

        // Setup validation for individual radio group
        setupRadioGroupValidationForGroup: function(group, form) {
            const groupName = group.name;
            console.log(`🔘 Setting up validation for radio group: "${groupName}" (${group.isBranching ? 'Branching' : 'Standard Required'})`);
            
            // Only find and manage error elements for standard required radio groups
            // Branching radio groups handle their own error display during navigation
            if (group.isStandardRequired) {
                group.errorElement = this.findRadioGroupErrorElement(group.radios[0]);
                
                if (group.errorElement) {
                    // Store original error message
                    const originalErrorMessage = group.errorElement.textContent.trim() || 'Please select an option';
                    group.originalErrorMessage = originalErrorMessage;
                    
                    // Hide error element initially
                    group.errorElement.style.display = 'none';
                    
                    console.log(`📝 Found error element for standard required radio group "${groupName}": "${originalErrorMessage}"`);
                } else {
                    console.warn(`No error element found for standard required radio group: "${groupName}"`);
                }
            } else if (group.isBranching) {
                // For branching radio buttons, find error element but don't manage it automatically
                group.errorElement = this.findRadioGroupErrorElement(group.radios[0]);
                
                if (group.errorElement) {
                    const originalErrorMessage = group.errorElement.textContent.trim() || 'Please select an option';
                    group.originalErrorMessage = originalErrorMessage;
                    
                    // Hide error element initially and keep it hidden until navigation attempt
                    group.errorElement.style.display = 'none';
                    
                    console.log(`🧭 Found error element for branching radio group "${groupName}" - will only show on navigation attempt`);
                }
            }
            
            // Add change listeners to all radios in the group
            group.radios.forEach(radio => {
                // Add interaction tracking for standard required radio groups
                radio.addEventListener('focus', () => {
                    if (group.isStandardRequired) {
                        group.hasBeenInteracted = true;
                        console.log(`👆 User focused on radio group "${group.name}" - marked as interacted`);
                    }
                });
                
                radio.addEventListener('change', () => {
                    if (radio.checked) {
                        // Mark as interacted for standard required radio groups
                        if (group.isStandardRequired) {
                            group.hasBeenInteracted = true;
                        }
                        
                        // For branching radios, only hide errors when selected
                        // Don't validate/show errors until navigation attempt
                        if (group.isBranching) {
                            this.hideRadioGroupError(group);
                            console.log(`🧭 Branching radio "${radio.value}" selected in group "${group.name}" - hiding any errors`);
                        } else {
                            // For standard required radios, validate normally
                            this.validateRadioGroup(group);
                        }
                    }
                });
            });
        },

        // Find error element for radio group
        findRadioGroupErrorElement: function(firstRadio) {
            // Look for error element in the radio group container
            const groupContainer = firstRadio.closest('.multi-form_field-wrapper') || 
                                 firstRadio.closest('.form_radio-2col') || 
                                 firstRadio.closest('.radio_component') || 
                                 firstRadio.parentElement;
            
            if (groupContainer) {
                // Look for error element within the container
                let errorElement = groupContainer.querySelector('.text-size-tiny.error-state');
                if (errorElement) return errorElement;
                
                errorElement = groupContainer.querySelector('.text-size-small.error-state');
                if (errorElement) return errorElement;
                
                // Look for error element after the container
                let nextElement = groupContainer.nextElementSibling;
                while (nextElement) {
                    if ((nextElement.classList.contains('text-size-tiny') || nextElement.classList.contains('text-size-small')) && 
                        nextElement.classList.contains('error-state')) {
                        return nextElement;
                    }
                    nextElement = nextElement.nextElementSibling;
                }
            }
            
            return null;
        },

        // Validate radio group
        validateRadioGroup: function(group) {
            const groupName = group.name;
            const isSelected = group.radios.some(radio => radio.checked);
            
            group.isValid = isSelected;
            
            if (group.isStandardRequired && group.errorElement) {
                if (isSelected) {
                    this.hideRadioGroupError(group);
                } else {
                    this.showRadioGroupError(group);
                }
            }
            
            console.log(`🔘 Radio group "${groupName}" validation: ${isSelected ? '✅ Valid' : '❌ Invalid'}`);
            return isSelected;
        },

        // Show radio group error
        showRadioGroupError: function(group) {
            if (!group.errorElement) return;
            
            // Show error message using original Webflow text
            if (group.errorElement.textContent !== group.originalErrorMessage) {
                group.errorElement.textContent = group.originalErrorMessage;
            }
            
            group.errorElement.style.display = 'block';
            
            // Add error styling to radio buttons
            group.radios.forEach(radio => {
                const radioWrapper = radio.closest('.form_radio') || radio.closest('.radio_field');
                if (radioWrapper) {
                    radioWrapper.classList.add('field-error');
                }
            });
            
            console.log(`📝 Showing error for radio group "${group.name}": "${group.originalErrorMessage}"`);
        },

        // Hide radio group error
        hideRadioGroupError: function(group) {
            if (!group.errorElement) return;
            
            group.errorElement.style.display = 'none';
            
            // Remove error styling from radio buttons
            group.radios.forEach(radio => {
                const radioWrapper = radio.closest('.form_radio') || radio.closest('.radio_field');
                if (radioWrapper) {
                    radioWrapper.classList.remove('field-error');
                }
            });
            
            console.log(`🧹 Hidden error for radio group "${group.name}"`);
        },

        // Validate all radio groups in current step
        validateCurrentStepRadioGroups: function(currentStep) {
            if (!this.branchingState.radioGroups) return true;
            
            let allValid = true;
            const invalidGroups = [];
            
            this.branchingState.radioGroups.forEach((group, groupName) => {
                // Check if any radio from this group is in the current step
                const hasRadioInStep = group.radios.some(radio => 
                    currentStep.contains(radio)
                );
                
                // Only validate standard required radio groups that have been interacted with
                // This prevents showing errors for untouched radio groups
                if (hasRadioInStep && group.isStandardRequired && group.hasBeenInteracted) {
                    const isGroupValid = this.validateRadioGroup(group);
                    if (!isGroupValid) {
                        allValid = false;
                        invalidGroups.push(group);
                    }
                }
            });
            
            if (!allValid) {
                console.log(`❌ Radio group validation failed for ${invalidGroups.length} interacted standard required groups in current step`);
                
                // Focus on first invalid radio group
                if (invalidGroups.length > 0 && invalidGroups[0].radios.length > 0) {
                    setTimeout(() => {
                        invalidGroups[0].radios[0].focus();
                    }, 100);
                }
            }
            
            return allValid;
        },

        // Validate branching radio groups for navigation
        validateBranchingRadioGroups: function(currentStep) {
            if (!this.branchingState.radioGroups) return true;
            
            let allValid = true;
            const invalidGroups = [];
            
            this.branchingState.radioGroups.forEach((group, groupName) => {
                // Check if any radio from this group is in the current step
                const hasRadioInStep = group.radios.some(radio => 
                    currentStep.contains(radio)
                );
                
                // Only validate branching radio groups for navigation
                if (hasRadioInStep && group.isBranching) {
                    const isSelected = group.radios.some(radio => radio.checked);
                    
                    if (!isSelected) {
                        allValid = false;
                        invalidGroups.push(group);
                        // Show error for branching radio groups only when trying to navigate
                        this.showRadioGroupError(group);
                        console.log(`❌ Branching radio group "${groupName}" validation failed - no selection made`);
                    } else {
                        // Hide error if selection is made
                        this.hideRadioGroupError(group);
                        console.log(`✅ Branching radio group "${groupName}" validation passed`);
                    }
                }
            });
            
            if (!allValid) {
                console.log(`❌ Branching radio group validation failed for ${invalidGroups.length} groups - navigation blocked`);
                
                // Focus on first invalid branching radio group
                if (invalidGroups.length > 0 && invalidGroups[0].radios.length > 0) {
                    setTimeout(() => {
                        invalidGroups[0].radios[0].focus();
                    }, 100);
                }
            }
            
            return allValid;
        },

        // Setup validation for individual field
        setupFieldValidation: function(field) {
            const fieldId = field.id || field.name || 'unnamed';
            console.log(`Setting up validation for field: ${fieldId}`);
            
            // Find associated error message element
            const errorElement = this.findErrorElement(field);
            
            if (!errorElement) {
                console.warn(`No error element found for field: ${fieldId}`);
                return;
            }
            
            // Store the original error message from Webflow (preserve custom messages)
            const originalErrorMessage = errorElement.textContent.trim() || 'Required!';
            
            // Hide error element initially (prevent showing errors on page load)
            errorElement.style.display = 'none';
            
            // Store field-error relationship with original message
            this.branchingState.validationErrors.set(field, {
                errorElement: errorElement,
                originalErrorMessage: originalErrorMessage, // Store original Webflow message
                isValid: true, // Start as valid to prevent initial errors
                lastValidated: null
            });
            
            console.log(`📝 Stored original error message for ${fieldId}: "${originalErrorMessage}"`);
            console.log(`🙈 Hidden error element initially for ${fieldId}`);
            
            // Add validation event listeners
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => {
                // Clear error on input if field was previously invalid
                if (!this.branchingState.validationErrors.get(field)?.isValid) {
                    this.validateField(field);
                }
            });
            
            // Handle tab key and focus events
            field.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && !field.value.trim() && field.required) {
                    // Validate on tab if field is empty and required
                    setTimeout(() => this.validateField(field), 10);
                }
            });
        },

        // Find error element associated with a field
        findErrorElement: function(field) {
            // Look for error element in the same field wrapper
            const fieldWrapper = field.closest('.multi-form_field-wrapper') || field.closest('.multi-form_input-field') || field.parentElement;
            
            if (fieldWrapper) {
                // Look for both .text-size-tiny.error-state and .text-size-small.error-state within the wrapper
                let errorElement = fieldWrapper.querySelector('.text-size-tiny.error-state');
                if (errorElement) return errorElement;
                
                errorElement = fieldWrapper.querySelector('.text-size-small.error-state');
                if (errorElement) return errorElement;
            }
            
            // Fallback: look for error element immediately after the field
            let nextElement = field.nextElementSibling;
            while (nextElement) {
                if ((nextElement.classList.contains('text-size-tiny') || nextElement.classList.contains('text-size-small')) && 
                    nextElement.classList.contains('error-state')) {
                    return nextElement;
                }
                nextElement = nextElement.nextElementSibling;
            }
            
            return null;
        },

        // Validate individual field
        validateField: function(field, showError = true) {
            const fieldId = field.id || field.name || 'unnamed';
            const validationData = this.branchingState.validationErrors.get(field);
            
            if (!validationData) {
                console.warn(`No validation data found for field: ${fieldId}`);
                return true;
            }
            
            let isValid = true;
            let customErrorMessage = null; // Only set for specific validation types
            
            // Check if field is required and empty
            if (field.required) {
                if (field.tagName.toLowerCase() === 'select') {
                    // For select dropdowns, check if no valid option is selected
                    // or if the selected value is empty/placeholder
                    const selectedValue = field.value;
                    const selectedOption = field.options[field.selectedIndex];
                    
                    if (!selectedValue || 
                        selectedValue === '' || 
                        selectedValue === 'Another option' || 
                        (selectedOption && selectedOption.disabled) ||
                        selectedValue.toLowerCase().includes('select')) {
                        isValid = false;
                        console.log(`Select validation failed - value: "${selectedValue}", selectedIndex: ${field.selectedIndex}`);
                        // Don't set customErrorMessage - use original Webflow message
                    }
                } else {
                    // For other input types, use trim() check
                    if (!field.value.trim()) {
                        isValid = false;
                        // Don't set customErrorMessage - use original Webflow message
                    }
                }
            }
            
            // Check for specific field types (these get custom messages)
            if (field.type === 'email' && field.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value.trim())) {
                    isValid = false;
                    customErrorMessage = 'Please enter a valid email address!';
                }
            }
            
            // Update validation state
            validationData.isValid = isValid;
            validationData.lastValidated = new Date();
            
            if (showError) {
                // Show/hide error message and apply styling
                if (isValid) {
                    this.hideFieldError(field);
                } else {
                    // Pass custom message only for specific validations, otherwise use original Webflow message
                    this.showFieldError(field, customErrorMessage);
                }
            }
            
            console.log(`🔍 Field validation - ${fieldId} (${field.tagName.toLowerCase()}): ${isValid ? '✅ Valid' : '❌ Invalid'} - Value: "${field.value}"`);
            return isValid;
        },

        // Show field error
        showFieldError: function(field, message = null) {
            const validationData = this.branchingState.validationErrors.get(field);
            if (!validationData) return;
            
            const { errorElement, originalErrorMessage } = validationData;
            
            // Use original Webflow message if no custom message provided
            // This preserves the custom error messages you set in Webflow
            const displayMessage = message || originalErrorMessage;
            
            // Only update the text if it's different (avoid unnecessary DOM updates)
            if (errorElement.textContent !== displayMessage) {
                errorElement.textContent = displayMessage;
                console.log(`📝 Using error message for ${field.id || field.name}: "${displayMessage}"`);
            }
            
            // Show error message
            errorElement.style.display = 'block';
            
            // Add red border to field
            this.addErrorStyling(field);
            
            // Trigger custom event
            this.triggerCustomEvent(field, 'validationError', { message: displayMessage });
        },

        // Hide field error
        hideFieldError: function(field) {
            const validationData = this.branchingState.validationErrors.get(field);
            if (!validationData) return;
            
            const { errorElement } = validationData;
            
            // Hide error message
            errorElement.style.display = 'none';
            
            // Remove red border from field
            this.removeErrorStyling(field);
            
            // Trigger custom event
            this.triggerCustomEvent(field, 'validationSuccess');
        },

        // Add error styling (red border) to field
        addErrorStyling: function(field) {
            const fieldId = field.id || field.name || 'unnamed';
            const fieldType = field.tagName.toLowerCase();
            
            // Store original border style if not already stored
            if (!field.dataset.originalBorder) {
                const computedStyle = window.getComputedStyle(field);
                field.dataset.originalBorder = computedStyle.border || computedStyle.borderColor || '';
            }
            
            // Apply red border with enhanced styling for select dropdowns
            field.style.border = '1.5px solid #dc3545';
            field.style.borderColor = '#dc3545';
            
            // Additional styling for select dropdowns
            if (fieldType === 'select') {
                field.style.outline = 'none';
                field.style.boxShadow = '0 0 0 0.2rem rgba(220, 53, 69, 0.25)';
                console.log(`🎨 Applied select error styling to: ${fieldId}`);
            }
            
            field.classList.add('field-error');
            
            console.log(`🎨 Applied error styling to ${fieldType}: ${fieldId}, classes: ${field.className}`);
        },

        // Remove error styling from field
        removeErrorStyling: function(field) {
            const fieldId = field.id || field.name || 'unnamed';
            const fieldType = field.tagName.toLowerCase();
            
            // Restore original border or remove error styling
            if (field.dataset.originalBorder) {
                field.style.border = field.dataset.originalBorder;
                field.style.borderColor = '';
            } else {
                field.style.border = '';
                field.style.borderColor = '';
            }
            
            // Clean up additional select dropdown styling
            if (fieldType === 'select') {
                field.style.outline = '';
                field.style.boxShadow = '';
                console.log(`🧹 Removed select error styling from: ${fieldId}`);
            }
            
            field.classList.remove('field-error');
            
            console.log(`🧹 Removed error styling from ${fieldType}: ${fieldId}`);
        },

        // Validate all fields in current step
        validateCurrentStep: function(showErrors = true) {
            if (!this.branchingState.currentStep) {
                console.warn('No current step to validate');
                return false;
            }
            
            console.log('🔍 Validating current step...');
            
            // Validate regular required fields (excluding radio buttons)
            const requiredFields = this.branchingState.currentStep.querySelectorAll('input[required]:not([type="radio"]), select[required], textarea[required]');
            let allValid = true;
            const invalidFields = [];
            
            requiredFields.forEach(field => {
                const isFieldValid = this.validateField(field, showErrors);
                if (!isFieldValid) {
                    allValid = false;
                    invalidFields.push(field);
                }
            });
            
            // Validate radio button groups separately
            const radioGroupsValid = this.validateCurrentStepRadioGroups(this.branchingState.currentStep);
            if (!radioGroupsValid) {
                allValid = false;
            }
            
            if (allValid) {
                console.log('✅ Current step validation passed');
            } else {
                console.log(`❌ Current step validation failed. Invalid regular fields: ${invalidFields.length}, Radio groups valid: ${radioGroupsValid}`);
                
                // Focus on first invalid field
                if (showErrors && invalidFields.length > 0) {
                    setTimeout(() => {
                        invalidFields[0].focus();
                    }, 100);
                }
            }
            
            return allValid;
        },

        // Validate entire form
        validateEntireForm: function(showErrors = true) {
            console.log('🔍 Validating entire form...');
            
            const form = document.querySelector('[data-form="multistep"]');
            if (!form) return false;
            
            const allRequiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
            let allValid = true;
            const invalidFields = [];
            
            allRequiredFields.forEach(field => {
                // Only validate visible fields
                const fieldStep = field.closest('[data-form="step"]');
                if (fieldStep && fieldStep.style.display !== 'none') {
                    const isFieldValid = this.validateField(field, showErrors);
                    if (!isFieldValid) {
                        allValid = false;
                        invalidFields.push({
                            field: field,
                            step: fieldStep
                        });
                    }
                }
            });
            
            if (allValid) {
                console.log('✅ Entire form validation passed');
            } else {
                console.log(`❌ Form validation failed. Invalid fields: ${invalidFields.length}`);
            }
            
            return { isValid: allValid, invalidFields };
        },

        // Setup form submission validation
        setupFormSubmissionValidation: function(form) {
            // Find submit buttons
            const submitButtons = form.querySelectorAll('[type="submit"], [data-form="submit-btn"]');
            
            submitButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    console.log('🚀 Form submission attempted - running validation...');
                    
                    const validation = this.validateEntireForm(true);
                    
                    if (!validation.isValid) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log('❌ Form submission blocked due to validation errors');
                        
                        // Find first invalid field and navigate to its step
                        if (validation.invalidFields.length > 0) {
                            const firstInvalidField = validation.invalidFields[0];
                            this.navigateToStepWithField(firstInvalidField.field);
                        }
                        
                        return false;
                    }
                    
                    console.log('✅ Form validation passed - allowing submission');
                });
            });
        },

        // Setup step navigation validation
        setupStepNavigationValidation: function(form) {
            // Find next step buttons
            const nextButtons = form.querySelectorAll('[data-form="next-btn"]');
            
            nextButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    console.log('➡️ Next step attempted - running validation...');
                    
                    // Validate standard required fields and standard required radio groups
                    const isCurrentStepValid = this.validateCurrentStep(true);
                    
                    // Validate branching radio groups separately (only on navigation attempt)
                    const areBranchingRadiosValid = this.validateBranchingRadioGroups(this.branchingState.currentStep);
                    
                    if (!isCurrentStepValid || !areBranchingRadiosValid) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log('❌ Step navigation blocked due to validation errors');
                        return false;
                    }
                    
                    console.log('✅ Step validation passed - allowing navigation');
                });
            });
        },

        // Navigate to step containing a specific field
        navigateToStepWithField: function(field) {
            const fieldStep = field.closest('[data-form="step"]');
            if (fieldStep && fieldStep !== this.branchingState.currentStep) {
                console.log('🧭 Navigating to step with invalid field...');
                
                // Hide current step
                if (this.branchingState.currentStep) {
                    this.hideStep(this.branchingState.currentStep);
                }
                
                // Show target step
                this.showStep(fieldStep);
                this.branchingState.currentStep = fieldStep;
                
                // Focus on the invalid field
                setTimeout(() => {
                    field.focus();
                }, 200);
            }
        },

        // Clear all validation errors
        clearAllValidationErrors: function() {
            console.log('🧹 Clearing all validation errors...');
            
            this.branchingState.validationErrors.forEach((validationData, field) => {
                this.hideFieldError(field);
            });
        },

        // Get validation summary
        getValidationSummary: function() {
            const summary = {
                totalFields: this.branchingState.validationErrors.size,
                validFields: 0,
                invalidFields: 0,
                fieldDetails: []
            };
            
            this.branchingState.validationErrors.forEach((validationData, field) => {
                const fieldId = field.id || field.name || 'unnamed';
                const fieldInfo = {
                    fieldId: fieldId,
                    isValid: validationData.isValid,
                    lastValidated: validationData.lastValidated
                };
                
                summary.fieldDetails.push(fieldInfo);
                
                if (validationData.isValid) {
                    summary.validFields++;
                } else {
                    summary.invalidFields++;
                }
            });
            
            return summary;
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

        // Add CSS styles for enhanced validation
        addValidationStyles: function() {
            const styleId = 'webflow-validation-styles';
            
            // Don't add styles if already present
            if (document.getElementById(styleId)) return;
            
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                /* Enhanced Webflow Form Validation Styles */
                
                /* Radio button error styling */
                .form_radio.field-error .w-radio-input,
                .radio_field.field-error .w-radio-input {
                    border: 2px solid #dc3545 !important;
                    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
                }
                
                .form_radio.field-error .form_radio-label,
                .radio_field.field-error .radio_label {
                    color: #dc3545 !important;
                }
                
                /* Input field error styling enhancements */
                .field-error {
                    border-color: #dc3545 !important;
                    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
                }
                
                /* Error state text styling */
                .text-size-tiny.error-state,
                .text-size-small.error-state {
                    color: #dc3545;
                    font-weight: 500;
                    margin-top: 0.25rem;
                    display: block;
                }
                
                /* Smooth transitions for error states */
                .form_radio .w-radio-input,
                .radio_field .w-radio-input,
                .form_input,
                .form_select {
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                }
                
                /* Focus states for accessibility */
                .field-error:focus {
                    border-color: #dc3545 !important;
                    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5) !important;
                    outline: none;
                }
            `;
            
            document.head.appendChild(style);
            console.log('✅ Enhanced validation styles added');
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