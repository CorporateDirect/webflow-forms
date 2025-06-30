/**
 * Webflow Forms - Phone Formatting Fix
 * Fixes the disconnect between country code dropdowns and phone formatting
 * @version 1.0.0
 * @author Chris Brummer
 */

(function(window, document) {
    'use strict';

    console.log('📞 Loading Phone Formatting Fix...');

    const PhoneFormattingFix = {
        version: '1.0.0',
        phoneFieldMappings: new Map(),

        init: function() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => this.setup(), 2000); // Wait for other libraries
                });
            } else {
                setTimeout(() => this.setup(), 2000);
            }
        },

        setup: function() {
            console.log('📞 Setting up phone formatting fix...');
            
            this.mapPhoneFields();
            this.setupPhoneFormatting();
            this.setupCountryCodeListeners();
            
            console.log('✅ Phone formatting fix ready!');
        },

        // Map phone fields to their country code dropdowns
        mapPhoneFields: function() {
            console.log('📞 Mapping phone fields to country code dropdowns...');
            
            const phoneFields = document.querySelectorAll('input[type="tel"], input[data-step-field-name="phone"]');
            
            phoneFields.forEach(phoneField => {
                const container = phoneField.closest('[data-form="step"]') || phoneField.closest('.multi-form_step');
                if (container) {
                    // Look for country code dropdown in the same container
                    const countryDropdown = container.querySelector('select[data-country-code="true"], select[data-step-field-name="countryCode"]');
                    
                    if (countryDropdown) {
                        const phoneFieldId = phoneField.id || phoneField.name;
                        
                        this.phoneFieldMappings.set(phoneFieldId, {
                            phoneField: phoneField,
                            countryDropdown: countryDropdown,
                            container: container
                        });
                        
                        console.log(`📞 Mapped: ${phoneFieldId} ↔ ${countryDropdown.id}`);
                    }
                }
            });
            
            console.log(`📞 Mapped ${this.phoneFieldMappings.size} phone field pairs`);
        },

        // Setup real-time phone formatting
        setupPhoneFormatting: function() {
            this.phoneFieldMappings.forEach((mapping, phoneFieldId) => {
                const { phoneField, countryDropdown } = mapping;
                
                // Initialize with current country code
                this.updatePhoneFormat(phoneField, countryDropdown);
                
                // Listen for phone input
                phoneField.addEventListener('input', () => {
                    this.formatPhoneNumber(phoneField, countryDropdown);
                });
            });
        },

        // Setup country code change listeners
        setupCountryCodeListeners: function() {
            this.phoneFieldMappings.forEach((mapping, phoneFieldId) => {
                const { phoneField, countryDropdown } = mapping;
                
                // Listen for country code changes
                countryDropdown.addEventListener('change', () => {
                    console.log(`📞 Country changed for ${phoneFieldId}`);
                    this.updatePhoneFormat(phoneField, countryDropdown);
                    this.formatPhoneNumber(phoneField, countryDropdown);
                });
            });
        },

        // Update phone formatting based on country selection
        updatePhoneFormat: function(phoneField, countryDropdown) {
            const selectedOption = countryDropdown.options[countryDropdown.selectedIndex];
            if (!selectedOption) return;
            
            // Extract country code from option value or text
            let countryCode = '+1'; // default
            const optionValue = selectedOption.value;
            const optionText = selectedOption.text;
            
            // Try to get country code from value
            if (optionValue && optionValue.startsWith('+')) {
                countryCode = optionValue;
            } else if (optionText.includes('+')) {
                const match = optionText.match(/\+\d+/);
                if (match) {
                    countryCode = match[0];
                }
            }
            
            // Store the country code on the phone field
            phoneField._currentCountryCode = countryCode;
            phoneField._countryISO = this.getCountryISOFromCode(countryCode);
            
            console.log(`📞 Updated phone format: ${phoneField.id} → ${countryCode} (${phoneField._countryISO})`);
        },

        // Format phone number in real-time
        formatPhoneNumber: function(phoneField, countryDropdown) {
            const value = phoneField.value;
            const countryCode = phoneField._currentCountryCode || '+1';
            const countryISO = phoneField._countryISO || 'US';
            
            if (!value) return;
            
            try {
                // Use libphonenumber if available
                if (typeof window.AsYouType !== 'undefined') {
                    const formatter = new window.AsYouType(countryISO);
                    const formatted = formatter.input(value);
                    
                    if (formatted && formatted !== value) {
                        const cursorPos = phoneField.selectionStart;
                        phoneField.value = formatted;
                        
                        // Restore cursor position (approximately)
                        const newPos = Math.min(cursorPos + (formatted.length - value.length), formatted.length);
                        phoneField.setSelectionRange(newPos, newPos);
                    }
                } else {
                    // Fallback formatting for US/Canada
                    if (countryCode === '+1') {
                        const cleaned = value.replace(/\D/g, '');
                        if (cleaned.length === 10) {
                            const formatted = `(${cleaned.substr(0,3)}) ${cleaned.substr(3,3)}-${cleaned.substr(6,4)}`;
                            if (formatted !== value) {
                                phoneField.value = formatted;
                            }
                        }
                    }
                }
            } catch (error) {
                console.warn('📞 Phone formatting error:', error);
            }
        },

        // Get country ISO code from dialing code
        getCountryISOFromCode: function(dialingCode) {
            const mapping = {
                '+1': 'US',
                '+44': 'GB', 
                '+33': 'FR',
                '+49': 'DE',
                '+81': 'JP',
                '+86': 'CN',
                '+91': 'IN',
                '+55': 'BR',
                '+61': 'AU',
                '+7': 'RU',
                '+39': 'IT',
                '+34': 'ES',
                '+31': 'NL',
                '+41': 'CH',
                '+46': 'SE',
                '+47': 'NO',
                '+45': 'DK',
                '+358': 'FI',
                '+32': 'BE',
                '+43': 'AT',
                '+48': 'PL',
                '+420': 'CZ',
                '+36': 'HU',
                '+351': 'PT',
                '+30': 'GR',
                '+90': 'TR',
                '+972': 'IL',
                '+971': 'AE',
                '+966': 'SA',
                '+65': 'SG',
                '+60': 'MY',
                '+66': 'TH',
                '+84': 'VN',
                '+62': 'ID',
                '+63': 'PH',
                '+82': 'KR',
                '+886': 'TW',
                '+852': 'HK',
                '+853': 'MO',
                '+52': 'MX',
                '+54': 'AR',
                '+56': 'CL',
                '+57': 'CO',
                '+51': 'PE',
                '+58': 'VE',
                '+27': 'ZA',
                '+20': 'EG',
                '+234': 'NG',
                '+254': 'KE',
                '+212': 'MA',
                '+213': 'DZ'
            };
            
            return mapping[dialingCode] || 'US';
        }
    };

    // Auto-initialize
    PhoneFormattingFix.init();

    // Export for debugging
    window.PhoneFormattingFix = PhoneFormattingFix;

})(window, document); 