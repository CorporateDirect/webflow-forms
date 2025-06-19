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

        // Cache for country data and phone formatting
        countryDataCache: null,
        phoneFormatCache: new Map(),

        // Clear caches (useful for debugging)
        clearCaches: function() {
            this.countryDataCache = null;
            this.phoneFormatCache.clear();
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

})(window, document); /**
 * Tryformly-Compatible Multi-Step Form System
 * Drop-in replacement for tryformly.com with exact data attribute compatibility
 * Integrates with existing webflow-forms field enhancements
 * @version 1.0.0
 */

(function(window, document) {
    'use strict';

    class TryformlyCompatible {
        constructor() {
            this.forms = new Map();
            this.currentSteps = new Map();
            this.formData = new Map();
            this.stepHistory = new Map();
            this.config = {
                transitionDuration: 300,
                autoInit: true,
                validateOnNext: true,
                saveProgress: true
            };
            
            if (this.config.autoInit) {
                this.init();
            }
        }
        
        init() {
            // Inject styles first and hide steps immediately
            this.injectStyles();
            this.hideAllStepsImmediately();
            this.initializeForms();
            this.setupEventListeners();
            console.log('🎯 Tryformly-compatible system initialized');
        }
        
        hideAllStepsImmediately() {
            // Find and hide all potential steps immediately, before form initialization
            const stepSelectors = [
                '[data-form="step"]',
                '[data-step]',
                '[data-step-number]',
                '[data-form-step]',
                '.form-step',
                '.step'
            ];
            
            stepSelectors.forEach(selector => {
                const steps = document.querySelectorAll(selector);
                steps.forEach(step => {
                    step.style.display = 'none';
                    step.style.visibility = 'hidden';
                    step.classList.add('step-hidden');
                });
            });
            
            console.log('🔒 Pre-hidden all potential steps');
        }
        
        initializeForms() {
            // Find all multi-step forms using tryformly data attributes
            const formSelectors = [
                '[data-form="multistep"]',  // tryformly.com standard
                '[data-multi-step]',        // our alternative
                '[data-formly]',
                '[data-step-form]',
                '.multi-step-form'
            ];
            
            const forms = document.querySelectorAll(formSelectors.join(', '));
            
            forms.forEach(form => {
                this.setupForm(form);
            });
        }
        
        setupForm(form) {
            const formId = form.id || `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            form.setAttribute('data-form-id', formId);
            
            // Find steps
            const steps = this.findSteps(form);
            
            if (steps.length === 0) {
                console.warn('No steps found in form:', form);
                return;
            }
            
            // Store form data
            this.forms.set(formId, {
                element: form,
                steps: steps,
                totalSteps: steps.length
            });
            
            this.currentSteps.set(formId, 0);
            this.formData.set(formId, new Map());
            this.stepHistory.set(formId, []);
            
            // Initialize form state
            this.initializeFormState(formId);
            
            console.log(`✅ Form ${formId} initialized with ${steps.length} steps`);
        }
        
        findSteps(form) {
            // Multiple selectors for step detection (tryformly compatibility)
            let steps = [];
            
            // Try different selectors in order of preference
            const selectors = [
                '[data-form="step"]',       // tryformly.com standard
                '[data-step]',              // our alternative
                '[data-step-number]',
                '[data-form-step]',
                '.form-step',
                '.step'
            ];
            
            for (const selector of selectors) {
                steps = Array.from(form.querySelectorAll(selector));
                if (steps.length > 0) {
                    console.log(`📋 Found ${steps.length} steps using selector: ${selector}`);
                    break;
                }
            }
            
            if (steps.length === 0) {
                console.warn('❌ No steps found in form. Tried selectors:', selectors);
                return [];
            }
            
            // Sort by step number if available
            steps.sort((a, b) => {
                const aNum = this.getStepNumber(a);
                const bNum = this.getStepNumber(b);
                return aNum - bNum;
            });
            
            // Ensure all steps have proper data attributes
            steps.forEach((step, index) => {
                const stepNumber = index + 1;
                if (!step.hasAttribute('data-step') && !step.hasAttribute('data-form')) {
                    step.setAttribute('data-step', stepNumber);
                }
                step.classList.add('form-step');
            });
            
            return steps;
        }
        
        getStepNumber(stepElement) {
            return parseInt(
                stepElement.getAttribute('data-step') ||
                stepElement.getAttribute('data-step-number') ||
                stepElement.getAttribute('data-form-step') ||
                '1'
            );
        }
        
        initializeFormState(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            // Hide all steps immediately, then show first
            formData.steps.forEach((step, index) => {
                this.hideStep(step);  // Hide all first
            });
            
            // Show first step
            if (formData.steps.length > 0) {
                this.showStep(formData.steps[0]);
            }
            
            this.updateProgress(formId);
            this.updateNavigation(formId);
            this.processConditionalLogic(formId);
        }
        
        setupEventListeners() {
            // Use event delegation for better performance
            document.addEventListener('click', this.handleClick.bind(this));
            document.addEventListener('change', this.handleChange.bind(this));
            document.addEventListener('input', this.handleInput.bind(this));
        }
        
        handleClick(e) {
            const target = e.target;
            const formId = this.getFormId(target);
            
            if (!formId) return;
            
            // Navigation buttons (tryformly data attributes)
            if (this.isNextButton(target)) {
                e.preventDefault();
                this.nextStep(formId);
            } else if (this.isPrevButton(target)) {
                e.preventDefault();
                this.prevStep(formId);
            } else if (this.isSubmitButton(target)) {
                e.preventDefault();
                this.submitForm(formId);
            }
            
            // Conditional navigation (data-go-to)
            else if (target.hasAttribute('data-go-to')) {
                e.preventDefault();
                this.handleGoTo(formId, target);
            }
            
            // Skip functionality (data-skip)
            else if (target.hasAttribute('data-skip')) {
                e.preventDefault();
                this.handleSkip(formId, target);
            }
        }
        
        handleChange(e) {
            const target = e.target;
            const formId = this.getFormId(target);
            
            if (!formId) return;
            
            // Save field data
            this.saveFieldData(formId, target);
            
            // Handle conditional logic based on data-answer
            if (target.hasAttribute('data-answer')) {
                this.checkConditionalLogic(formId, target);
            }
            
            // Handle radio button skip logic
            if (target.type === 'radio' && target.hasAttribute('data-skip')) {
                this.handleSkip(formId, target);
            }
        }
        
        handleInput(e) {
            const target = e.target;
            const formId = this.getFormId(target);
            
            if (!formId) return;
            
            // Debounced save for text inputs
            clearTimeout(target._inputTimeout);
            target._inputTimeout = setTimeout(() => {
                this.saveFieldData(formId, target);
            }, 300);
        }
        
                // Button detection methods
        isNextButton(element) {
            return element.matches([
                '[data-form="next-btn"]',   // tryformly.com standard
                '[data-next]',              // our alternative
                '[data-step-next]', 
                '[data-formly-next]',
                '.next-btn',
                '.step-next'
            ].join(', '));
        }

        isPrevButton(element) {
            return element.matches([
                '[data-form="back-btn"]',   // tryformly.com standard  
                '[data-prev]',              // our alternative
                '[data-step-prev]',
                '[data-formly-prev]', 
                '.prev-btn',
                '.step-prev'
            ].join(', '));
        }
        
        isSubmitButton(element) {
            return element.matches([
                '[data-form="submit-btn"]', // tryformly.com standard
                '[data-submit]',            // our alternative
                '[data-step-submit]',
                '[data-formly-submit]',
                '.submit-btn',
                '.step-submit'
            ].join(', '));
        }
        
        // Core navigation methods
        nextStep(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const currentStepIndex = this.currentSteps.get(formId);
            
            // Validate current step
            if (this.config.validateOnNext && !this.validateStep(formId, currentStepIndex)) {
                return false;
            }
            
            // Save current step data
            this.saveStepData(formId, currentStepIndex);
            
            // Calculate next step (with skip logic)
            const nextStepIndex = this.getNextStepIndex(formId, currentStepIndex);
            
            if (nextStepIndex < formData.totalSteps) {
                this.goToStep(formId, nextStepIndex);
            } else {
                this.handleComplete(formId);
            }
            
            return true;
        }
        
        prevStep(formId) {
            const history = this.stepHistory.get(formId);
            if (history && history.length > 0) {
                const prevStepIndex = history.pop();
                this.goToStep(formId, prevStepIndex, false);
            }
        }
        
        goToStep(formId, targetStepIndex, addToHistory = true) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const currentStepIndex = this.currentSteps.get(formId);
            
            if (targetStepIndex === currentStepIndex) return;
            if (targetStepIndex < 0 || targetStepIndex >= formData.totalSteps) return;
            
            // Add to history for back navigation
            if (addToHistory && targetStepIndex > currentStepIndex) {
                this.stepHistory.get(formId).push(currentStepIndex);
            }
            
            // Hide current step
            this.hideStep(formData.steps[currentStepIndex]);
            
            // Show target step after transition
            setTimeout(() => {
                this.showStep(formData.steps[targetStepIndex]);
                this.currentSteps.set(formId, targetStepIndex);
                this.updateProgress(formId);
                this.updateNavigation(formId);
                this.triggerStepChangeEvent(formId, targetStepIndex, currentStepIndex);
            }, this.config.transitionDuration);
        }
        
        getNextStepIndex(formId, currentStepIndex) {
            const formData = this.forms.get(formId);
            let nextStepIndex = currentStepIndex + 1;
            
            // Apply skip logic
            while (nextStepIndex < formData.totalSteps) {
                if (this.shouldSkipStep(formId, nextStepIndex)) {
                    console.log(`⏭️ Skipping step ${nextStepIndex + 1}`);
                    nextStepIndex++;
                } else {
                    break;
                }
            }
            
            return nextStepIndex;
        }
        
        shouldSkipStep(formId, stepIndex) {
            const formData = this.forms.get(formId);
            const step = formData.steps[stepIndex];
            const currentFormData = this.formData.get(formId);
            
            // Check data-skip-if attribute (tryformly compatibility)
            const skipCondition = step.getAttribute('data-skip-if');
            if (skipCondition) {
                return this.evaluateSkipCondition(skipCondition, currentFormData);
            }
            
            return false;
        }
        
        evaluateSkipCondition(condition, formData) {
            // Parse skip conditions like:
            // "field-name=value"
            // "field-name!=value"
            // "field-name=value1,value2" (multiple values)
            
            const match = condition.match(/^(.+?)(=|!=)(.+)$/);
            if (!match) return false;
            
            const [, fieldName, operator, values] = match;
            const expectedValues = values.split(',').map(v => v.trim());
            const actualValue = formData.get(fieldName.trim());
            
            if (operator === '!=') {
                return expectedValues.includes(actualValue);
            } else {
                return !expectedValues.includes(actualValue);
            }
        }
        
        // Conditional logic handling (data-go-to + data-answer)
        handleGoTo(formId, element) {
            const targetStep = element.getAttribute('data-go-to');
            const requiredAnswer = element.getAttribute('data-answer');
            
            // Check if answer matches (if specified)
            if (requiredAnswer) {
                const elementValue = this.getElementValue(element);
                if (elementValue !== requiredAnswer) {
                    return; // Don't navigate if answer doesn't match
                }
            }
            
            // Store the go-to value for step-wrapper logic
            const formData = this.formData.get(formId);
            if (formData) {
                formData.set('_lastGoTo', targetStep);
            }
            
            // Handle numeric step navigation
            if (/^\d+$/.test(targetStep)) {
                const targetStepIndex = parseInt(targetStep) - 1; // Convert to 0-based
                if (targetStepIndex >= 0) {
                    this.goToStep(formId, targetStepIndex);
                }
            } else {
                // Handle named step navigation (for step-wrappers)
                // Go to next step and let showStepWrappers handle the wrapper selection
                this.nextStep(formId);
            }
        }
        
        checkConditionalLogic(formId, field) {
            const goToStep = field.getAttribute('data-go-to');
            const answerValue = field.getAttribute('data-answer');
            
            if (goToStep && answerValue) {
                const fieldValue = this.getElementValue(field);
                
                // For radio buttons, only proceed if this one is checked
                if (field.type === 'radio' && !field.checked) {
                    return;
                }
                
                // Check if value matches required answer
                if (fieldValue === answerValue) {
                    // Small delay for visual feedback
                    setTimeout(() => {
                        this.handleGoTo(formId, field);
                    }, 100);
                }
            }
        }
        
        // Skip functionality (data-skip)
        handleSkip(formId, element) {
            const skipToStep = element.getAttribute('data-skip');
            
            if (skipToStep) {
                const targetStepIndex = parseInt(skipToStep) - 1;
                this.goToStep(formId, targetStepIndex);
            } else {
                // Default skip behavior
                this.nextStep(formId);
            }
        }
        
        // Form validation
        validateStep(formId, stepIndex) {
            const formData = this.forms.get(formId);
            if (!formData) return true;
            
            const step = formData.steps[stepIndex];
            const requiredFields = step.querySelectorAll('[required]');
            
            let isValid = true;
            const errors = [];
            
            requiredFields.forEach(field => {
                if (!this.isFieldValid(field)) {
                    isValid = false;
                    errors.push(field);
                    this.markFieldError(field);
                } else {
                    this.clearFieldError(field);
                }
            });
            
            if (!isValid) {
                this.showValidationErrors(formId, stepIndex, errors);
                // Focus first error
                if (errors.length > 0) {
                    errors[0].focus();
                }
            }
            
            return isValid;
        }
        
        isFieldValid(field) {
            if (!field.required) return true;
            
            switch (field.type) {
                case 'radio':
                    const radioGroup = document.querySelectorAll(`[name="${field.name}"]`);
                    return Array.from(radioGroup).some(radio => radio.checked);
                
                case 'checkbox':
                    return field.checked;
                
                case 'email':
                    return field.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
                
                default:
                    return field.value.trim() !== '';
            }
        }
        
        markFieldError(field) {
            field.classList.add('field-error', 'error');
            field.setAttribute('aria-invalid', 'true');
        }
        
        clearFieldError(field) {
            field.classList.remove('field-error', 'error');
            field.removeAttribute('aria-invalid');
        }
        
        showValidationErrors(formId, stepIndex, errors) {
            const formData = this.forms.get(formId);
            const step = formData.steps[stepIndex];
            
            // Remove existing errors
            const existing = step.querySelectorAll('.validation-error-message');
            existing.forEach(el => el.remove());
            
            // Create error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'validation-error-message';
            errorDiv.innerHTML = `
                <div class="error-content">
                    <strong>⚠️ Please complete these fields:</strong>
                    <ul>
                        ${errors.map(field => `<li>${this.getFieldLabel(field)}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            step.insertBefore(errorDiv, step.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.classList.add('fade-out');
                    setTimeout(() => errorDiv.remove(), 300);
                }
            }, 5000);
        }
        
        getFieldLabel(field) {
            // Try multiple ways to find field label
            const label = document.querySelector(`label[for="${field.id}"]`) ||
                         field.closest('label') ||
                         field.previousElementSibling?.tagName === 'LABEL' ? field.previousElementSibling : null;
            
            if (label) {
                return label.textContent.trim().replace(/\*\s*$/, '');
            }
            
            return field.getAttribute('placeholder') || field.name || 'Required field';
        }
        
        // Data management
        saveFieldData(formId, field) {
            const formDataMap = this.formData.get(formId);
            if (!formDataMap || !field.name) return;
            
            const value = this.getElementValue(field);
            formDataMap.set(field.name, value);
        }
        
        saveStepData(formId, stepIndex) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const step = formData.steps[stepIndex];
            const fields = step.querySelectorAll('input, select, textarea');
            
            fields.forEach(field => {
                this.saveFieldData(formId, field);
            });
        }
        
        getElementValue(element) {
            switch (element.type) {
                case 'radio':
                    return element.checked ? element.value : null;
                case 'checkbox':
                    return element.checked;
                default:
                    return element.value;
            }
        }
        
        // Step visibility
        showStep(step) {
            step.style.display = 'block';
            step.classList.remove('step-hidden');
            step.classList.add('step-visible', 'step-enter');
            
            // Handle step-wrappers with data-answer attributes (tryformly branching logic)
            this.showStepWrappers(step);
            
            // Focus first input
            setTimeout(() => {
                const firstInput = step.querySelector('input:not([type="hidden"]), select, textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }, this.config.transitionDuration);
        }
        
        hideStep(step) {
            step.style.display = 'none';  // Hide immediately
            step.classList.remove('step-visible', 'step-enter');
            step.classList.add('step-hidden');
        }
        
        // Step-wrapper branching logic (tryformly compatibility)
        showStepWrappers(step) {
            const formId = this.getFormId(step);
            if (!formId) return;
            
            const formData = this.formData.get(formId);
            if (!formData) return;
            
            // Find all step-wrappers in this step
            const stepWrappers = step.querySelectorAll('[data-answer]');
            
            if (stepWrappers.length === 0) return;
            
            // Hide all step-wrappers initially
            stepWrappers.forEach(wrapper => {
                wrapper.style.display = 'none';
                wrapper.classList.remove('wrapper-visible');
                wrapper.classList.add('wrapper-hidden');
            });
            
            // Determine which wrapper(s) to show based on previous selections
            const activeWrapper = this.getActiveStepWrapper(step, formData);
            
            if (activeWrapper) {
                activeWrapper.style.display = 'block';
                activeWrapper.classList.remove('wrapper-hidden');
                activeWrapper.classList.add('wrapper-visible');
                console.log(`📋 Showing wrapper with data-answer="${activeWrapper.getAttribute('data-answer')}"`);
            } else {
                // Show first wrapper with empty data-answer (first step wrapper)
                const firstWrapper = step.querySelector('[data-answer=""]');
                if (firstWrapper) {
                    firstWrapper.style.display = 'block';
                    firstWrapper.classList.remove('wrapper-hidden');
                    firstWrapper.classList.add('wrapper-visible');
                    console.log('📋 Showing first step wrapper (data-answer="")');
                }
            }
        }
        
        getActiveStepWrapper(step, formData) {
            const stepWrappers = step.querySelectorAll('[data-answer]');
            
            // Check each wrapper's data-answer against form data
            for (const wrapper of stepWrappers) {
                const answerValue = wrapper.getAttribute('data-answer');
                
                // Skip empty answers (first step wrappers)
                if (answerValue === '') continue;
                
                // Check if this answer matches any form field value
                if (this.hasMatchingFormValue(formData, answerValue)) {
                    return wrapper;
                }
            }
            
            return null;
        }
        
        hasMatchingFormValue(formData, answerValue) {
            // Check if any form field has this value
            for (const [fieldName, fieldValue] of formData) {
                if (fieldValue === answerValue) {
                    return true;
                }
            }
            
            // Also check for direct step navigation values
            // (when data-go-to points to a step name instead of field value)
            return formData.has('_lastGoTo') && formData.get('_lastGoTo') === answerValue;
        }
        
        // UI updates
        updateProgress(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const currentStep = this.currentSteps.get(formId);
            const progress = ((currentStep + 1) / formData.totalSteps) * 100;
            
            // Update progress bars
            const progressBars = formData.element.querySelectorAll(
                '[data-progress], [data-step-progress], .progress-bar'
            );
            progressBars.forEach(bar => {
                bar.style.width = `${progress}%`;
                bar.setAttribute('aria-valuenow', progress);
            });
            
            // Update step indicators
            const indicators = formData.element.querySelectorAll(
                '[data-step-indicator], .step-indicator'
            );
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentStep);
                indicator.classList.toggle('completed', index < currentStep);
            });
            
            // Update step counters
            const counters = formData.element.querySelectorAll(
                '[data-step-counter], .step-counter'
            );
            counters.forEach(counter => {
                counter.textContent = `${currentStep + 1} of ${formData.totalSteps}`;
            });
        }
        
        updateNavigation(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const currentStep = this.currentSteps.get(formId);
            const isFirst = currentStep === 0;
            const isLast = currentStep === formData.totalSteps - 1;
            
            // Update prev buttons
            const prevBtns = formData.element.querySelectorAll(
                '[data-prev], [data-step-prev], [data-formly-prev], .prev-btn'
            );
            prevBtns.forEach(btn => {
                btn.style.display = isFirst ? 'none' : '';
                btn.disabled = isFirst;
            });
            
            // Update next buttons
            const nextBtns = formData.element.querySelectorAll(
                '[data-next], [data-step-next], [data-formly-next], .next-btn'
            );
            nextBtns.forEach(btn => {
                btn.style.display = isLast ? 'none' : '';
            });
            
            // Update submit buttons
            const submitBtns = formData.element.querySelectorAll(
                '[data-submit], [data-step-submit], [data-formly-submit], .submit-btn'
            );
            submitBtns.forEach(btn => {
                btn.style.display = isLast ? '' : 'none';
            });
        }
        
        // Form completion
        handleComplete(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            // Check for final step
            const finalStep = formData.element.querySelector(
                '[data-final-step], [data-success-step], .final-step'
            );
            
            if (finalStep) {
                this.showFinalStep(formId, finalStep);
            } else {
                this.submitForm(formId);
            }
        }
        
        showFinalStep(formId, finalStep) {
            const formData = this.forms.get(formId);
            const currentStep = formData.steps[this.currentSteps.get(formId)];
            
            this.hideStep(currentStep);
            setTimeout(() => {
                this.showStep(finalStep);
            }, this.config.transitionDuration);
        }
        
        submitForm(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            // Final validation
            const currentStep = this.currentSteps.get(formId);
            if (!this.validateStep(formId, currentStep)) {
                return;
            }
            
            // Save final data
            this.saveStepData(formId, currentStep);
            
            // Get all form data
            const allData = Object.fromEntries(this.formData.get(formId));
            
            // Trigger event
            const event = new CustomEvent('multiStepSubmit', {
                detail: {
                    formId,
                    formData: allData,
                    totalSteps: formData.totalSteps
                }
            });
            formData.element.dispatchEvent(event);
            
            // Inject hidden inputs and submit
            this.injectHiddenInputs(formId, allData);
            
            if (!formData.element.hasAttribute('data-custom-submit')) {
                formData.element.submit();
            }
        }
        
        injectHiddenInputs(formId, data) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const form = formData.element;
            
            // Remove existing injected inputs
            const existing = form.querySelectorAll('[data-injected-input]');
            existing.forEach(input => input.remove());
            
            // Add hidden inputs for all data
            Object.entries(data).forEach(([name, value]) => {
                // Skip if visible input exists
                if (form.querySelector(`[name="${name}"]:not([data-injected-input])`)) {
                    return;
                }
                
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value || '';
                input.setAttribute('data-injected-input', 'true');
                form.appendChild(input);
            });
        }
        
        // Event handling
        triggerStepChangeEvent(formId, newStep, oldStep) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            const event = new CustomEvent('stepChange', {
                detail: {
                    formId,
                    currentStep: newStep + 1,
                    previousStep: oldStep + 1,
                    totalSteps: formData.totalSteps,
                    direction: newStep > oldStep ? 'forward' : 'backward',
                    formData: Object.fromEntries(this.formData.get(formId))
                }
            });
            
            formData.element.dispatchEvent(event);
        }
        
        processConditionalLogic(formId) {
            const formData = this.forms.get(formId);
            if (!formData) return;
            
            // Add visual indicators for conditional elements
            const conditionalElements = formData.element.querySelectorAll(
                '[data-go-to], [data-answer], [data-skip]'
            );
            
            conditionalElements.forEach(element => {
                if (element.hasAttribute('data-go-to')) {
                    element.classList.add('has-goto-logic');
                }
                if (element.hasAttribute('data-skip')) {
                    element.classList.add('has-skip-logic');
                }
            });
        }
        
        // Utility methods
        getFormId(element) {
            const form = element.closest('[data-form-id]');
            return form ? form.getAttribute('data-form-id') : null;
        }
        
        // Inject required CSS
        injectStyles() {
            if (document.getElementById('tryformly-compatible-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'tryformly-compatible-styles';
            style.textContent = `
                /* Step transitions */
                .form-step, .step {
                    transition: opacity 300ms ease, transform 300ms ease;
                }
                
                /* Hide steps by default - AGGRESSIVE */
                [data-form="step"], [data-step], [data-step-number], [data-form-step], .form-step, .step {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    position: absolute !important;
                    left: -9999px !important;
                }
                
                .step-hidden {
                    display: none !important;
                    opacity: 0;
                    transform: translateX(-20px);
                    pointer-events: none;
                }
                
                .step-visible {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    position: static !important;
                    left: auto !important;
                    transform: translateX(0);
                }
                
                .step-enter {
                    animation: stepEnter 300ms ease;
                }
                
                .step-exit {
                    animation: stepExit 300ms ease;
                }
                
                @keyframes stepEnter {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes stepExit {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                }
                
                /* Validation styles */
                .field-error {
                    border-color: #dc3545 !important;
                    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
                }
                
                .validation-error-message {
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                    padding: 15px;
                    margin: 15px 0;
                    border-radius: 6px;
                    animation: errorSlideIn 300ms ease;
                }
                
                .validation-error-message.fade-out {
                    animation: errorSlideOut 300ms ease;
                }
                
                @keyframes errorSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes errorSlideOut {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                }
                
                /* Conditional logic indicators */
                .has-goto-logic {
                    position: relative;
                }
                
                .has-goto-logic::after {
                    content: "→";
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #007bff;
                    font-weight: bold;
                    pointer-events: none;
                }
                
                .has-skip-logic {
                    position: relative;
                }
                
                .has-skip-logic::after {
                    content: "⏭";
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #ffc107;
                    pointer-events: none;
                }
                
                /* Progress indicators */
                .step-indicator {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: #e9ecef;
                    color: #6c757d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    transition: all 300ms ease;
                }
                
                .step-indicator.active {
                    background: #007bff;
                    color: white;
                }
                
                .step-indicator.completed {
                    background: #28a745;
                    color: white;
                }
                
                /* Step-wrapper branching logic */
                [data-answer] {
                    transition: all 300ms ease;
                }
                
                [data-answer].wrapper-hidden {
                    opacity: 0;
                    transform: translateX(-20px);
                    pointer-events: none;
                }
                
                [data-answer].wrapper-visible {
                    opacity: 1;
                    transform: translateX(0);
                    pointer-events: auto;
                }
            `;
            
            document.head.appendChild(style);
        }
        
        // Public API (tryformly compatibility)
        getCurrentStep(formElement) {
            const formId = formElement.getAttribute('data-form-id');
            return (this.currentSteps.get(formId) || 0) + 1;
        }
        
        getFormData(formElement) {
            const formId = formElement.getAttribute('data-form-id');
            const data = this.formData.get(formId);
            return data ? Object.fromEntries(data) : {};
        }
        
        goToStepManual(formElement, stepNumber) {
            const formId = formElement.getAttribute('data-form-id');
            this.goToStep(formId, stepNumber - 1);
        }
        
        getTotalSteps(formElement) {
            const formId = formElement.getAttribute('data-form-id');
            const formData = this.forms.get(formId);
            return formData ? formData.totalSteps : 0;
        }
    }

    // IMMEDIATE step hiding - runs as soon as script loads
    (function hideStepsImmediately() {
        const stepSelectors = [
            '[data-form="step"]',
            '[data-step]',
            '[data-step-number]',
            '[data-form-step]',
            '.form-step',
            '.step'
        ];
        
        stepSelectors.forEach(selector => {
            const steps = document.querySelectorAll(selector);
            steps.forEach(step => {
                step.style.display = 'none';
                step.style.visibility = 'hidden';
                step.style.opacity = '0';
                step.style.position = 'absolute';
                step.style.left = '-9999px';
            });
        });
        
        if (stepSelectors.some(sel => document.querySelectorAll(sel).length > 0)) {
            console.log('⚡ Immediately hid steps on script load');
        }
    })();

    // Initialize when DOM is ready
    let tryformlyInstance;
    
    function initialize() {
        tryformlyInstance = new TryformlyCompatible();
        tryformlyInstance.init();
        
        // Make available globally (tryformly compatibility)
        window.Formly = tryformlyInstance;
        window.TryformlyCompatible = tryformlyInstance;
        
        console.log('🎯 Tryformly-compatible system ready');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})(window, document); 