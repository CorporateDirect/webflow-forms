# Country Dropdown Debugging Guide

## Issues Identified in webflow-forms.js

### 1. **Missing Event Handler Methods**
The original code references `this.attachSearchableEvents()` but this method is incomplete or missing critical parts.

**Lines affected:** 1072, 1181-1300 (estimated from grep results)

**Fix:** Complete the `attachSearchableEvents` method implementation.

### 2. **Complex DOM Manipulation Without Error Handling**
The `createSearchableCountrySelect` function performs complex DOM operations without proper error handling.

**Lines affected:** 972-1070

**Issues:**
- No validation of DOM operations
- Silent failures when elements can't be created
- Missing fallback mechanisms

### 3. **Race Conditions in Country Data Loading**
The `getCountryCodes` function may not handle libphonenumber loading states properly.

**Lines affected:** 50-343

**Issues:**
- No check if libphonenumber is fully loaded
- Potential timing issues with async imports

### 4. **Incomplete Error Recovery**
When country dropdown creation fails, there's no graceful fallback.

## Quick Fixes for Your Current Code

### Fix 1: Add Error Handling to setupCountryCodeSelect

Replace lines 943-951 with:

```javascript
setupCountryCodeSelect: function(field) {
    console.log('Setting up country code select for:', field.id || field.name);
    
    // Validate the field
    if (!field || field.tagName !== 'SELECT') {
        console.error('Invalid field passed to setupCountryCodeSelect:', field);
        return;
    }

    try {
        // Check if searchable option is enabled
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
```

### Fix 2: Add Validation to getCountryCodes

Add this check at the beginning of the `getCountryCodes` function (after line 52):

```javascript
// Check if libphonenumber is properly loaded
if (typeof getCountries !== 'function' || typeof getCountryCallingCode !== 'function') {
    console.warn('libphonenumber not fully loaded, using fallback data');
    return [
        { name: 'United States', countryCode: '+1', isoCode: 'US', flag: this.getCountryFlag('US') },
        { name: 'United Kingdom', countryCode: '+44', isoCode: 'GB', flag: this.getCountryFlag('GB') }
    ];
}
```

### Fix 3: Fix the attachSearchableEvents Method

The current implementation is incomplete. Add this complete method:

```javascript
attachSearchableEvents: function(searchInput, dropdownList, hiddenSelect, countries, originalField) {
    console.log('Attaching searchable events');
    
    try {
        // Show dropdown on focus
        searchInput.addEventListener('focus', () => {
            dropdownList.style.display = 'block';
            this.filterCountryOptions('', dropdownList, countries);
        });
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !dropdownList.contains(e.target)) {
                dropdownList.style.display = 'none';
            }
        });
        
        // Filter options as user types
        searchInput.addEventListener('input', (e) => {
            this.filterCountryOptions(e.target.value, dropdownList, countries);
            dropdownList.style.display = 'block';
        });
        
        // Add click handlers to dropdown options
        dropdownList.addEventListener('click', (e) => {
            const option = e.target.closest('[data-country-option="true"]');
            if (option) {
                this.selectCountryOption(option, searchInput, hiddenSelect, dropdownList, originalField);
            }
        });
        
    } catch (error) {
        console.error('Error attaching searchable events:', error);
    }
},
```

### Fix 4: Add Missing selectCountryOption Method

Add this method after the `attachSearchableEvents` method:

```javascript
selectCountryOption: function(option, searchInput, hiddenSelect, dropdownList, originalField) {
    try {
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
        
        // Trigger change event
        const changeEvent = new Event('change', { bubbles: true });
        hiddenSelect.dispatchEvent(changeEvent);
        
    } catch (error) {
        console.error('Error selecting country option:', error);
    }
},
```

## Testing Your Fixes

1. **Open Browser Developer Tools**
2. **Load your page with country dropdowns**
3. **Check Console for errors**
4. **Look for these log messages:**
   - "Setting up country code select for: [field-name]"
   - "Creating searchable country select" or "Creating standard country select"
   - "Countries loaded: [number] total"

## Common Issues and Solutions

### Issue: "WebflowForms is not defined"
**Solution:** Ensure the script is loaded before trying to use it:

```html
<script src="dist/webflow-forms.min.js"></script>
<script>
// Wait for the library to load
document.addEventListener('DOMContentLoaded', function() {
    if (typeof WebflowForms !== 'undefined') {
        console.log('WebflowForms loaded successfully');
    } else {
        console.error('WebflowForms failed to load');
    }
});
</script>
```

### Issue: Country dropdown appears empty
**Solution:** Check if libphonenumber data is loading properly:

```javascript
// Debug country data
console.log('Available countries:', WebflowForms.getCountryCodes());
```

### Issue: Searchable dropdown not working
**Solution:** Ensure the HTML structure is correct:

```html
<form data-name="your-form">
    <select data-country-code="true" data-country-searchable="true" name="country">
        <option value="" disabled>Select a country...</option>
    </select>
</form>
```

## Performance Improvements

1. **Add Debouncing to Search Input:**
```javascript
// Add this to the input event listener
let debounceTimer;
searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        this.filterCountryOptions(e.target.value, dropdownList, countries);
    }, 150);
});
```

2. **Use Virtual Scrolling for Large Lists** (if needed)
3. **Cache DOM queries**
4. **Use event delegation instead of individual listeners**

## Next Steps

1. Apply the fixes above to your `webflow-forms.js` file
2. Test with the provided debug HTML file
3. Check browser console for any remaining errors
4. Verify that both standard and searchable country dropdowns work
5. Test phone number integration if applicable

If you're still experiencing issues after applying these fixes, the problem might be in the build process or in how the library is being loaded in your specific environment. 